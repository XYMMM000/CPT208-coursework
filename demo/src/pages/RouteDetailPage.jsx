import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import wallPhotoA from "../assets/photo/8a4c9063-e850-4c6f-9245-36835a1d0c3d.png";
import wallPhotoB from "../assets/photo/c6ca442c-7547-46d8-8083-250e3c29a877.png";
import wallPhotoC from "../assets/photo/c9d8dd37-6805-4547-973a-69ebcf0663ae.png";

const ROUTE_INTERACTIONS_STORAGE_KEY = "climbquest_route_interactions";

const initialRoute = {
  title: "Blue Slab Balance Route",
  difficulty: "Medium",
  tags: ["Balance", "Technique", "Endurance"],
  description:
    "A smooth slab-focused route with controlled shifts, precise feet, and steady rhythm.",
  suitableFor: "Beginner",
  holdContours: [],
  smallHoldPoints: [],
  routePlan: null,
  imageDataUrl: "",
  wallPhotoIndex: 0,
  source: "Community",
  createdTimeLabel: "Unknown",
  creator: {
    name: "Eric",
    club: "NerdCave Climbing Club"
  },
  averageRating: 4.3,
  ratingCount: 26
};

const WALL_GALLERY_PHOTOS = [wallPhotoA, wallPhotoB, wallPhotoC];

// Hand-crafted contour templates aligned to visible holds in each wall photo.
const WALL_GALLERY_CONTOUR_BASE_PRESETS = [
  // Photo 1
  [
    {
      id: "p1-h1",
      points: [
        { x: 10, y: 58 },
        { x: 12, y: 55 },
        { x: 16, y: 54 },
        { x: 18, y: 57 },
        { x: 16.5, y: 61 },
        { x: 12.2, y: 61.5 }
      ]
    },
    {
      id: "p1-h2",
      points: [
        { x: 24.5, y: 41.2 },
        { x: 27, y: 39.5 },
        { x: 30.8, y: 40.8 },
        { x: 31.4, y: 44.5 },
        { x: 29, y: 47.2 },
        { x: 25.4, y: 45.7 }
      ]
    },
    {
      id: "p1-h3",
      points: [
        { x: 47.5, y: 53 },
        { x: 49.8, y: 50.8 },
        { x: 53.2, y: 51.3 },
        { x: 54, y: 54.4 },
        { x: 52.2, y: 57.2 },
        { x: 48.9, y: 56.8 }
      ]
    },
    {
      id: "p1-h4",
      points: [
        { x: 68.2, y: 44.2 },
        { x: 71.5, y: 42.8 },
        { x: 74.1, y: 44.2 },
        { x: 74.7, y: 47.4 },
        { x: 72.1, y: 49.2 },
        { x: 68.9, y: 48.1 }
      ]
    },
    {
      id: "p1-h5",
      points: [
        { x: 83.4, y: 27.5 },
        { x: 85.8, y: 25.9 },
        { x: 89.1, y: 26.9 },
        { x: 89.5, y: 30.3 },
        { x: 87, y: 32.4 },
        { x: 84.1, y: 31.2 }
      ]
    }
  ],
  // Photo 2
  [
    {
      id: "p2-h1",
      points: [
        { x: 16.3, y: 37.4 },
        { x: 18.8, y: 35.9 },
        { x: 21.2, y: 37.1 },
        { x: 21.4, y: 40.3 },
        { x: 18.9, y: 41.6 },
        { x: 16.5, y: 40.1 }
      ]
    },
    {
      id: "p2-h2",
      points: [
        { x: 31.5, y: 49 },
        { x: 34.1, y: 47.1 },
        { x: 37.3, y: 48.1 },
        { x: 37.7, y: 51.8 },
        { x: 35.4, y: 53.7 },
        { x: 32.4, y: 52.6 }
      ]
    },
    {
      id: "p2-h3",
      points: [
        { x: 57.4, y: 42.8 },
        { x: 60.1, y: 41.6 },
        { x: 62.9, y: 42.8 },
        { x: 63.4, y: 46.1 },
        { x: 61.1, y: 47.9 },
        { x: 58.1, y: 47.2 }
      ]
    },
    {
      id: "p2-h4",
      points: [
        { x: 70.8, y: 58.4 },
        { x: 73.5, y: 56.7 },
        { x: 76.8, y: 57.8 },
        { x: 77.2, y: 61.5 },
        { x: 74.9, y: 63.6 },
        { x: 71.6, y: 62.2 }
      ]
    },
    {
      id: "p2-h5",
      points: [
        { x: 88, y: 40.8 },
        { x: 90.8, y: 39.3 },
        { x: 94.1, y: 40.6 },
        { x: 94.5, y: 44.2 },
        { x: 92, y: 46.1 },
        { x: 88.7, y: 44.8 }
      ]
    }
  ],
  // Photo 3
  [
    {
      id: "p3-h1",
      points: [
        { x: 20.7, y: 27.9 },
        { x: 23.8, y: 26.4 },
        { x: 27, y: 27.5 },
        { x: 27.3, y: 31.2 },
        { x: 24.8, y: 33 },
        { x: 21.5, y: 31.6 }
      ]
    },
    {
      id: "p3-h2",
      points: [
        { x: 40.4, y: 36.8 },
        { x: 43.1, y: 34.9 },
        { x: 46.4, y: 35.7 },
        { x: 46.9, y: 39.3 },
        { x: 44.5, y: 41.6 },
        { x: 41.2, y: 40.3 }
      ]
    },
    {
      id: "p3-h3",
      points: [
        { x: 56.8, y: 46.7 },
        { x: 59.7, y: 44.6 },
        { x: 63.2, y: 45.6 },
        { x: 63.7, y: 49.5 },
        { x: 61, y: 51.8 },
        { x: 57.6, y: 50.4 }
      ]
    },
    {
      id: "p3-h4",
      points: [
        { x: 72.5, y: 39.1 },
        { x: 75.2, y: 37.8 },
        { x: 78, y: 39.1 },
        { x: 78.4, y: 42.4 },
        { x: 76, y: 44.2 },
        { x: 73, y: 43.2 }
      ]
    },
    {
      id: "p3-h5",
      points: [
        { x: 83.4, y: 59.3 },
        { x: 86.4, y: 57.2 },
        { x: 89.8, y: 58.2 },
        { x: 90.3, y: 62.2 },
        { x: 87.8, y: 64.1 },
        { x: 84.4, y: 63 }
      ]
    }
  ]
];

function buildDifficultyContourPresets(basePresets) {
  // Easy: shorter route (fewer selected holds).
  const easy = basePresets.map((photoHolds) => photoHolds.slice(0, 3));

  // Medium: balanced route (default set).
  const medium = basePresets.map((photoHolds) => photoHolds.slice(0, 5));

  // Hard: denser route with extra holds near tougher move zones.
  const hardExtras = [
    [
      {
        id: "p1-h6",
        points: [
          { x: 61.5, y: 31.4 },
          { x: 64.2, y: 29.5 },
          { x: 67.4, y: 30.2 },
          { x: 67.9, y: 33.6 },
          { x: 65.6, y: 35.8 },
          { x: 62.3, y: 34.9 }
        ]
      },
      {
        id: "p1-h7",
        points: [
          { x: 74.2, y: 63.4 },
          { x: 77.1, y: 61.9 },
          { x: 80.2, y: 63.1 },
          { x: 80.8, y: 66.6 },
          { x: 78.2, y: 68.9 },
          { x: 74.9, y: 67.6 }
        ]
      }
    ],
    [
      {
        id: "p2-h6",
        points: [
          { x: 44.1, y: 34.8 },
          { x: 47.2, y: 32.9 },
          { x: 50.5, y: 34.2 },
          { x: 51.1, y: 37.8 },
          { x: 48.2, y: 40.1 },
          { x: 44.8, y: 38.6 }
        ]
      },
      {
        id: "p2-h7",
        points: [
          { x: 80.8, y: 52.8 },
          { x: 83.4, y: 51.1 },
          { x: 86.8, y: 52.2 },
          { x: 87.1, y: 55.8 },
          { x: 84.9, y: 57.9 },
          { x: 81.6, y: 56.8 }
        ]
      }
    ],
    [
      {
        id: "p3-h6",
        points: [
          { x: 33.8, y: 57.5 },
          { x: 36.7, y: 55.8 },
          { x: 39.9, y: 57.1 },
          { x: 40.3, y: 60.8 },
          { x: 37.6, y: 62.7 },
          { x: 34.5, y: 61.3 }
        ]
      },
      {
        id: "p3-h7",
        points: [
          { x: 63.8, y: 64.4 },
          { x: 66.5, y: 62.6 },
          { x: 69.8, y: 63.8 },
          { x: 70.2, y: 67.3 },
          { x: 67.6, y: 69.4 },
          { x: 64.4, y: 68.2 }
        ]
      }
    ]
  ];

  const hard = basePresets.map((photoHolds, index) => [
    ...photoHolds.slice(0, 5),
    ...(hardExtras[index] || [])
  ]);

  return { Easy: easy, Medium: medium, Hard: hard };
}

const WALL_GALLERY_CONTOUR_PRESETS_BY_DIFFICULTY = buildDifficultyContourPresets(
  WALL_GALLERY_CONTOUR_BASE_PRESETS
);

function getDifficultyMeta(difficulty) {
  if (difficulty === "Easy") return { grade: "V0-V1", toneClass: "cq-difficulty-easy" };
  if (difficulty === "Medium") return { grade: "V2-V4", toneClass: "cq-difficulty-medium" };
  return { grade: "V5+", toneClass: "cq-difficulty-hard" };
}

function renderStarLine(value) {
  return "*".repeat(value) + "-".repeat(5 - value);
}

function formatCreatedTime(createdTime) {
  if (!createdTime) return "Unknown";
  const dateValue =
    typeof createdTime === "number" ? new Date(createdTime * 1000) : new Date(createdTime);
  if (Number.isNaN(dateValue.getTime())) return "Unknown";
  return dateValue.toLocaleDateString();
}

function pointsToSvgString(points) {
  if (!Array.isArray(points)) return "";
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function getRoutePlanPoints(plan) {
  if (!plan) return [];

  const points = [];
  if (plan.start) points.push({ ...plan.start, kind: "start", label: "S" });
  if (Array.isArray(plan.hands)) {
    plan.hands.forEach((point, index) => {
      points.push({ ...point, kind: "hand", label: `H${index + 1}` });
    });
  }
  if (Array.isArray(plan.feet)) {
    plan.feet.forEach((point, index) => {
      points.push({ ...point, kind: "foot", label: `F${index + 1}` });
    });
  }
  if (plan.finish) points.push({ ...plan.finish, kind: "finish", label: "TOP" });
  return points;
}

function buildPathFromContours(contours) {
  if (!Array.isArray(contours) || contours.length === 0) return "";
  const centers = contours
    .map((contour) => getPolygonCenter(contour.points))
    // Route path should visually go from lower holds to upper holds.
    .sort((a, b) => b.y - a.y);
  return centers.map((point) => `${point.x},${point.y}`).join(" ");
}

function buildPathPointsFromContours(contours) {
  if (!Array.isArray(contours) || contours.length === 0) return [];
  return contours
    .map((contour) => getPolygonCenter(contour.points))
    .sort((a, b) => b.y - a.y);
}

function buildPathFromHoldData(contours, smallHoldPoints) {
  const contourCenters = Array.isArray(contours)
    ? contours.map((contour) => getPolygonCenter(contour.points))
    : [];
  const tinyCenters = Array.isArray(smallHoldPoints)
    ? smallHoldPoints.map((point) => ({ x: point.x, y: point.y }))
    : [];
  const merged = [...contourCenters, ...tinyCenters].sort((a, b) => b.y - a.y);
  return merged.map((point) => `${point.x},${point.y}`).join(" ");
}

function buildPathPointsFromHoldData(contours, smallHoldPoints) {
  const contourCenters = Array.isArray(contours)
    ? contours.map((contour) => getPolygonCenter(contour.points))
    : [];
  const tinyCenters = Array.isArray(smallHoldPoints)
    ? smallHoldPoints.map((point) => ({ x: point.x, y: point.y }))
    : [];
  return [...contourCenters, ...tinyCenters].sort((a, b) => b.y - a.y);
}

function clampPercent(value) {
  return Math.min(99, Math.max(1, value));
}

function getPolygonCenter(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return { x: 0, y: 0 };
  }
  const centerX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const centerY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  return { x: centerX, y: centerY };
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getPixelColorScore(red, green, blue) {
  // Higher score means "more likely to be a colorful climbing hold",
  // lower score means "more likely to be gray/white wall background".
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const colorSpread =
    (Math.abs(red - green) + Math.abs(green - blue) + Math.abs(blue - red)) / (255 * 3);
  const brightness = (red + green + blue) / 765;

  let score = saturation * 1.45 + colorSpread * 0.95;

  // Penalize near-white wall region.
  if (brightness > 0.86 && saturation < 0.18) score -= 0.7;
  // Penalize near-gray region.
  if (colorSpread < 0.09 && saturation < 0.14) score -= 0.35;
  // Slightly penalize very dark pixels to avoid black volumes/holes overfitting.
  if (brightness < 0.1) score -= 0.18;

  return score;
}

function shiftContourByPercent(contour, deltaX, deltaY) {
  if (!Array.isArray(contour.points)) return contour;
  return {
    ...contour,
    points: contour.points.map((point) => ({
      x: Number(clampPercent(point.x + deltaX).toFixed(2)),
      y: Number(clampPercent(point.y + deltaY).toFixed(2))
    }))
  };
}

async function alignContoursToImageHolds(imageSrc, contours) {
  if (!imageSrc || !Array.isArray(contours) || contours.length === 0) return contours;

  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return contours;

  // Downscale for faster processing while preserving enough detail.
  const maxSize = 540;
  const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
  const width = Math.max(80, Math.round(image.width * scale));
  const height = Math.max(80, Math.round(image.height * scale));
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const maxShiftPercent = 3.2;

  return contours.map((contour) => {
    if (!Array.isArray(contour.points) || contour.points.length === 0) return contour;

    const center = getPolygonCenter(contour.points);
    const centerX = Math.round((center.x / 100) * (width - 1));
    const centerY = Math.round((center.y / 100) * (height - 1));
    const radius = Math.max(8, Math.round(Math.min(width, height) * 0.065));

    let bestX = centerX;
    let bestY = centerY;
    let bestScore = -Infinity;

    // Local search near contour center to find a more likely colorful hold pixel.
    for (let offsetY = -radius; offsetY <= radius; offsetY += 2) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 2) {
        const sampleX = centerX + offsetX;
        const sampleY = centerY + offsetY;
        if (sampleX < 0 || sampleY < 0 || sampleX >= width || sampleY >= height) continue;

        const pixelIndex = (sampleY * width + sampleX) * 4;
        const red = pixels[pixelIndex];
        const green = pixels[pixelIndex + 1];
        const blue = pixels[pixelIndex + 2];
        const score = getPixelColorScore(red, green, blue);

        if (score > bestScore) {
          bestScore = score;
          bestX = sampleX;
          bestY = sampleY;
        }
      }
    }

    const deltaXPercent = ((bestX - centerX) / width) * 100;
    const deltaYPercent = ((bestY - centerY) / height) * 100;
    const safeDeltaX = Math.max(-maxShiftPercent, Math.min(maxShiftPercent, deltaXPercent));
    const safeDeltaY = Math.max(-maxShiftPercent, Math.min(maxShiftPercent, deltaYPercent));

    return shiftContourByPercent(contour, safeDeltaX, safeDeltaY);
  });
}

function getCalibratedTemplatesForPhoto(routeState, photoIndex) {
  const difficultyKey =
    routeState.difficulty === "Hard"
      ? "Hard"
      : routeState.difficulty === "Easy"
        ? "Easy"
        : "Medium";

  // Use hard preset as the full template pool for snapping.
  const fullTemplatePool = WALL_GALLERY_CONTOUR_PRESETS_BY_DIFFICULTY.Hard[photoIndex] || [];
  const fallbackByDifficulty =
    WALL_GALLERY_CONTOUR_PRESETS_BY_DIFFICULTY[difficultyKey][photoIndex] || [];

  return {
    fullTemplatePool,
    fallbackByDifficulty
  };
}

function snapContoursToWallHolds(inputContours, templatePool) {
  if (!Array.isArray(inputContours) || inputContours.length === 0) return [];
  if (!Array.isArray(templatePool) || templatePool.length === 0) return inputContours;

  const usedTemplateIds = new Set();

  // For every user contour, find the nearest known hold template on this wall.
  // This guarantees rendered contours stay on visible hold locations.
  return inputContours.map((contour) => {
    const contourCenter = getPolygonCenter(contour.points);
    let bestTemplate = templatePool[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const template of templatePool) {
      if (usedTemplateIds.has(template.id)) continue;
      const templateCenter = getPolygonCenter(template.points);
      const distance = distanceBetween(contourCenter, templateCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestTemplate = template;
      }
    }

    usedTemplateIds.add(bestTemplate.id);
    return {
      id: contour.id || bestTemplate.id,
      points: bestTemplate.points
    };
  });
}

function getContoursForPhoto(routeState, photoIndex) {
  const hasUserContours =
    Array.isArray(routeState.holdContours) && routeState.holdContours.length > 0;
  const { fullTemplatePool, fallbackByDifficulty } = getCalibratedTemplatesForPhoto(
    routeState,
    photoIndex
  );

  // IMPORTANT: preserve original DIY contours exactly as user saved them.
  if (hasUserContours) {
    return routeState.holdContours;
  }

  // If route has no contour data yet, still show a calibrated route on real holds.
  // This keeps community previews consistent and avoids "floating in blank area".
  return fallbackByDifficulty;
}

function normalizeWallPhotoIndex(value) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value >= WALL_GALLERY_PHOTOS.length) return 0;
  return Math.floor(value);
}

function readRouteInteractions() {
  try {
    const raw = localStorage.getItem(ROUTE_INTERACTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRouteInteractions(data) {
  localStorage.setItem(ROUTE_INTERACTIONS_STORAGE_KEY, JSON.stringify(data));
}

export default function RouteDetailPage() {
  const location = useLocation();
  const routeFromState = location.state?.route;

  const resolvedInitialRoute = {
    ...initialRoute,
    ...routeFromState,
    createdTimeLabel:
      routeFromState?.createdTimeLabel || formatCreatedTime(routeFromState?.createdTime),
    creator: {
      ...initialRoute.creator,
      ...(routeFromState?.creator || {})
    }
  };
  const selectedWallPhotoIndex = normalizeWallPhotoIndex(
    Number(resolvedInitialRoute.wallPhotoIndex)
  );
  const routeKey = `${resolvedInitialRoute.title}::${resolvedInitialRoute.creator.name}`;
  const savedInteractions = readRouteInteractions()[routeKey];

  // Route state is kept in one object so interaction updates are easier to follow.
  const [routeState, setRouteState] = useState({
    ...resolvedInitialRoute,
    smallHoldPoints: Array.isArray(resolvedInitialRoute.smallHoldPoints)
      ? resolvedInitialRoute.smallHoldPoints
      : [],
    likes: savedInteractions?.likes ?? 18,
    isLiked: savedInteractions?.isLiked ?? false,
    isSaved: savedInteractions?.isSaved ?? false,
    isCompleted: savedInteractions?.isCompleted ?? false
  });
  const [userRating, setUserRating] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "Mia", text: "Great flow and very beginner-friendly beta." },
    { id: 2, author: "Leo", text: "Loved the finish move. Super satisfying route." }
  ]);

  const difficultyMeta = getDifficultyMeta(routeState.difficulty);
  const hasOriginalDIYData = useMemo(() => {
    return (
      (Array.isArray(routeState.holdContours) && routeState.holdContours.length > 0) ||
      (Array.isArray(routeState.smallHoldPoints) && routeState.smallHoldPoints.length > 0)
    );
  }, [routeState.holdContours, routeState.smallHoldPoints]);
  const displayedContourCount = useMemo(() => {
    return getContoursForPhoto(routeState, selectedWallPhotoIndex).length;
  }, [routeState, selectedWallPhotoIndex]);
  const displayedSmallPointCount = useMemo(() => {
    return Array.isArray(routeState.smallHoldPoints) ? routeState.smallHoldPoints.length : 0;
  }, [routeState.smallHoldPoints]);
  const ratingSummary = useMemo(() => {
    return `${routeState.averageRating.toFixed(1)} (${routeState.ratingCount} ratings)`;
  }, [routeState.averageRating, routeState.ratingCount]);
  const previewWallSrc = routeState.imageDataUrl || WALL_GALLERY_PHOTOS[selectedWallPhotoIndex];
  const baseContours = useMemo(
    () => getContoursForPhoto(routeState, selectedWallPhotoIndex),
    [routeState, selectedWallPhotoIndex]
  );
  const routePlanPoints = useMemo(
    () => getRoutePlanPoints(routeState.routePlan),
    [routeState.routePlan]
  );
  const routePlanLinePoints = useMemo(() => {
    if (!routeState.routePlan) return "";
    const sequence = [];
    if (routeState.routePlan.start) sequence.push(routeState.routePlan.start);
    if (Array.isArray(routeState.routePlan.hands)) sequence.push(...routeState.routePlan.hands);
    if (routeState.routePlan.finish) sequence.push(routeState.routePlan.finish);
    return sequence.map((point) => `${point.x},${point.y}`).join(" ");
  }, [routeState.routePlan]);
  const routePlanSequencePoints = useMemo(() => {
    if (!routeState.routePlan) return [];
    const sequence = [];
    if (routeState.routePlan.start) sequence.push(routeState.routePlan.start);
    if (Array.isArray(routeState.routePlan.hands)) sequence.push(...routeState.routePlan.hands);
    if (routeState.routePlan.finish) sequence.push(routeState.routePlan.finish);
    return sequence;
  }, [routeState.routePlan]);
  const contourPathPoints = useMemo(
    () => buildPathFromHoldData(baseContours, routeState.smallHoldPoints),
    [baseContours, routeState.smallHoldPoints]
  );
  const contourPathSequencePoints = useMemo(
    () => buildPathPointsFromHoldData(baseContours, routeState.smallHoldPoints),
    [baseContours, routeState.smallHoldPoints]
  );
  const shouldShowRoutePointMarkers = useMemo(() => {
    const source = String(routeState.source || "").toLowerCase();
    // In Community view, focus on the overall route path instead of individual point markers.
    return source.includes("discover");
  }, [routeState.source]);
  const shouldShowPathOnly = useMemo(() => {
    const source = String(routeState.source || "").toLowerCase();
    // Discover/AI recommendations should emphasize route flow only.
    return source.includes("ai") || source.includes("discover");
  }, [routeState.source]);
  const pathOnlyLinePoints = useMemo(() => {
    return routePlanLinePoints || contourPathPoints;
  }, [routePlanLinePoints, contourPathPoints]);
  const pathOnlyEndpoints = useMemo(() => {
    const sequence =
      routePlanSequencePoints.length > 0 ? routePlanSequencePoints : contourPathSequencePoints;
    if (sequence.length === 0) return { start: null, finish: null };
    return {
      start: sequence[0],
      finish: sequence[sequence.length - 1]
    };
  }, [routePlanSequencePoints, contourPathSequencePoints]);
  const [displayedContours, setDisplayedContours] = useState(baseContours);

  useEffect(() => {
    if (hasOriginalDIYData) {
      setDisplayedContours(baseContours);
      return undefined;
    }

    let cancelled = false;

    async function runImageAlignment() {
      try {
        const aligned = await alignContoursToImageHolds(previewWallSrc, baseContours);
        if (!cancelled) {
          setDisplayedContours(aligned);
        }
      } catch {
        if (!cancelled) {
          // Fallback safely to unaligned contours if image analysis fails.
          setDisplayedContours(baseContours);
        }
      }
    }

    runImageAlignment();
    return () => {
      cancelled = true;
    };
  }, [previewWallSrc, baseContours, hasOriginalDIYData]);

  function persistInteraction(nextState) {
    const previous = readRouteInteractions();
    writeRouteInteractions({
      ...previous,
      [routeKey]: {
        likes: nextState.likes,
        isLiked: nextState.isLiked,
        isSaved: nextState.isSaved,
        isCompleted: nextState.isCompleted
      }
    });
  }

  function updateRouteStateWithPersist(updater) {
    setRouteState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistInteraction(next);
      return next;
    });
  }

  function handleRate(starValue) {
    setUserRating(starValue);

    // Update displayed average immediately after user submits a rating.
    setRouteState((prev) => {
      const totalScore = prev.averageRating * prev.ratingCount + starValue;
      const nextCount = prev.ratingCount + 1;
      const nextAverage = totalScore / nextCount;

      return {
        ...prev,
        averageRating: Number(nextAverage.toFixed(2)),
        ratingCount: nextCount
      };
    });
  }

  function handleAddComment() {
    const cleaned = commentInput.trim();
    if (!cleaned) return;

    const newComment = {
      id: Date.now(),
      author: "You",
      text: cleaned
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentInput("");
  }

  function toggleLike() {
    updateRouteStateWithPersist((prev) => {
      const nextLiked = !prev.isLiked;
      const nextLikes = nextLiked ? prev.likes + 1 : Math.max(prev.likes - 1, 0);

      return {
        ...prev,
        isLiked: nextLiked,
        likes: nextLikes
      };
    });
  }

  function toggleSave() {
    updateRouteStateWithPersist((prev) => ({
      ...prev,
      isSaved: !prev.isSaved
    }));
  }

  function toggleCompleted() {
    updateRouteStateWithPersist((prev) => ({
      ...prev,
      isCompleted: !prev.isCompleted
    }));
  }

  return (
    <section className="cq-detail-page">
      <Link className="cq-secondary-btn cq-detail-back-btn" to="/community">
        Back to Community
      </Link>

      <header className="cq-detail-header">
        <p className="cq-page-eyebrow">Route Detail</p>
        <h2>{routeState.title}</h2>

        <div className="cq-detail-meta">
          <span className={`cq-route-difficulty ${difficultyMeta.toneClass}`}>
            {routeState.difficulty} | {difficultyMeta.grade}
          </span>
          <span className="cq-detail-rating-summary">{ratingSummary}</span>
        </div>

        <div className="cq-community-style-row">
          {routeState.tags.map((tag) => (
            <span key={tag} className="cq-route-style-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="cq-route-line cq-route-line-lg" aria-hidden="true">
          <span className="cq-route-line-node cq-route-line-node-start" />
          <span className="cq-route-line-segment" />
          <span className="cq-route-line-node cq-route-line-node-mid" />
          <span className="cq-route-line-segment" />
          <span className="cq-route-line-node cq-route-line-node-finish" />
        </div>

        <p className="cq-route-description">{routeState.description}</p>
      </header>

      <section className="cq-detail-card">
        <h3>Creator</h3>
        <p className="cq-detail-creator">
          {routeState.creator.name} - {routeState.creator.club}
        </p>
      </section>

      <section className="cq-detail-card">
        <h3>DIY Route Data</h3>
        <p className="cq-detail-creator">Suitable for: {routeState.suitableFor}</p>
        <p className="cq-detail-creator">Source: {routeState.source}</p>
        <p className="cq-detail-creator">Created: {routeState.createdTimeLabel}</p>
        <p className="cq-detail-creator">
          Hold selections: {displayedContourCount} contours + {displayedSmallPointCount} small points
        </p>
        {routeState.routePlan && shouldShowRoutePointMarkers && (
          <p className="cq-detail-creator">
            Route points: start + {routeState.routePlan.hands?.length || 0} hand points +{" "}
            {routeState.routePlan.feet?.length || 0} foot points + finish
          </p>
        )}
        {!shouldShowRoutePointMarkers && (
          <p className="cq-detail-creator">
            Showing a full route path generated from selected holds.
          </p>
        )}
      </section>

      <section className="cq-detail-card">
        <h3>{shouldShowPathOnly ? "Route Path Preview" : "Hold Contour Preview"}</h3>
        <p className="cq-detail-creator">
          {shouldShowPathOnly
            ? "Showing the matched wall photo with route flow only."
            : "Showing the matched wall photo for this route with aligned hold contours."}
        </p>

        <div className="cq-preview-wall-wrap">
          <img
            className="cq-create-preview-image"
            src={previewWallSrc}
            alt={
              routeState.imageDataUrl
                ? "Uploaded wall preview"
                : `Matched wall preview ${selectedWallPhotoIndex + 1}`
            }
          />

          {/* Render only the contours matched to this wall image. */}
          <svg
            className="cq-wall-svg-overlay"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {pathOnlyLinePoints && shouldShowPathOnly && (
              <>
                <polyline
                  points={pathOnlyLinePoints}
                  className="cq-route-path-glow"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={pathOnlyLinePoints}
                  className="cq-route-path-main"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {pathOnlyLinePoints && !shouldShowPathOnly && (
              <polyline
                points={pathOnlyLinePoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="0.55"
                strokeDasharray="1.4 1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {shouldShowPathOnly && pathOnlyEndpoints.start && (
              <>
                <circle
                  cx={pathOnlyEndpoints.start.x}
                  cy={pathOnlyEndpoints.start.y}
                  r="1.15"
                  className="cq-route-path-dot-start"
                />
                <text
                  x={pathOnlyEndpoints.start.x}
                  y={pathOnlyEndpoints.start.y - 1.7}
                  className="cq-route-path-dot-label"
                >
                  S
                </text>
              </>
            )}

            {shouldShowPathOnly && pathOnlyEndpoints.finish && (
              <>
                <circle
                  cx={pathOnlyEndpoints.finish.x}
                  cy={pathOnlyEndpoints.finish.y}
                  r="1.35"
                  className="cq-route-path-dot-finish"
                />
                <text
                  x={pathOnlyEndpoints.finish.x}
                  y={pathOnlyEndpoints.finish.y - 1.9}
                  className="cq-route-path-dot-label"
                >
                  TOP
                </text>
              </>
            )}

            {!shouldShowPathOnly &&
              displayedContours.map((hold, index) => (
                <polygon
                  key={`detail-hold-${hold.id || index}`}
                  points={pointsToSvgString(hold.points)}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.4"
                  strokeLinejoin="round"
                />
              ))}

            {!shouldShowPathOnly &&
              Array.isArray(routeState.smallHoldPoints) &&
              routeState.smallHoldPoints.map((point) => (
                <circle
                  key={`detail-small-point-${point.id || `${point.x}-${point.y}`}`}
                  cx={point.x}
                  cy={point.y}
                  r="0.8"
                  fill="rgba(203, 125, 35, 0.65)"
                  stroke="#ffffff"
                  strokeWidth="0.28"
                />
              ))}

            {shouldShowRoutePointMarkers &&
              !shouldShowPathOnly &&
              routePlanPoints.map((point) => (
              <g key={`route-plan-point-${point.label}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.kind === "finish" ? 1.2 : 1.05}
                  className={`cq-route-plan-point cq-route-plan-point-${point.kind}`}
                />
                <text x={point.x} y={point.y - 1.75} className="cq-route-plan-label">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {routeState.routePlan && shouldShowRoutePointMarkers && !shouldShowPathOnly && (
          <div className="cq-route-plan-legend" aria-label="Route point legend">
            <span>
              <i className="cq-route-plan-dot cq-route-plan-point-start" />
              Start
            </span>
            <span>
              <i className="cq-route-plan-dot cq-route-plan-point-hand" />
              Hands
            </span>
            <span>
              <i className="cq-route-plan-dot cq-route-plan-point-foot" />
              Feet
            </span>
            <span>
              <i className="cq-route-plan-dot cq-route-plan-point-finish" />
              Finish
            </span>
          </div>
        )}
      </section>

      <section className="cq-detail-card">
        <h3>Rate this route</h3>

        {/* 5-step rating input: clicking a button instantly updates rating state. */}
        <div className="cq-star-input" role="group" aria-label="5-star rating input">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`cq-star-btn ${star <= userRating ? "cq-star-btn-active" : ""}`}
              onClick={() => handleRate(star)}
              aria-label={`Rate ${star} stars`}
            >
              {star}
            </button>
          ))}
        </div>

        {userRating > 0 && (
          <p className="cq-detail-feedback">
            You rated this route {userRating}/5 ({renderStarLine(userRating)}).
          </p>
        )}
      </section>

      <section className="cq-detail-card">
        <h3>Beta comments</h3>

        <div className="cq-detail-comment-box">
          <textarea
            rows={3}
            placeholder="Share your route feedback..."
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
          />
          <button
            type="button"
            className="cq-primary-btn cq-detail-comment-btn"
            onClick={handleAddComment}
          >
            Post Beta
          </button>
        </div>

        <div className="cq-detail-comments-list">
          {comments.map((comment) => (
            <article key={comment.id} className="cq-detail-comment-item">
              <p className="cq-detail-comment-author">{comment.author}</p>
              <p>{comment.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cq-detail-actions" aria-label="Route actions">
        <button
          type="button"
          className={`cq-secondary-btn ${routeState.isLiked ? "cq-action-active" : ""}`}
          onClick={toggleLike}
        >
          {routeState.isLiked
            ? `Useful Beta (${routeState.likes})`
            : `Mark Useful (${routeState.likes})`}
        </button>

        <button
          type="button"
          className={`cq-secondary-btn ${routeState.isSaved ? "cq-action-active" : ""}`}
          onClick={toggleSave}
        >
          {routeState.isSaved ? "Saved for Session" : "Save for Session"}
        </button>

        <button
          type="button"
          className={`cq-primary-btn cq-detail-complete-btn ${
            routeState.isCompleted ? "cq-detail-complete-btn-active" : ""
          }`}
          onClick={toggleCompleted}
        >
          {routeState.isCompleted ? "Route Sent" : "I Sent This Route"}
        </button>
      </section>
    </section>
  );
}
