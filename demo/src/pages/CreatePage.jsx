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
  if (difficulty === "Medium")
    return { grade: "V2-V4", toneClass: "cq-difficulty-medium" };
  return { grade: "V5+", toneClass: "cq-difficulty-hard" };
}

function getHoldLabel(type) {
  if (type === "Start") return "S";
  if (type === "Finish") return "F";
  if (type === "Foot") return "Ft";
  return "H";
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
  const [selectedHoldType, setSelectedHoldType] = useState("Hand");
  const [selectedHolds, setSelectedHolds] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitFeedback, setSubmitFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
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
      // Save uploaded wall image and reset old hold points to avoid mismatch.
      setFormData((prev) => ({
        ...prev,
        imageDataUrl: String(reader.result || "")
      }));
      setSelectedHolds([]);
      setSubmitFeedback({ type: "", message: "" });
    };
    reader.readAsDataURL(file);
  }

  function handleWallImageClick(event) {
    if (!formData.imageDataUrl) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // We store hold coordinates as percentages so they stay in the correct place on resize.
    const newHold = {
      id: Date.now() + Math.random(),
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      type: selectedHoldType
    };

    setSelectedHolds((prev) => [...prev, newHold]);
    setSubmitFeedback({ type: "", message: "" });
  }

  function removeHold(holdId) {
    setSelectedHolds((prev) => prev.filter((hold) => hold.id !== holdId));
  }

  function clearAllHolds() {
    setSelectedHolds([]);
  }

  function formatPoint(hold) {
    return `(${hold.x.toFixed(1)}%, ${hold.y.toFixed(1)}%)`;
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

    const newRoute = {
      id: Date.now(),
      routeName: formData.routeName.trim(),
      difficulty: formData.difficulty,
      styleTags: formData.styleTags,
      description: formData.description.trim(),
      suitableFor: formData.suitableFor,
      imageDataUrl: formData.imageDataUrl,
      selectedHolds,
      createdAt: new Date().toISOString()
    };

    // Payload sent to Firestore (required fields + optional extras for future use).
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
      // Performance note:
      // We intentionally do NOT upload imageDataUrl / selectedHolds to Firestore here.
      // Base64 image payloads are large and can slow writes and feed reads.
      // Those remain in localStorage for the DIY editor preview workflow.
    };

    try {
      // Save to Firestore collection: routes
      await addDoc(collection(firestoreDb, "routes"), firestoreRoute);

      // Keep localStorage save so existing community/local features still work.
      const existingRaw = localStorage.getItem(CREATED_ROUTES_STORAGE_KEY);
      let existingRoutes = [];
      try {
        existingRoutes = existingRaw ? JSON.parse(existingRaw) : [];
      } catch {
        existingRoutes = [];
      }
      const nextRoutes = [newRoute, ...existingRoutes];
      localStorage.setItem(CREATED_ROUTES_STORAGE_KEY, JSON.stringify(nextRoutes));

      setSubmitFeedback({
        type: "success",
        message: "Route saved to Firestore successfully."
      });
      setErrors({});
      setSelectedHolds([]);
      setFormData({
        routeName: "",
        difficulty: "",
        styleTags: [],
        description: "",
        suitableFor: "Beginner",
        imageDataUrl: ""
      });
    } catch (error) {
      console.error("Firestore save failed:", error);
      setSubmitFeedback({
        type: "error",
        message: "Could not save route to Firestore. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="cq-create-page">
      <header className="cq-create-header">
        <p className="cq-page-eyebrow">Create</p>
        <h2>Build your own climbing route</h2>
        <p>Create, preview, and save your custom line with hold-by-hold planning.</p>
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
          {errors.difficulty && (
            <small className="cq-field-error">{errors.difficulty}</small>
          )}
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
            <span>Select hold type</span>
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
          <section className="cq-wall-editor" aria-label="Wall hold editor">
            <div className="cq-wall-editor-head">
              <p>
                Tap on the wall image to add holds. Tap a marker to remove it.
              </p>
              <button type="button" className="cq-reset-btn" onClick={clearAllHolds}>
                Clear all holds
              </button>
            </div>

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
              <img
                className="cq-wall-image"
                src={formData.imageDataUrl}
                alt="Uploaded climbing wall"
              />

              {/* SVG overlay kept as MVP groundwork for future route highlight rendering. */}
              <svg
                className="cq-wall-svg-overlay"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {selectedHolds.map((hold, index) => (
                  <g key={`svg-point-${hold.id}`}>
                    <circle
                      cx={hold.x}
                      cy={hold.y}
                      r="1.8"
                      className={`cq-wall-svg-point cq-wall-svg-point-${hold.type.toLowerCase()}`}
                    />
                    <text x={hold.x} y={hold.y} dy="0.38em" className="cq-wall-svg-point-label">
                      {index + 1}
                    </text>
                  </g>
                ))}
              </svg>

              {selectedHolds.map((hold) => (
                <button
                  key={hold.id}
                  type="button"
                  className={`cq-hold-marker cq-hold-marker-${hold.type.toLowerCase()}`}
                  style={{ left: `${hold.x}%`, top: `${hold.y}%` }}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeHold(hold.id);
                  }}
                  aria-label={`Remove ${hold.type} hold`}
                >
                  {getHoldLabel(hold.type)}
                </button>
              ))}
            </div>

            <p className="cq-hold-count">
              Selected holds: <strong>{selectedHolds.length}</strong>
            </p>

            {/* Selected point list helps users verify all coordinates in MVP mode. */}
            <div className="cq-point-list-wrap" aria-label="Selected points list">
              {selectedHolds.length === 0 ? (
                <p className="cq-point-list-empty">No points selected yet.</p>
              ) : (
                <ul className="cq-point-list">
                  {selectedHolds.map((hold, index) => (
                    <li key={`point-item-${hold.id}`}>
                      #{index + 1} {hold.type} {formatPoint(hold)}
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

      {/* Live preview card updates as the user types. */}
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

        {formData.imageDataUrl && (
          <div className="cq-preview-wall-wrap">
            <img
              className="cq-create-preview-image"
              src={formData.imageDataUrl}
              alt="Uploaded route preview"
            />

            {selectedHolds.map((hold) => (
              <span
                key={`preview-${hold.id}`}
                className={`cq-hold-marker cq-hold-marker-${hold.type.toLowerCase()}`}
                style={{ left: `${hold.x}%`, top: `${hold.y}%` }}
              >
                {getHoldLabel(hold.type)}
              </span>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
