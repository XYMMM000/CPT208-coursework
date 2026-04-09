import { useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { firestoreDb } from "../lib/firebase";

const CREATED_ROUTES_STORAGE_KEY = "climbquest_created_routes";
const styleTagOptions = ["Balance", "Power", "Endurance", "Technique"];
const levelOptions = ["Beginner", "Intermediate", "Advanced"];

function getDifficultyMeta(difficulty) {
  if (difficulty === "Easy") return { grade: "V0-V1", toneClass: "cq-difficulty-easy" };
  if (difficulty === "Medium") return { grade: "V2-V4", toneClass: "cq-difficulty-medium" };
  return { grade: "V5+", toneClass: "cq-difficulty-hard" };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pointsToSvgString(points) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function distanceBetweenPoints(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function simplifyPoints(points, minDistance = 0.7) {
  if (points.length <= 2) return points;

  const simplified = [points[0]];
  for (let index = 1; index < points.length; index += 1) {
    const prevPoint = simplified[simplified.length - 1];
    const currentPoint = points[index];
    if (distanceBetweenPoints(prevPoint, currentPoint) >= minDistance) {
      simplified.push(currentPoint);
    }
  }

  return simplified;
}

function smoothClosedPolygon(points, iterations = 1) {
  // Chaikin-like corner cutting for smoother contour edges.
  // Works best for closed polygons with at least 4 points.
  if (!Array.isArray(points) || points.length < 4) return points;

  let current = points;
  for (let round = 0; round < iterations; round += 1) {
    const next = [];
    for (let index = 0; index < current.length; index += 1) {
      const p0 = current[index];
      const p1 = current[(index + 1) % current.length];

      const q = {
        x: Number((0.75 * p0.x + 0.25 * p1.x).toFixed(2)),
        y: Number((0.75 * p0.y + 0.25 * p1.y).toFixed(2))
      };
      const r = {
        x: Number((0.25 * p0.x + 0.75 * p1.x).toFixed(2)),
        y: Number((0.25 * p0.y + 0.75 * p1.y).toFixed(2))
      };

      next.push(q, r);
    }

    // Keep point count under control for performance on mobile.
    current = simplifyPoints(next, 0.45);
    if (current.length > 64) {
      current = current.filter((_, idx) => idx % 2 === 0);
    }
  }

  return current;
}

function toLightweightLocalRoute(route) {
  return {
    id: route.id,
    routeName: route.routeName,
    difficulty: route.difficulty,
    styleTags: route.styleTags,
    description: route.description,
    suitableFor: route.suitableFor,
    holdContours: route.holdContours,
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
  const [currentHoldPoints, setCurrentHoldPoints] = useState([]);

  const [errors, setErrors] = useState({});
  const [annotationMessage, setAnnotationMessage] = useState("");
  const [submitFeedback, setSubmitFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState("idle");
  const [isTracing, setIsTracing] = useState(false);
  const traceLastPointRef = useRef(null);

  const previewTitle = formData.routeName.trim() || "Your New Route";
  const previewDifficulty = formData.difficulty || "Select difficulty";
  const previewDifficultyMeta =
    formData.difficulty ? getDifficultyMeta(formData.difficulty) : null;
  const previewStyle = formData.styleTags.join(", ") || "No style tags yet";
  const previewDescription =
    formData.description.trim() ||
    "Add a short description to help climbers understand this route.";
  const previewLevel = useMemo(() => formData.suitableFor, [formData.suitableFor]);

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
      setAnnotationMessage("");
      setSubmitFeedback({ type: "", message: "" });
    };
    reader.readAsDataURL(file);
  }

  function getRelativePointFromPointerEvent(event) {
    if (!formData.imageDataUrl) return;

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

  function handleWallPointerDown(event) {
    if (!formData.imageDataUrl) return;
    setIsTracing(true);
    traceLastPointRef.current = null;

    // Pointer capture keeps drawing stable even if finger moves quickly.
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    addPointToCurrentHold(getRelativePointFromPointerEvent(event));
  }

  function handleWallPointerMove(event) {
    if (!isTracing || !formData.imageDataUrl) return;

    const point = getRelativePointFromPointerEvent(event);
    const lastPoint = traceLastPointRef.current;

    // Sample points only when movement is enough, avoiding noisy duplicates.
    if (!lastPoint || distanceBetweenPoints(lastPoint, point) >= 0.6) {
      addPointToCurrentHold(point);
    }
  }

  function handleWallPointerUp(event) {
    setIsTracing(false);
    traceLastPointRef.current = null;
    if (event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function finishCurrentHold() {
    if (currentHoldPoints.length < 3) {
      setAnnotationMessage("Add at least 3 points to finish one hold contour.");
      return;
    }

    const simplifiedPoints = simplifyPoints(currentHoldPoints);
    const normalizedPoints =
      simplifiedPoints.length >= 4 ? smoothClosedPolygon(simplifiedPoints, 1) : simplifiedPoints;

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
    setAnnotationMessage("Hold contour saved with smoothing. Start tracing a new hold.");
  }

  function undoLastPoint() {
    setCurrentHoldPoints((prev) => prev.slice(0, -1));
  }

  function clearCurrentHold() {
    setCurrentHoldPoints([]);
    setAnnotationMessage("");
  }

  function clearAllHolds() {
    setCurrentHoldPoints([]);
    setHoldContours([]);
    setAnnotationMessage("");
  }

  function removeLastHold() {
    setHoldContours((prev) => prev.slice(0, -1));
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.routeName.trim()) {
      nextErrors.routeName = "Route name is required.";
    }
    if (!formData.difficulty.trim()) {
      nextErrors.difficulty = "Difficulty is required.";
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
      holdContours,
      createdAt: new Date().toISOString()
    };

    const lightweightLocalRoute = toLightweightLocalRoute(newRoute);

    const firestoreRoute = {
      routeName: newRoute.routeName,
      difficulty: newRoute.difficulty,
      styleTags: newRoute.styleTags,
      description: newRoute.description,
      suitableFor: newRoute.suitableFor,
      creatorName:
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "Anonymous Climber",
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

  return (
    <section className="cq-create-page">
      <header className="cq-create-header">
        <p className="cq-page-eyebrow">Create</p>
        <h2>Build your own climbing route</h2>
        <p>Tap holds on the wall photo to create contour-style selection masks.</p>
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

        <label className="cq-field">
          <span>Upload climbing wall image (optional)</span>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        {formData.imageDataUrl && (
          <section className="cq-wall-editor" aria-label="Wall hold contour annotation editor">
            <div className="cq-wall-editor-head">
              <p>Tap or press-and-drag around one hold edge, then press Finish Current Hold.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="cq-reset-btn" onClick={finishCurrentHold}>
                  Finish Current Hold
                </button>
                <button type="button" className="cq-reset-btn" onClick={undoLastPoint}>
                  Undo Point
                </button>
                <button type="button" className="cq-reset-btn" onClick={clearCurrentHold}>
                  Clear Current
                </button>
                <button type="button" className="cq-reset-btn" onClick={removeLastHold}>
                  Undo Last
                </button>
                <button type="button" className="cq-reset-btn" onClick={clearAllHolds}>
                  Clear All
                </button>
              </div>
            </div>

            {annotationMessage && <p className="cq-hold-count">{annotationMessage}</p>}
            {isTracing && <p className="cq-hold-count">Tracing hold contour...</p>}

            <div
              className="cq-wall-image-wrap"
              onPointerDown={handleWallPointerDown}
              onPointerMove={handleWallPointerMove}
              onPointerUp={handleWallPointerUp}
              onPointerCancel={handleWallPointerUp}
              role="button"
              tabIndex={0}
              style={{ touchAction: "none" }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                }
              }}
            >
              {/* Base layer: original wall photo remains visible. */}
              <img className="cq-wall-image" src={formData.imageDataUrl} alt="Uploaded climbing wall" />

              {/*
                Overlay rendering model:
                1) Use an SVG layer with 0..100 coordinates (percentage-like space).
                2) Each hold is an irregular polygon contour (no circular marker fallback).
                3) Polygon style = thick white outline + bright semi-transparent fill + glow.
              */}
              <svg
                className="cq-wall-svg-overlay"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  {/* Subtle glow to make selected contours pop on textured wall photos. */}
                  <filter id="cqHoldMaskGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="0.85" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {holdContours.map((hold) => (
                  <g key={`hold-mask-${hold.id}`}>
                    {/* Glow stroke: helps contour stand out without tinting hold interior color. */}
                    <polygon
                      points={pointsToSvgString(hold.points)}
                      fill="none"
                      stroke="rgba(255,255,255,0.75)"
                      strokeWidth="1.9"
                      strokeLinejoin="round"
                      filter="url(#cqHoldMaskGlow)"
                    />

                    {/* Main contour: white outline only (no interior fill). */}
                    <polygon
                      points={pointsToSvgString(hold.points)}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.15"
                      strokeLinejoin="round"
                    />
                  </g>
                ))}

                {/* Current hold being traced: polyline + tiny anchors for precision. */}
                {currentHoldPoints.length > 0 && (
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

            <p className="cq-hold-count">
              Current hold points: <strong>{currentHoldPoints.length}</strong> | Selected holds:{" "}
              <strong>{holdContours.length}</strong>
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
          </section>
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
        <p className="cq-route-reason">Selected hold contours: {holdContours.length}</p>
      </article>
    </section>
  );
}
