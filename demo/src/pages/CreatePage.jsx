import { useMemo, useState } from "react";

const CREATED_ROUTES_STORAGE_KEY = "climbquest_created_routes";
const styleTagOptions = ["Balance", "Power", "Endurance", "Technique"];
const levelOptions = ["Beginner", "Intermediate", "Advanced"];

export default function CreatePage() {
  const [formData, setFormData] = useState({
    routeName: "",
    difficulty: "",
    styleTags: [],
    description: "",
    suitableFor: "Beginner",
    imageDataUrl: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const previewTitle = formData.routeName.trim() || "Your New Route";
  const previewDifficulty = formData.difficulty || "Select difficulty";
  const previewStyle = formData.styleTags.join(", ") || "No style tags yet";
  const previewDescription =
    formData.description.trim() ||
    "Add a short description to help climbers understand this route.";

  // Live text for the "Suitable for" section in preview.
  const previewLevel = useMemo(() => formData.suitableFor, [formData.suitableFor]);

  function updateField(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setIsSubmitted(false);
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
    setIsSubmitted(false);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateField("imageDataUrl", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
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

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const newRoute = {
      id: Date.now(),
      routeName: formData.routeName.trim(),
      difficulty: formData.difficulty,
      styleTags: formData.styleTags,
      description: formData.description.trim(),
      suitableFor: formData.suitableFor,
      imageDataUrl: formData.imageDataUrl,
      createdAt: new Date().toISOString()
    };

    // Save route to localStorage so the user can keep their created routes.
    const existingRaw = localStorage.getItem(CREATED_ROUTES_STORAGE_KEY);
    let existingRoutes = [];
    try {
      existingRoutes = existingRaw ? JSON.parse(existingRaw) : [];
    } catch {
      existingRoutes = [];
    }
    const nextRoutes = [newRoute, ...existingRoutes];
    localStorage.setItem(CREATED_ROUTES_STORAGE_KEY, JSON.stringify(nextRoutes));

    setIsSubmitted(true);
    setErrors({});
    setFormData({
      routeName: "",
      difficulty: "",
      styleTags: [],
      description: "",
      suitableFor: "Beginner",
      imageDataUrl: ""
    });
  }

  return (
    <section className="cq-create-page">
      <header className="cq-create-header">
        <p className="cq-page-eyebrow">Create</p>
        <h2>Build your own climbing route</h2>
        <p>Create, preview, and save your custom route in a few simple steps.</p>
      </header>

      {isSubmitted && (
        <p className="cq-create-success" role="status">
          Route saved successfully. Great work, route designer.
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
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
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
          <span>Optional image upload</span>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        <button type="submit" className="cq-primary-btn cq-create-submit">
          Submit Route
        </button>
      </form>

      {/* Live preview card updates as the user types. */}
      <article className="cq-create-preview">
        <p className="cq-page-eyebrow">Live Preview</p>
        <div className="cq-route-top-row">
          <h3>{previewTitle}</h3>
          <span className="cq-route-difficulty">{previewDifficulty}</span>
        </div>
        <span className="cq-route-style-tag">{previewStyle}</span>
        <p className="cq-route-description">{previewDescription}</p>
        <p className="cq-route-reason">Suitable for: {previewLevel}</p>

        {formData.imageDataUrl && (
          <img
            className="cq-create-preview-image"
            src={formData.imageDataUrl}
            alt="Uploaded route preview"
          />
        )}
      </article>
    </section>
  );
}
