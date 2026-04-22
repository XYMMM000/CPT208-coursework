import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firestoreDb } from "../lib/firebase";
import wallPhotoA from "../assets/photo/8a4c9063-e850-4c6f-9245-36835a1d0c3d.png";
import wallPhotoB from "../assets/photo/c6ca442c-7547-46d8-8083-250e3c29a877.png";
import wallPhotoC from "../assets/photo/c9d8dd37-6805-4547-973a-69ebcf0663ae.png";

const CREATED_ROUTES_STORAGE_KEY = "climbquest_created_routes";
const WALL_GALLERY_PHOTOS = [wallPhotoA, wallPhotoB, wallPhotoC];
const styleTagOptions = ["Balance", "Power", "Endurance", "Technique"];
const levelOptions = ["Beginner", "Intermediate", "Advanced"];
const AUTO_CLOSE_DISTANCE_THRESHOLD = 2.2;
const TRACE_SAMPLE_MIN_DISTANCE = 0.12;
const MIN_ZOOM_SCALE = 1;
const MAX_ZOOM_SCALE = 3;
const ZOOM_STEP = 0.12;
const MOBILE_DEFAULT_ZOOM_SCALE = 1;
const DESKTOP_DEFAULT_ZOOM_SCALE = 1.65;
const ROUTE_POINT_SNAP_DISTANCE = 12;
const DOUBLE_TAP_MS = 260;
const ZOOM_TAP_MOVE_THRESHOLD = 7;
const ROUTE_POINT_TYPES = [
  { key: "start", label: "Start" },
  { key: "finish", label: "Finish" }
];
const WALL_ROUTE_ID_TO_INDEX = {
  "wall-1": 0,
  "wall-2": 1,
  "wall-3": 2
};

function getDifficultyMeta(difficulty) {
  if (difficulty === "Easy") return { grade: "V0-V1", toneClass: "cq-difficulty-easy" };
  if (difficulty === "Medium") return { grade: "V2-V4", toneClass: "cq-difficulty-medium" };
  return { grade: "V5+", toneClass: "cq-difficulty-hard" };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getDefaultZoomScale() {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 900;
  return isMobile ? MOBILE_DEFAULT_ZOOM_SCALE : DESKTOP_DEFAULT_ZOOM_SCALE;
}

function pointsToSvgString(points) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function distanceBetweenPoints(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getHoldCenter(hold) {
  if (Number.isFinite(hold.centerX) && Number.isFinite(hold.centerY)) {
    return { x: hold.centerX, y: hold.centerY };
  }

  if (!Array.isArray(hold.points) || hold.points.length === 0) {
    return { x: 50, y: 50 };
  }

  const centerX = hold.points.reduce((sum, point) => sum + point.x, 0) / hold.points.length;
  const centerY = hold.points.reduce((sum, point) => sum + point.y, 0) / hold.points.length;
  return { x: Number(centerX.toFixed(2)), y: Number(centerY.toFixed(2)) };
}

function getOrderedPathCenters(holdContours, smallHoldPoints, startPoint, finishPoint) {
  const contourCenters = Array.isArray(holdContours)
    ? holdContours.map((hold) => getHoldCenter(hold))
    : [];
  const pointCenters = Array.isArray(smallHoldPoints) ? smallHoldPoints : [];
  const centers = [...contourCenters, ...pointCenters];
  if (centers.length === 0) return [];

  const withoutEndpoints = centers.filter((center) => {
    const nearStart = startPoint ? distanceBetweenPoints(center, startPoint) < 0.9 : false;
    const nearFinish = finishPoint ? distanceBetweenPoints(center, finishPoint) < 0.9 : false;
    return !nearStart && !nearFinish;
  });

  if (startPoint && finishPoint) {
    const vectorX = finishPoint.x - startPoint.x;
    const vectorY = finishPoint.y - startPoint.y;
    const lengthSquared = vectorX * vectorX + vectorY * vectorY;

    if (lengthSquared > 0.001) {
      return withoutEndpoints.sort((a, b) => {
        const ta = ((a.x - startPoint.x) * vectorX + (a.y - startPoint.y) * vectorY) / lengthSquared;
        const tb = ((b.x - startPoint.x) * vectorX + (b.y - startPoint.y) * vectorY) / lengthSquared;
        return ta - tb;
      });
    }
  }

  if (startPoint) {
    return withoutEndpoints.sort(
      (a, b) => distanceBetweenPoints(a, startPoint) - distanceBetweenPoints(b, startPoint)
    );
  }

  if (finishPoint) {
    return withoutEndpoints.sort(
      (a, b) => distanceBetweenPoints(b, finishPoint) - distanceBetweenPoints(a, finishPoint)
    );
  }

  return withoutEndpoints.sort((a, b) => b.y - a.y);
}

function toRoutePathPoints(routePlan, holdContours, smallHoldPoints) {
  // Priority: if user already assigned route points, use them to estimate route flow.
  if (routePlan) {
    const start = routePlan.start ? { ...routePlan.start } : null;
    const finish = routePlan.finish ? { ...routePlan.finish } : null;
    const middlePoints = [...(routePlan.hands || []), ...(routePlan.feet || [])]
      .filter(Boolean)
      // Sort by y descending (bottom -> top) to approximate climbing direction.
      .sort((a, b) => b.y - a.y);

    const sequence = [start, ...middlePoints, finish].filter(Boolean);
    if (sequence.length > 0) return sequence;
  }

  // Fallback: use all selected centers (contours + small points).
  const contourCenters = Array.isArray(holdContours)
    ? holdContours.map((hold) => getHoldCenter(hold))
    : [];
  const pointCenters = Array.isArray(smallHoldPoints) ? smallHoldPoints : [];
  const centers = [...contourCenters, ...pointCenters];
  if (centers.length === 0) return [];
  return centers.sort((a, b) => b.y - a.y);
}

function getDifficultyThresholds(difficulty) {
  if (difficulty === "Easy") {
    return { maxJump: 20, totalMin: 16, totalMax: 85, scoreMin: 0, scoreMax: 22 };
  }
  if (difficulty === "Medium") {
    return { maxJump: 28, totalMin: 22, totalMax: 120, scoreMin: 18, scoreMax: 32 };
  }
  if (difficulty === "Hard") {
    return { maxJump: 36, totalMin: 26, totalMax: 170, scoreMin: 26, scoreMax: 999 };
  }
  return null;
}

function evaluateRouteSanity({ difficulty, routePlan, holdContours, smallHoldPoints }) {
  const warnings = [];
  const checks = [];

  const pathPoints = toRoutePathPoints(routePlan, holdContours, smallHoldPoints);
  const hasStart = Boolean(routePlan?.start);
  const hasFinish = Boolean(routePlan?.finish);

  // Rule set 1: structure reminders.
  if (!hasStart) warnings.push("Missing start point. Add a clear start hold.");
  if (!hasFinish) warnings.push("Missing finish point. Add a clear finish hold.");
  if (holdContours.length + smallHoldPoints.length < 3) {
    warnings.push("Only a few holds selected. Add more contours or small hold points.");
  }
  if (pathPoints.length < 3) warnings.push("Route path is too short. Set more route points or hold contours.");

  if (hasStart && hasFinish && routePlan.start.y <= routePlan.finish.y) {
    warnings.push("Start seems above finish. Usually start should be lower than finish.");
  }

  let totalLength = 0;
  let maxJump = 0;
  let averageJump = 0;
  let backwardMoves = 0;

  if (pathPoints.length >= 2) {
    const segmentLengths = [];

    for (let index = 1; index < pathPoints.length; index += 1) {
      const previous = pathPoints[index - 1];
      const current = pathPoints[index];
      const segment = distanceBetweenPoints(previous, current);
      segmentLengths.push(segment);
      totalLength += segment;
      maxJump = Math.max(maxJump, segment);

      // Climbing path should mostly go upward (y decreases).
      if (current.y > previous.y + 3) {
        backwardMoves += 1;
      }
    }

    averageJump = segmentLengths.reduce((sum, value) => sum + value, 0) / segmentLengths.length;
  }

  const verticalSpan =
    hasStart && hasFinish ? Math.abs(routePlan.start.y - routePlan.finish.y) : 0;
  const difficultyThresholds = getDifficultyThresholds(difficulty);

  // Rule set 1: movement continuity reminders.
  if (difficultyThresholds && maxJump > difficultyThresholds.maxJump) {
    warnings.push(
      `Big jump detected (${maxJump.toFixed(1)}). Consider adding intermediate holds.`
    );
  }

  if (difficultyThresholds && totalLength > 0) {
    if (totalLength < difficultyThresholds.totalMin) {
      warnings.push("Route feels very short. Consider extending the movement sequence.");
    } else if (totalLength > difficultyThresholds.totalMax) {
      warnings.push("Route feels very long. Consider simplifying or splitting into sections.");
    }
  }

  if (backwardMoves >= 2) {
    warnings.push("Path has multiple downward moves. Check if the route flow is intentional.");
  }

  // Rule set 3: difficulty consistency check.
  const difficultyScore = maxJump * 0.45 + averageJump * 0.35 + verticalSpan * 0.2;
  if (difficultyThresholds && difficulty) {
    if (difficultyScore < difficultyThresholds.scoreMin) {
      warnings.push(
        `Selected ${difficulty}, but movement looks easier. You can reduce grade or add complexity.`
      );
    } else if (difficultyScore > difficultyThresholds.scoreMax) {
      warnings.push(
        `Selected ${difficulty}, but movement looks harder. Consider raising grade or easing jumps.`
      );
    }
  }

  checks.push({ label: "Path points", value: String(pathPoints.length) });
  checks.push({ label: "Max jump", value: maxJump ? maxJump.toFixed(1) : "0" });
  checks.push({ label: "Total length", value: totalLength ? totalLength.toFixed(1) : "0" });
  checks.push({ label: "Difficulty score", value: difficultyScore ? difficultyScore.toFixed(1) : "0" });

  return {
    warnings,
    checks
  };
}

function isPointInsidePolygon(point, polygon) {
  if (!Array.isArray(polygon) || polygon.length < 3) return false;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersects) isInside = !isInside;
  }

  return isInside;
}

function shouldAutoCloseHold(points) {
  if (!Array.isArray(points) || points.length < 3) return false;
  const first = points[0];
  const last = points[points.length - 1];
  return distanceBetweenPoints(first, last) <= AUTO_CLOSE_DISTANCE_THRESHOLD;
}

function toLightweightLocalRoute(route) {
  return {
    id: route.id,
    routeName: route.routeName,
    difficulty: route.difficulty,
    styleTags: route.styleTags,
    description: route.description,
    suitableFor: route.suitableFor,
    imageDataUrl: route.imageDataUrl || "",
    wallPhotoIndex: route.wallPhotoIndex,
    holdContours: route.holdContours,
    smallHoldPoints: route.smallHoldPoints || [],
    routePlan: route.routePlan || null,
    createdAt: route.createdAt
  };
}

function saveRouteToLocalStorageInBackground(lightweightRoute) {
  const task = () => {
    const existingRaw = localStorage.getItem(CREATED_ROUTES_STORAGE_KEY);
    let existingRoutes = [];
    try {
      existingRoutes = existingRaw ? JSON.parse(existingRaw) : [];
    } catch {
      existingRoutes = [];
    }

    const nextRoutes = [lightweightRoute, ...existingRoutes];
    localStorage.setItem(CREATED_ROUTES_STORAGE_KEY, JSON.stringify(nextRoutes));
  };

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(task);
  } else {
    setTimeout(task, 0);
  }
}

export default function CreatePage() {
  const { currentUser } = useAuth();
  const { wallId } = useParams();

  const [formData, setFormData] = useState({
    routeName: "",
    difficulty: "",
    styleTags: [],
    description: "",
    suitableFor: "Beginner",
    imageDataUrl: ""
  });

  // Each item in holdContours is one selected hold mask region.
  const [holdContours, setHoldContours] = useState([]);
  const [smallHoldPoints, setSmallHoldPoints] = useState([]);
  const [currentHoldPoints, setCurrentHoldPoints] = useState([]);
  const [editorMode, setEditorMode] = useState("trace");
  const [activeRoutePointType, setActiveRoutePointType] = useState("start");
  const [routePointsByType, setRoutePointsByType] = useState({});
  const [pendingRoutePoint, setPendingRoutePoint] = useState(null);
  const [selectedWallPhotoIndex, setSelectedWallPhotoIndex] = useState(0);

  const [errors, setErrors] = useState({});
  const [annotationMessage, setAnnotationMessage] = useState("");
  const [submitFeedback, setSubmitFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState("idle");
  const [isTracing, setIsTracing] = useState(false);
  const [isZoomEditorOpen, setIsZoomEditorOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(getDefaultZoomScale());
  const traceLastPointRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const zoomWrapRef = useRef(null);
  const zoomPanRef = useRef({
    active: false,
    pointerId: null,
    startClientX: 0,
    startClientY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
    moved: false
  });

  const previewTitle = formData.routeName.trim() || "Your New Route";
  const previewDifficulty = formData.difficulty || "Select difficulty";
  const previewDifficultyMeta =
    formData.difficulty ? getDifficultyMeta(formData.difficulty) : null;
  const previewStyle = formData.styleTags.join(", ") || "No style tags yet";
  const previewDescription =
    formData.description.trim() ||
    "Add a short description to help climbers understand this route.";
  const previewLevel = useMemo(() => formData.suitableFor, [formData.suitableFor]);
  const activeWallImageSrc = formData.imageDataUrl || WALL_GALLERY_PHOTOS[selectedWallPhotoIndex];
  const routePlan = useMemo(() => {
    const start = routePointsByType.start ? { x: routePointsByType.start.x, y: routePointsByType.start.y } : null;
    const finish = routePointsByType.finish ? { x: routePointsByType.finish.x, y: routePointsByType.finish.y } : null;
    // Auto-generate middle path points from hold centers after users finish hold selection.
    const autoPathCenters = getOrderedPathCenters(holdContours, smallHoldPoints, start, finish);
    const hands = autoPathCenters.map((point) => ({ x: point.x, y: point.y }));
    const feet = [];

    if (!start && !finish && hands.length === 0) return null;
    return { start, finish, hands, feet };
  }, [routePointsByType, holdContours, smallHoldPoints]);
  const routePathLinePoints = useMemo(() => {
    if (!routePlan) return "";
    const sequence = [];
    if (routePlan.start) sequence.push(routePlan.start);
    if (Array.isArray(routePlan.hands) && routePlan.hands.length > 0) sequence.push(...routePlan.hands);
    if (routePlan.finish) sequence.push(routePlan.finish);
    return sequence.length >= 2 ? pointsToSvgString(sequence) : "";
  }, [routePlan]);
  const routeSanity = useMemo(
    () =>
      evaluateRouteSanity({
        difficulty: formData.difficulty,
        routePlan,
        holdContours,
        smallHoldPoints
      }),
    [formData.difficulty, routePlan, holdContours, smallHoldPoints]
  );

  useEffect(() => {
    // Sync editor wall with route param from the wall selection page.
    if (!wallId) return;
    const nextIndex = WALL_ROUTE_ID_TO_INDEX[wallId];
    if (typeof nextIndex === "number") {
      setSelectedWallPhotoIndex(nextIndex);
    }
  }, [wallId]);

  useEffect(() => {
    if (!isZoomEditorOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isZoomEditorOpen]);

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitFeedback({ type: "", message: "" });
  }

  function toggleStyleTag(tag) {
    setFormData((prev) => {
      const alreadySelected = prev.styleTags.includes(tag);
      const nextTags = alreadySelected
        ? prev.styleTags.filter((item) => item !== tag)
        : [...prev.styleTags, tag];

      return {
        ...prev,
        styleTags: nextTags
      };
    });
    setSubmitFeedback({ type: "", message: "" });
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        imageDataUrl: String(reader.result || "")
      }));

      // When a new wall image is uploaded, reset old hold masks.
      setCurrentHoldPoints([]);
      setHoldContours([]);
      setSmallHoldPoints([]);
      setRoutePointsByType({});
      setPendingRoutePoint(null);
      setEditorMode("trace");
      setAnnotationMessage("");
      setSubmitFeedback({ type: "", message: "" });
    };
    reader.readAsDataURL(file);
  }

  function handleUseBuiltInWall(index) {
    setSelectedWallPhotoIndex(index);
    // Switch back to built-in wall mode.
    setFormData((prev) => ({ ...prev, imageDataUrl: "" }));
    setCurrentHoldPoints([]);
    setHoldContours([]);
    setSmallHoldPoints([]);
    setRoutePointsByType({});
    setPendingRoutePoint(null);
    setEditorMode("trace");
    setAnnotationMessage("Switched wall photo. Start tracing again for accurate matching.");
  }

  function getRelativePointFromPointerEvent(event) {
    if (!activeWallImageSrc) return;

    // IMPORTANT: calculate pointer point relative to image container.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: Number(clamp(x, 1, 99).toFixed(2)),
      y: Number(clamp(y, 1, 99).toFixed(2))
    };
  }

  function addPointToCurrentHold(point) {
    if (!point) return;
    setCurrentHoldPoints((prev) => [...prev, point]);
    traceLastPointRef.current = point;
    setAnnotationMessage("");
  }

  function addSmallHoldPoint(point) {
    if (!point) return;
    const smallPoint = {
      id: `small-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      x: point.x,
      y: point.y
    };
    setSmallHoldPoints((prev) => [...prev, smallPoint]);
    setAnnotationMessage("Small hold point added.");
  }

  function getClosestHoldForPoint(point, maxSnapDistance = ROUTE_POINT_SNAP_DISTANCE) {
    if (!point || (holdContours.length === 0 && smallHoldPoints.length === 0)) return null;

    // First priority: if user taps inside a contour, use that hold directly.
    const insideMatch = holdContours.find((hold) => isPointInsidePolygon(point, hold.points));
    if (insideMatch) {
      return { hold: insideMatch, center: getHoldCenter(insideMatch), distance: 0 };
    }

    // Fallback: snap to nearest hold center.
    const snapCandidates = [
      ...holdContours.map((hold) => ({
        id: hold.id,
        center: getHoldCenter(hold),
        kind: "contour"
      })),
      ...smallHoldPoints.map((pointItem) => ({
        id: pointItem.id,
        center: { x: pointItem.x, y: pointItem.y },
        kind: "small-point"
      }))
    ];

    let closestCandidate = snapCandidates[0];
    let minDistance = distanceBetweenPoints(point, closestCandidate.center);

    for (const candidate of snapCandidates.slice(1)) {
      const distance = distanceBetweenPoints(point, candidate.center);
      if (distance < minDistance) {
        minDistance = distance;
        closestCandidate = candidate;
      }
    }

    if (minDistance > maxSnapDistance) {
      return null;
    }

    return {
      hold: { id: closestCandidate.id, kind: closestCandidate.kind },
      center: closestCandidate.center,
      distance: minDistance
    };
  }

  function assignRoutePointByTap(point) {
    const closest = getClosestHoldForPoint(point);
    if (!closest) {
      setPendingRoutePoint(null);
      setAnnotationMessage(
        `No nearby hold found. Move closer to a selected hold (snap radius ${ROUTE_POINT_SNAP_DISTANCE}%).`
      );
      return;
    }

    const activeType = ROUTE_POINT_TYPES.find((item) => item.key === activeRoutePointType);

    // Two-step confirmation:
    // first tap = preview candidate, second tap same hold = confirm assign.
    const isConfirmingSameHold =
      pendingRoutePoint &&
      pendingRoutePoint.type === activeRoutePointType &&
      pendingRoutePoint.holdId === closest.hold.id;

    if (!isConfirmingSameHold) {
      setPendingRoutePoint({
        type: activeRoutePointType,
        holdId: closest.hold.id,
        x: closest.center.x,
        y: closest.center.y
      });
      setAnnotationMessage(
        `${activeType?.label || "Route point"} preview ready. Tap the same hold again to confirm.`
      );
      return;
    }

    setRoutePointsByType((prev) => ({
      ...prev,
      [activeRoutePointType]: {
        holdId: closest.hold.id,
        x: closest.center.x,
        y: closest.center.y
      }
    }));
    setPendingRoutePoint(null);

    const nextType = activeRoutePointType === "start" ? "finish" : "start";
    setActiveRoutePointType(nextType);
    setAnnotationMessage(
      `${activeType?.label || "Route point"} confirmed. You can now set ${
        nextType === "start" ? "Start" : "Finish"
      }.`
    );
  }

  function beginZoomPan(event) {
    const wrap = zoomWrapRef.current;
    if (!wrap) return;

    zoomPanRef.current = {
      active: true,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startScrollLeft: wrap.scrollLeft,
      startScrollTop: wrap.scrollTop,
      moved: false
    };

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function updateZoomPan(event) {
    const wrap = zoomWrapRef.current;
    const pan = zoomPanRef.current;
    if (!wrap || !pan.active || pan.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - pan.startClientX;
    const deltaY = event.clientY - pan.startClientY;

    if (
      !pan.moved &&
      (Math.abs(deltaX) > ZOOM_TAP_MOVE_THRESHOLD || Math.abs(deltaY) > ZOOM_TAP_MOVE_THRESHOLD)
    ) {
      pan.moved = true;
    }

    if (pan.moved) {
      wrap.scrollLeft = pan.startScrollLeft - deltaX;
      wrap.scrollTop = pan.startScrollTop - deltaY;
    }
  }

  function endZoomPan(event) {
    const pan = zoomPanRef.current;
    if (pan.active && event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    zoomPanRef.current = {
      active: false,
      pointerId: null,
      startClientX: 0,
      startClientY: 0,
      startScrollLeft: 0,
      startScrollTop: 0,
      moved: false
    };
  }

  function handleWallPointerDown(event, options = {}) {
    const { zoomMode = false } = options;
    if (!activeWallImageSrc) return;

    // Mobile shortcut: in zoom editor, double-tap quickly toggles zoom level.
    if (
      zoomMode &&
      (editorMode === "route-points" || editorMode === "small-points") &&
      event.pointerType !== "mouse"
    ) {
      const now = Date.now();
      const elapsed = now - lastTapTimeRef.current;
      lastTapTimeRef.current = now;
      if (elapsed > 0 && elapsed <= DOUBLE_TAP_MS) {
        setZoomScale((prev) =>
          prev > (MOBILE_DEFAULT_ZOOM_SCALE + DESKTOP_DEFAULT_ZOOM_SCALE) / 2
            ? DESKTOP_DEFAULT_ZOOM_SCALE
            : MOBILE_DEFAULT_ZOOM_SCALE
        );
      }
    }

    const point = getRelativePointFromPointerEvent(event);
    if (!point) return;

    if (editorMode === "route-points") {
      if (zoomMode) {
        beginZoomPan(event);
        return;
      }

      assignRoutePointByTap(point);
      return;
    }

    if (editorMode === "small-points") {
      if (zoomMode) {
        beginZoomPan(event);
        return;
      }
      addSmallHoldPoint(point);
      return;
    }

    setIsTracing(true);
    traceLastPointRef.current = null;

    // Pointer capture keeps drawing stable even if finger moves quickly.
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    addPointToCurrentHold(point);
  }

  function handleWallPointerMove(event) {
    if (editorMode === "route-points" || editorMode === "small-points") {
      updateZoomPan(event);
      return;
    }

    if (!isTracing || !activeWallImageSrc || editorMode !== "trace") return;

    const point = getRelativePointFromPointerEvent(event);
    const lastPoint = traceLastPointRef.current;

    // Keep dense raw points to preserve the exact traced contour shape.
    if (!lastPoint || distanceBetweenPoints(lastPoint, point) >= TRACE_SAMPLE_MIN_DISTANCE) {
      addPointToCurrentHold(point);
    }
  }

  function handleWallPointerUp(event) {
    if (editorMode === "route-points") {
      const panMoved = zoomPanRef.current.moved;
      const point = getRelativePointFromPointerEvent(event);
      endZoomPan(event);
      if (!panMoved && point) {
        assignRoutePointByTap(point);
      }
      return;
    }

    if (editorMode === "small-points") {
      const panMoved = zoomPanRef.current.moved;
      const point = getRelativePointFromPointerEvent(event);
      endZoomPan(event);
      if (!panMoved && point) {
        addSmallHoldPoint(point);
      }
      return;
    }

    setIsTracing(false);
    traceLastPointRef.current = null;
    if (event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // Auto-finish only when the end point is close enough to the start point.
    // This avoids accidental submits when user is still outlining the hold.
    if (shouldAutoCloseHold(currentHoldPoints)) {
      finishCurrentHold({ silentIfTooFew: true, fromAuto: true });
    } else if (currentHoldPoints.length >= 3) {
      setAnnotationMessage(
        "Trace back near your start point to auto-finish, or press Finish Current Hold."
      );
    }
  }

  function handleWallPointerCancel(event) {
    if (editorMode === "route-points" || editorMode === "small-points") {
      endZoomPan(event);
      return;
    }

    setIsTracing(false);
    traceLastPointRef.current = null;
    if (event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function finishCurrentHold(options = {}) {
    const { silentIfTooFew = false, fromAuto = false } = options;

    if (currentHoldPoints.length < 3) {
      if (!silentIfTooFew) {
        setAnnotationMessage("Add at least 3 points to finish one hold contour.");
      }
      return;
    }

    // No smoothing/snapping: save exactly what the user traced.
    const normalizedPoints = currentHoldPoints;

    const centerX =
      normalizedPoints.reduce((sum, point) => sum + point.x, 0) / normalizedPoints.length;
    const centerY =
      normalizedPoints.reduce((sum, point) => sum + point.y, 0) / normalizedPoints.length;

    const newHold = {
      id: `${Date.now()}-${Math.random()}`,
      centerX: Number(centerX.toFixed(2)),
      centerY: Number(centerY.toFixed(2)),
      points: normalizedPoints
    };

    setHoldContours((prev) => [...prev, newHold]);
    setCurrentHoldPoints([]);
    setAnnotationMessage(
      fromAuto
        ? "Hold contour auto-saved. Raw traced shape kept."
        : "Hold contour saved. Raw traced shape kept."
    );
  }

  function undoLastPoint() {
    setCurrentHoldPoints((prev) => prev.slice(0, -1));
  }

  function clearCurrentHold() {
    setCurrentHoldPoints([]);
    setAnnotationMessage("");
  }

  function undoLastSmallHoldPoint() {
    setSmallHoldPoints((prev) => prev.slice(0, -1));
    setAnnotationMessage("Removed last small hold point.");
  }

  function clearSmallHoldPoints() {
    setSmallHoldPoints([]);
    setPendingRoutePoint(null);
    setAnnotationMessage("Small hold points cleared.");
  }

  function clearAllHolds() {
    setCurrentHoldPoints([]);
    setHoldContours([]);
    setSmallHoldPoints([]);
    setRoutePointsByType({});
    setPendingRoutePoint(null);
    setEditorMode("trace");
    setAnnotationMessage("");
  }

  function removeLastHold() {
    setHoldContours((prev) => {
      if (prev.length === 0) return prev;
      const removed = prev[prev.length - 1];
      if (pendingRoutePoint?.holdId === removed?.id) {
        setPendingRoutePoint(null);
      }
      if (removed?.id) {
        setRoutePointsByType((pointsPrev) => {
          const next = { ...pointsPrev };
          Object.keys(next).forEach((key) => {
            if (next[key]?.holdId === removed.id) {
              delete next[key];
            }
          });
          return next;
        });
      }
      return prev.slice(0, -1);
    });
  }

  function clearRoutePoints() {
    setRoutePointsByType({});
    setPendingRoutePoint(null);
    setAnnotationMessage("Route points cleared. You can assign start and finish again.");
  }

  function confirmPendingRoutePoint() {
    if (!pendingRoutePoint) return;
    const type = pendingRoutePoint.type;
    setRoutePointsByType((prev) => ({
      ...prev,
      [type]: {
        holdId: pendingRoutePoint.holdId,
        x: pendingRoutePoint.x,
        y: pendingRoutePoint.y
      }
    }));
    setPendingRoutePoint(null);
    const nextType = type === "start" ? "finish" : "start";
    setActiveRoutePointType(nextType);
    setAnnotationMessage(
      `${type === "start" ? "Start" : "Finish"} confirmed. Now place ${
        nextType === "start" ? "Start" : "Finish"
      }.`
    );
  }

  function cancelPendingRoutePoint() {
    setPendingRoutePoint(null);
    setAnnotationMessage("Preview cancelled. Tap a hold again to choose another point.");
  }

  function openZoomEditor() {
    setZoomScale(getDefaultZoomScale());
    setIsZoomEditorOpen(true);
  }

  function closeZoomEditor() {
    setIsZoomEditorOpen(false);
  }

  function nudgeZoom(delta) {
    setZoomScale((prev) =>
      Number(clamp(prev + delta, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE).toFixed(2))
    );
  }

  function handleZoomWheel(event) {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setZoomScale((prev) =>
      Number(clamp(prev + direction * ZOOM_STEP, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE).toFixed(2))
    );
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.routeName.trim()) {
      nextErrors.routeName = "Route name is required.";
    }
    if (!formData.difficulty.trim()) {
      nextErrors.difficulty = "Difficulty is required.";
    }
    if (holdContours.length === 0 && smallHoldPoints.length === 0) {
      nextErrors.holdContours =
        "Please add at least one hold contour or one small hold point.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitFeedback({ type: "", message: "" });
    setCloudSyncStatus("idle");

    const newRoute = {
      id: Date.now(),
      routeName: formData.routeName.trim(),
      difficulty: formData.difficulty,
      styleTags: formData.styleTags,
      description: formData.description.trim(),
      suitableFor: formData.suitableFor,
      imageDataUrl: formData.imageDataUrl,
      wallPhotoIndex: selectedWallPhotoIndex,
      holdContours,
      smallHoldPoints,
      routePlan,
      createdAt: new Date().toISOString()
    };

    const lightweightLocalRoute = toLightweightLocalRoute(newRoute);

    const firestoreRoute = {
      routeName: newRoute.routeName,
      difficulty: newRoute.difficulty,
      styleTags: newRoute.styleTags,
      description: newRoute.description,
      suitableFor: newRoute.suitableFor,
      imageDataUrl: newRoute.imageDataUrl || "",
      creatorName:
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "Anonymous Climber",
      holdContours: newRoute.holdContours,
      smallHoldPoints: newRoute.smallHoldPoints,
      routePlan: newRoute.routePlan,
      wallPhotoIndex: newRoute.wallPhotoIndex,
      createdTime: serverTimestamp()
    };

    // Fast save: local first, cloud sync in background.
    saveRouteToLocalStorageInBackground(lightweightLocalRoute);
    setSubmitFeedback({
      type: "success",
      message: "Route saved instantly on this device. Cloud sync is running..."
    });
    setCloudSyncStatus("syncing");

    // Reset immediately for faster UX.
    setErrors({});
    setCurrentHoldPoints([]);
    setHoldContours([]);
    setSmallHoldPoints([]);
    setRoutePointsByType({});
    setPendingRoutePoint(null);
    setEditorMode("trace");
    setAnnotationMessage("");
    setFormData({
      routeName: "",
      difficulty: "",
      styleTags: [],
      description: "",
      suitableFor: "Beginner",
      imageDataUrl: ""
    });
    setIsSubmitting(false);

    addDoc(collection(firestoreDb, "routes"), firestoreRoute)
      .then(() => {
        setCloudSyncStatus("synced");
        setSubmitFeedback({
          type: "success",
          message: "Route saved. Cloud sync completed."
        });
      })
      .catch((error) => {
        console.error("Firestore save failed:", error);
        setCloudSyncStatus("failed");
        setSubmitFeedback({
          type: "error",
          message:
            "Saved locally, but cloud sync failed. You can continue editing and retry later."
        });
      });
  }

  function renderWallCanvas({ zoomMode = false } = {}) {
    const zoomedWidthPercent = zoomMode ? `${Math.round(zoomScale * 100)}%` : "100%";
    const routePointEntries = Object.entries(routePointsByType).filter(([, point]) => Boolean(point));
    const holdCenterPoints = holdContours.map((hold) => ({
      id: hold.id,
      ...getHoldCenter(hold)
    }));
    const allSnapCenters = [
      ...holdCenterPoints.map((point) => ({ ...point, kind: "contour" })),
      ...smallHoldPoints.map((point) => ({ ...point, kind: "small-point" }))
    ];

    return (
      <div
        ref={zoomMode ? zoomWrapRef : null}
        className={`cq-wall-image-wrap ${zoomMode ? "cq-wall-image-wrap-zoom" : ""}`}
        onClick={
          !zoomMode
            ? () => {
                openZoomEditor();
              }
            : undefined
        }
        onWheel={zoomMode ? handleZoomWheel : undefined}
        role="button"
        tabIndex={0}
        style={{ cursor: zoomMode ? "crosshair" : "zoom-in" }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!zoomMode) {
              openZoomEditor();
            }
          }
        }}
      >
        <div
          className={`cq-wall-stage ${zoomMode ? "cq-wall-stage-zoom" : ""}`}
          onPointerDown={zoomMode ? (event) => handleWallPointerDown(event, { zoomMode: true }) : undefined}
          onPointerMove={zoomMode ? handleWallPointerMove : undefined}
          onPointerUp={zoomMode ? handleWallPointerUp : undefined}
          onPointerCancel={zoomMode ? handleWallPointerCancel : undefined}
          role="button"
          tabIndex={zoomMode ? 0 : -1}
          onKeyDown={(event) => {
            if (zoomMode && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
            }
          }}
          style={{
            width: zoomedWidthPercent,
            touchAction:
              zoomMode && (editorMode === "route-points" || editorMode === "small-points")
                ? "none"
                : zoomMode
                  ? "none"
                  : "auto"
          }}
        >
          {/* Base layer: original wall photo remains visible. */}
          <img
            className="cq-wall-image"
            src={activeWallImageSrc}
            alt={
              formData.imageDataUrl
                ? "Uploaded climbing wall"
                : `Built-in wall ${selectedWallPhotoIndex + 1}`
            }
          />

          {/* Quick action: still available, but tapping the wall now also opens zoom mode. */}
          {!zoomMode && (
            <button
              type="button"
              className="cq-secondary-btn cq-wall-zoom-trigger"
              onClick={(event) => {
                event.stopPropagation();
                openZoomEditor();
              }}
            >
              Zoom
            </button>
          )}

          {/*
            Overlay rendering model:
            1) Use an SVG layer with 0..100 coordinates (percentage-like space).
            2) Each hold is an irregular polygon contour (no circular marker fallback).
            3) Polygon style = thin white outline so hold color remains visible.
          */}
          <svg
            className="cq-wall-svg-overlay"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {holdContours.map((hold) => (
              <g key={`hold-mask-${hold.id}`}>
                <polygon
                  points={pointsToSvgString(hold.points)}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.42"
                  strokeLinejoin="round"
                />
              </g>
            ))}

            {/* Helper centers in route-point mode so mobile users can see tap targets clearly. */}
            {(editorMode === "route-points" || editorMode === "small-points") &&
              allSnapCenters.map((point) => (
                <circle
                  key={`hold-center-${point.id}`}
                  cx={point.x}
                  cy={point.y}
                  r={point.kind === "small-point" ? "0.7" : "0.88"}
                  fill={
                    point.kind === "small-point"
                      ? "rgba(203, 125, 35, 0.42)"
                      : "rgba(28, 121, 209, 0.35)"
                  }
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="0.28"
                />
              ))}

            {/* Explicit small-hold markers so tiny targets remain visible on mobile. */}
            {smallHoldPoints.map((point) => (
              <circle
                key={`small-hold-point-${point.id}`}
                cx={point.x}
                cy={point.y}
                r="0.95"
                fill="rgba(203, 125, 35, 0.62)"
                stroke="#ffffff"
                strokeWidth="0.3"
              />
            ))}

            {/* Auto path line: start -> auto centers -> finish. */}
            {routePathLinePoints && (
              <polyline
                points={routePathLinePoints}
                fill="none"
                stroke="rgba(255,255,255,0.92)"
                strokeWidth="0.62"
                strokeDasharray="2.4 1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Route point markers: user only sets Start / Finish. */}
            {routePointEntries.map(([key, point]) => {
              const label = ROUTE_POINT_TYPES.find((type) => type.key === key)?.label || key;
              let pointClassName = "cq-wall-svg-point-start";
              let textLabel = "S";

              if (key === "finish") {
                pointClassName = "cq-wall-svg-point-finish";
                textLabel = "TOP";
              }

              return (
                <g key={`route-point-${key}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={key === "finish" ? "1.35" : "1.1"}
                    className={`cq-wall-svg-point ${pointClassName}`}
                  />
                  <text x={point.x} y={point.y - 1.7} className="cq-wall-svg-point-label">
                    {textLabel}
                  </text>
                  <title>{label}</title>
                </g>
              );
            })}

            {/* Pending candidate for step-1 preview before final confirmation. */}
            {pendingRoutePoint && (
              <g>
                <circle
                  cx={pendingRoutePoint.x}
                  cy={pendingRoutePoint.y}
                  r="1.55"
                  fill="none"
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth="0.45"
                  strokeDasharray="1 0.8"
                />
              </g>
            )}

            {/* Current hold being traced: polyline + tiny anchors for precision. */}
            {editorMode === "trace" && currentHoldPoints.length > 0 && (
              <g>
                {currentHoldPoints.length >= 3 && (
                  <polygon
                    points={pointsToSvgString(currentHoldPoints)}
                    fill="none"
                    stroke="transparent"
                  />
                )}
                <polyline
                  points={pointsToSvgString(currentHoldPoints)}
                  fill="none"
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth="1.2"
                  strokeDasharray="2 1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {currentHoldPoints.map((point, index) => (
                  <circle
                    key={`current-point-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="0.7"
                    fill="#ffffff"
                    stroke="rgba(88, 232, 158, 0.95)"
                    strokeWidth="0.35"
                  />
                ))}
              </g>
            )}
          </svg>
        </div>
      </div>
    );
  }

  return (
    <section className="cq-create-page">
      <header className="cq-create-header">
        <Link className="cq-secondary-btn cq-detail-back-btn" to="/create">
          Back to Wall Selection
        </Link>
        <p className="cq-page-eyebrow">Create</p>
        <h2>Build your own climbing route</h2>
        <p>
          Tap holds on wall {selectedWallPhotoIndex + 1} to create contour-style selection masks.
        </p>
      </header>

      {submitFeedback.type === "success" && (
        <p className="cq-create-success" role="status">
          {submitFeedback.message}
        </p>
      )}

      {submitFeedback.type === "error" && (
        <p className="cq-create-error" role="alert">
          {submitFeedback.message}
        </p>
      )}

      {cloudSyncStatus === "syncing" && (
        <p className="cq-hold-count" role="status">
          Syncing to cloud...
        </p>
      )}

      <form className="cq-create-form" onSubmit={handleSubmit} noValidate>
        <section className="cq-diy-focus-banner" aria-label="DIY wall first workflow">
          <p className="cq-page-eyebrow">DIY Wall First</p>
          <h3>1. Choose Wall  2. Draw/Mark Holds  3. Set Start + Finish</h3>
          <p>
            For big holds, draw contours. For tiny holds, place a small point marker.
            Path points are auto-generated from both contour centers and small-hold points.
            You only need to place start and finish.
          </p>
        </section>

        <label className="cq-field">
          <span>Upload climbing wall image (optional)</span>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        <div className="cq-field">
          <span>Or use built-in wall photos (recommended for community matching)</span>
          <div className="cq-tag-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {WALL_GALLERY_PHOTOS.map((photoSrc, index) => (
              <button
                key={`built-in-wall-${index}`}
                type="button"
                className={`cq-tag-btn ${selectedWallPhotoIndex === index && !formData.imageDataUrl ? "cq-tag-btn-active" : ""}`}
                onClick={() => handleUseBuiltInWall(index)}
              >
                Wall {index + 1}
              </button>
            ))}
          </div>
        </div>

        {activeWallImageSrc && (
          <section className="cq-wall-editor" aria-label="Wall hold contour annotation editor">
            <div className="cq-wall-editor-head">
              <p>
                DIY editor: trace big holds, mark small holds as points, then place start/finish.
              </p>
              <div className="cq-tag-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                <button
                  type="button"
                  className={`cq-tag-btn ${editorMode === "trace" ? "cq-tag-btn-active" : ""}`}
                  onClick={() => {
                    setEditorMode("trace");
                    setPendingRoutePoint(null);
                  }}
                >
                  Trace Hold Contours
                </button>
                <button
                  type="button"
                  className={`cq-tag-btn ${editorMode === "small-points" ? "cq-tag-btn-active" : ""}`}
                  onClick={() => {
                    setEditorMode("small-points");
                    setPendingRoutePoint(null);
                    setAnnotationMessage("Small hold mode active. Tap to mark tiny holds.");
                  }}
                >
                  Mark Small Holds
                </button>
                <button
                  type="button"
                  className={`cq-tag-btn ${editorMode === "route-points" ? "cq-tag-btn-active" : ""}`}
                  onClick={() => {
                    if (holdContours.length === 0 && smallHoldPoints.length === 0) {
                      setAnnotationMessage(
                        "Create at least one hold contour or small-hold point before setting route points."
                      );
                      return;
                    }
                    setEditorMode("route-points");
                    setPendingRoutePoint(null);
                    setAnnotationMessage(
                      "Route point mode active. Tap to preview, then tap again to confirm."
                    );
                  }}
                >
                  Set Start / Finish
                </button>
              </div>
            </div>

            <div className="cq-tag-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              {ROUTE_POINT_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  className={`cq-tag-btn ${
                    activeRoutePointType === type.key ? "cq-tag-btn-active" : ""
                  }`}
                  onClick={() => {
                    setActiveRoutePointType(type.key);
                    setPendingRoutePoint(null);
                  }}
                  disabled={editorMode !== "route-points"}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="cq-reset-btn"
                onClick={finishCurrentHold}
                disabled={editorMode !== "trace"}
              >
                Finish Current Hold
              </button>
              <button
                type="button"
                className="cq-reset-btn"
                onClick={undoLastPoint}
                disabled={editorMode !== "trace"}
              >
                Undo Point
              </button>
              <button
                type="button"
                className="cq-reset-btn"
                onClick={clearCurrentHold}
                disabled={editorMode !== "trace"}
              >
                Clear Current
              </button>
              <button type="button" className="cq-reset-btn" onClick={removeLastHold}>
                Undo Last Hold
              </button>
              <button type="button" className="cq-reset-btn" onClick={undoLastSmallHoldPoint}>
                Undo Small Point
              </button>
              <button type="button" className="cq-reset-btn" onClick={clearSmallHoldPoints}>
                Clear Small Points
              </button>
              <button type="button" className="cq-reset-btn" onClick={clearAllHolds}>
                Clear All Holds
              </button>
              <button type="button" className="cq-reset-btn" onClick={clearRoutePoints}>
                Clear Route Points
              </button>
            </div>

            {annotationMessage && <p className="cq-hold-count">{annotationMessage}</p>}
            {isTracing && editorMode === "trace" && (
              <p className="cq-hold-count">Tracing hold contour...</p>
            )}
            {editorMode === "small-points" && (
              <p className="cq-hold-count">
                Small hold mode: tap tiny holds to add point markers.
              </p>
            )}
            {editorMode === "route-points" && (
              <p className="cq-hold-count">
                Active point type:{" "}
                <strong>{ROUTE_POINT_TYPES.find((type) => type.key === activeRoutePointType)?.label}</strong>.
                Drag to move wall, tap hold to preview, tap again to confirm. Middle path points are auto-generated.
              </p>
            )}

            {editorMode === "route-points" && pendingRoutePoint && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" className="cq-reset-btn" onClick={confirmPendingRoutePoint}>
                  Confirm Preview
                </button>
                <button type="button" className="cq-reset-btn" onClick={cancelPendingRoutePoint}>
                  Cancel Preview
                </button>
              </div>
            )}

            {renderWallCanvas()}

            {errors.holdContours && (
              <small className="cq-field-error">{errors.holdContours}</small>
            )}

            <p className="cq-hold-count">
              Current hold points: <strong>{currentHoldPoints.length}</strong> | Selected holds:{" "}
              <strong>{holdContours.length}</strong>
            </p>
            <p className="cq-hold-count">
              Small hold points: <strong>{smallHoldPoints.length}</strong>
            </p>

            <p className="cq-hold-count">
              Route points set:{" "}
              <strong>{Object.keys(routePointsByType).length}</strong>/2
            </p>

            <div className="cq-point-list-wrap" aria-label="Created hold contour list">
              {holdContours.length === 0 ? (
                <p className="cq-point-list-empty">No hold selected yet.</p>
              ) : (
                <ul className="cq-point-list">
                  {holdContours.map((hold, index) => (
                    <li key={`contour-item-${hold.id}`}>
                      Hold #{index + 1} contour at ({hold.centerX}%, {hold.centerY}%)
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="cq-point-list-wrap" aria-label="Small hold point list">
              {smallHoldPoints.length === 0 ? (
                <p className="cq-point-list-empty">No small hold points yet.</p>
              ) : (
                <ul className="cq-point-list">
                  {smallHoldPoints.map((point, index) => (
                    <li key={`small-point-item-${point.id}`}>
                      Small hold #{index + 1} at ({point.x}%, {point.y}%)
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="cq-point-list-wrap" aria-label="Selected route point list">
              {Object.keys(routePointsByType).length === 0 ? (
                <p className="cq-point-list-empty">No route points assigned yet.</p>
              ) : (
                <ul className="cq-point-list">
                  {ROUTE_POINT_TYPES.filter((type) => routePointsByType[type.key]).map((type) => (
                    <li key={`route-point-item-${type.key}`}>
                      {type.label}: hold center ({routePointsByType[type.key].x}%,
                      {" "}
                      {routePointsByType[type.key].y}%)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        <section className="cq-create-meta-card" aria-label="Route metadata form">
          <h3>Route Details</h3>

          <label className="cq-field">
            <span>Route name *</span>
            <input
              type="text"
              value={formData.routeName}
              onChange={(event) => updateField("routeName", event.target.value)}
              placeholder="e.g. Moonlight Traverse"
            />
            {errors.routeName && <small className="cq-field-error">{errors.routeName}</small>}
          </label>

          <label className="cq-field">
            <span>Difficulty *</span>
            <select
              value={formData.difficulty}
              onChange={(event) => updateField("difficulty", event.target.value)}
            >
              <option value="">Choose difficulty</option>
              <option value="Easy">Easy (V0-V1)</option>
              <option value="Medium">Medium (V2-V4)</option>
              <option value="Hard">Hard (V5+)</option>
            </select>
            {errors.difficulty && <small className="cq-field-error">{errors.difficulty}</small>}
          </label>

          <div className="cq-field">
            <span>Style tags</span>
            <div className="cq-tag-grid">
              {styleTagOptions.map((tag) => {
                const isActive = formData.styleTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`cq-tag-btn ${isActive ? "cq-tag-btn-active" : ""}`}
                    onClick={() => toggleStyleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="cq-field">
            <span>Description</span>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe the moves, pacing, and feeling of this route."
            />
          </label>

          <label className="cq-field">
            <span>Suitable for</span>
            <select
              value={formData.suitableFor}
              onChange={(event) => updateField("suitableFor", event.target.value)}
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="cq-route-check-panel" aria-label="Route sanity check reminders">
          <h3>Route Sanity Check</h3>
          <p className="cq-route-check-note">
            Quick reminder only. You can still submit, but these checks help improve route quality.
          </p>

          <div className="cq-route-check-metrics">
            {routeSanity.checks.map((item) => (
              <span key={item.label} className="cq-route-check-pill">
                {item.label}: <strong>{item.value}</strong>
              </span>
            ))}
          </div>

          {routeSanity.warnings.length === 0 ? (
            <p className="cq-route-check-ok">Looks good. No major route issues detected.</p>
          ) : (
            <ul className="cq-route-check-list">
              {routeSanity.warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Full-screen zoom editor: larger view for easier hold selection on mobile. */}
        {isZoomEditorOpen && activeWallImageSrc && (
          <div className="cq-wall-zoom-modal" role="dialog" aria-modal="true">
            <div className="cq-wall-zoom-panel">
              <div className="cq-wall-zoom-head">
                <p>Zoom Editor</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="cq-hold-count">{Math.round(zoomScale * 100)}%</span>
                  <button
                    type="button"
                    className="cq-secondary-btn"
                    onClick={() => nudgeZoom(-0.2)}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    className="cq-secondary-btn"
                    onClick={() => nudgeZoom(0.2)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="cq-secondary-btn"
                    onClick={() => setZoomScale(getDefaultZoomScale())}
                  >
                    Fit
                  </button>
                  <button type="button" className="cq-secondary-btn" onClick={closeZoomEditor}>
                    Done
                  </button>
                </div>
              </div>
              <p className="cq-hold-count">
                Use +/- (or wheel on desktop) to zoom. Drag to move wall. Tap Fit to reset.
              </p>
              {renderWallCanvas({ zoomMode: true })}
            </div>
          </div>
        )}

        <button type="submit" className="cq-primary-btn cq-create-submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving Route..." : "Submit Route"}
        </button>
      </form>

      <article className="cq-create-preview">
        <p className="cq-page-eyebrow">Live Preview</p>
        <div className="cq-route-top-row">
          <h3>{previewTitle}</h3>
          <span
            className={`cq-route-difficulty ${
              previewDifficultyMeta ? previewDifficultyMeta.toneClass : ""
            }`}
          >
            {previewDifficulty}
            {previewDifficultyMeta ? ` | ${previewDifficultyMeta.grade}` : ""}
          </span>
        </div>
        <span className="cq-route-style-tag">{previewStyle}</span>
        <div className="cq-route-line" aria-hidden="true">
          <span className="cq-route-line-node cq-route-line-node-start" />
          <span className="cq-route-line-segment" />
          <span className="cq-route-line-node cq-route-line-node-mid" />
          <span className="cq-route-line-segment" />
          <span className="cq-route-line-node cq-route-line-node-finish" />
        </div>
        <p className="cq-route-description">{previewDescription}</p>
        <p className="cq-route-reason">Suitable for: {previewLevel}</p>
        <p className="cq-route-reason">
          Selected holds: {holdContours.length} contours + {smallHoldPoints.length} small points
        </p>
        <p className="cq-route-reason">Route points configured: {Object.keys(routePointsByType).length}/2</p>
      </article>
    </section>
  );
}
