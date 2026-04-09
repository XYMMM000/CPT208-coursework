import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { firestoreDb } from "../lib/firebase";

const CREATED_ROUTES_STORAGE_KEY = "climbquest_created_routes";
const styleTagOptions = ["Balance", "Power", "Endurance", "Technique"];
const levelOptions = ["Beginner", "Intermediate", "Advanced"];
const holdTypeOptions = ["Hand", "Foot", "Start", "Finish"];

function getDifficultyMeta(difficulty) {
  if (difficulty === "Easy") return { grade: "V0-V1", toneClass: "cq-difficulty-easy" };
  if (difficulty === "Medium") return { grade: "V2-V4", toneClass: "cq-difficulty-medium" };
  return { grade: "V5+", toneClass: "cq-difficulty-hard" };
}

function getHoldPolygonColors(type) {
  if (type === "Foot") {
    return {
      fill: "rgba(37, 119, 207, 0.28)",
      previewStroke: "rgba(37, 119, 207, 0.85)",
      anchorFill: "rgba(37, 119, 207, 0.9)"
    };
  }
  if (type === "Start") {
    return {
      fill: "rgba(202, 127, 52, 0.28)",
      previewStroke: "rgba(202, 127, 52, 0.85)",
      anchorFill: "rgba(202, 127, 52, 0.9)"
    };
  }
  if (type === "Finish") {
    return {
      fill: "rgba(180, 74, 99, 0.28)",
      previewStroke: "rgba(180, 74, 99, 0.85)",
      anchorFill: "rgba(180, 74, 99, 0.9)"
    };
  }
  return {
    fill: "rgba(46, 157, 111, 0.28)",
    previewStroke: "rgba(46, 157, 111, 0.85)",
    anchorFill: "rgba(46, 157, 111, 0.9)"
  };
}

function pointsToSvgString(points) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function toLightweightLocalRoute(route) {
  return {
    id: route.id,
    routeName: route.routeName,
    difficulty: route.difficulty,
    styleTags: route.styleTags,
    description: route.description,
    suitableFor: route.suitableFor,
    holdPolygons: route.holdPolygons,
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

  // Polygon annotation states:
  // 1) currentHoldPoints = anchors user is currently clicking
  // 2) holdPolygons = confirmed holds (finished polygons)
  const [selectedHoldType, setSelectedHoldType] = useState("Hand");
  const [currentHoldPoints, setCurrentHoldPoints] = useState([]);
  const [holdPolygons, setHoldPolygons] = useState([]);

  const [errors, setErrors] = useState({});
  const [annotationMessage, setAnnotationMessage] = useState("");
  const [submitFeedback, setSubmitFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState("idle");

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

      // Reset polygons when image changes.
      setCurrentHoldPoints([]);
      setHoldPolygons([]);
      setAnnotationMessage("");
      setSubmitFeedback({ type: "", message: "" });
    };
    reader.readAsDataURL(file);
  }

  function handleWallImageClick(event) {
    if (!formData.imageDataUrl) return;

    // IMPORTANT: use image-wrap bounds so coordinates are image-relative.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newPoint = {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2))
    };

    setCurrentHoldPoints((prev) => [...prev, newPoint]);
    setAnnotationMessage("");
  }

  function clearCurrentHold() {
    setCurrentHoldPoints([]);
    setAnnotationMessage("");
  }

  function clearAllHolds() {
    setCurrentHoldPoints([]);
    setHoldPolygons([]);
    setAnnotationMessage("");
  }

  function finishCurrentHold() {
    if (currentHoldPoints.length < 3) {
      setAnnotationMessage("Add at least 3 points to finish one hold polygon.");
      return;
    }

    const newHold = {
      id: `${Date.now()}-${Math.random()}`,
      type: selectedHoldType,
      points: currentHoldPoints
    };

    setHoldPolygons((prev) => [...prev, newHold]);
    setCurrentHoldPoints([]);
    setAnnotationMessage("Hold polygon created. You can start drawing a new one.");
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
      holdPolygons,
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

    // Fast path:
    // 1) Save lightweight data locally first (non-blocking) so UI can finish quickly.
    // 2) Start Firestore sync in background.
    saveRouteToLocalStorageInBackground(lightweightLocalRoute);

    setSubmitFeedback({
      type: "success",
      message: "Route saved instantly on this device. Cloud sync is running..."
    });
    setCloudSyncStatus("syncing");

    // Reset form immediately for better mobile UX.
    setErrors({});
    setCurrentHoldPoints([]);
    setHoldPolygons([]);
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

    // Background cloud sync (does not block user interaction).
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
        <p>Create, annotate holds, and save your custom route.</p>
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
          <div className="cq-field">
            <span>Hold type for next polygon</span>
            <div className="cq-tag-grid cq-hold-type-grid">
              {holdTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`cq-tag-btn ${
                    selectedHoldType === type ? "cq-tag-btn-active" : ""
                  }`}
                  onClick={() => setSelectedHoldType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {formData.imageDataUrl && (
          <section className="cq-wall-editor" aria-label="Wall polygon annotation editor">
            <div className="cq-wall-editor-head">
              <p>Tap image to add anchors. Use Finish Hold to create one polygon.</p>
            </div>

            <div className="cq-tag-grid" style={{ marginTop: 10 }}>
              <button type="button" className="cq-tag-btn cq-tag-btn-active" onClick={finishCurrentHold}>
                Finish Hold
              </button>
              <button type="button" className="cq-tag-btn" onClick={clearCurrentHold}>
                Clear Current Hold
              </button>
              <button type="button" className="cq-tag-btn" onClick={clearAllHolds}>
                Clear All Holds
              </button>
            </div>

            {annotationMessage && (
              <p className="cq-hold-count" style={{ marginTop: 10 }}>
                {annotationMessage}
              </p>
            )}

            <div
              className="cq-wall-image-wrap"
              onClick={handleWallImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                }
              }}
            >
              <img className="cq-wall-image" src={formData.imageDataUrl} alt="Uploaded climbing wall" />

              {/*
                SVG overlay logic (beginner-friendly):
                1) All drawing uses 0..100 coordinates (percent-like system).
                2) Because points are saved as image-relative percentages, polygons stay aligned on resize.
                3) Saved holds are rendered as closed polygons.
                4) Current hold-in-progress is rendered as polyline + anchor points.
              */}
              <svg
                className="cq-wall-svg-overlay"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* Render all finished hold polygons */}
                {holdPolygons.map((hold, holdIndex) => {
                  const colors = getHoldPolygonColors(hold.type);
                  return (
                    <g key={`hold-polygon-${hold.id}`}>
                      <polygon
                        points={pointsToSvgString(hold.points)}
                        fill={colors.fill}
                        stroke="#ffffff"
                        strokeWidth="0.9"
                        strokeLinejoin="round"
                      />

                      {/* Visible anchor points for each finished hold */}
                      {hold.points.map((point, pointIndex) => (
                        <circle
                          key={`hold-anchor-${hold.id}-${pointIndex}`}
                          cx={point.x}
                          cy={point.y}
                          r="1.25"
                          fill={colors.anchorFill}
                          stroke="#ffffff"
                          strokeWidth="0.55"
                        />
                      ))}

                      {/* Small label index for each completed hold */}
                      {hold.points[0] && (
                        <text
                          x={hold.points[0].x}
                          y={hold.points[0].y}
                          dy="-1.6"
                          fill="#ffffff"
                          fontSize="2.5"
                          fontWeight="700"
                        >
                          H{holdIndex + 1}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Render current (unfinished) hold path */}
                {currentHoldPoints.length > 0 && (
                  <g>
                    <polyline
                      points={pointsToSvgString(currentHoldPoints)}
                      fill="none"
                      stroke={getHoldPolygonColors(selectedHoldType).previewStroke}
                      strokeWidth="0.75"
                      strokeDasharray="2 1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {currentHoldPoints.map((point, index) => (
                      <circle
                        key={`current-anchor-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r="1.35"
                        fill={getHoldPolygonColors(selectedHoldType).anchorFill}
                        stroke="#ffffff"
                        strokeWidth="0.6"
                      />
                    ))}
                  </g>
                )}
              </svg>
            </div>

            <p className="cq-hold-count">
              Current hold anchors: <strong>{currentHoldPoints.length}</strong> | Finished holds:{" "}
              <strong>{holdPolygons.length}</strong>
            </p>

            <div className="cq-point-list-wrap" aria-label="Created hold list">
              {holdPolygons.length === 0 ? (
                <p className="cq-point-list-empty">No finished holds yet.</p>
              ) : (
                <ul className="cq-point-list">
                  {holdPolygons.map((hold, index) => (
                    <li key={`hold-list-${hold.id}`}>
                      Hold #{index + 1} - {hold.type} - {hold.points.length} anchor points
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
        <p className="cq-route-reason">Annotated holds: {holdPolygons.length}</p>
      </article>
    </section>
  );
}
