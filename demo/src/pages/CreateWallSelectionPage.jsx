import { Link } from "react-router-dom";
import wallPhotoA from "../assets/photo/8a4c9063-e850-4c6f-9245-36835a1d0c3d.png";
import wallPhotoB from "../assets/photo/c6ca442c-7547-46d8-8083-250e3c29a877.png";
import wallPhotoC from "../assets/photo/c9d8dd37-6805-4547-973a-69ebcf0663ae.png";

// Mock wall data for MVP: each card has image, name and optional tags.
const wallOptions = [
  {
    id: "wall-1",
    name: "Granite Rhythm Slab",
    image: wallPhotoA,
    tags: ["Slab", "Balance", "Training"],
    level: "Beginner Friendly",
    activeClimbers: 128
  },
  {
    id: "wall-2",
    name: "Blue Volume Circuit",
    image: wallPhotoB,
    tags: ["Mixed", "Technique"],
    level: "Intermediate",
    activeClimbers: 94
  },
  {
    id: "wall-3",
    name: "Power Cave Line",
    image: wallPhotoC,
    tags: ["Overhang", "Power"],
    level: "Advanced",
    activeClimbers: 63
  }
];

export default function CreateWallSelectionPage() {
  return (
    <section className="cq-create-page cq-wall-select-page">
      <header className="cq-create-header">
        <p className="cq-page-eyebrow">Create</p>
        <h2>Choose a wall to start your DIY route</h2>
        <p>Select one wall first, then move to the editor to outline holds.</p>
      </header>

      {/* Mobile-first vertical card list. On wider screens CSS can switch to 2 columns. */}
      <section className="cq-wall-selection-list" aria-label="Climbing wall selection list">
        {wallOptions.map((wall) => (
          <Link
            key={wall.id}
            className="cq-wall-selection-card"
            to={`/create/editor/${wall.id}`}
            aria-label={`Open editor for ${wall.name}`}
          >
            <img className="cq-wall-selection-image" src={wall.image} alt={wall.name} />

            <div className="cq-wall-selection-content">
              {/* Product-style info bar: difficulty badge + simple social signal. */}
              <div className="cq-wall-selection-meta">
                <span className="cq-wall-level-badge">{wall.level}</span>
                <span className="cq-wall-active-count">{wall.activeClimbers} climbers this week</span>
              </div>
              <h3>{wall.name}</h3>
              <div className="cq-community-style-row">
                {wall.tags.map((tag) => (
                  <span key={`${wall.id}-${tag}`} className="cq-route-style-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="cq-secondary-btn cq-wall-selection-cta">Open Wall Editor</span>
            </div>
          </Link>
        ))}
      </section>
    </section>
  );
}
