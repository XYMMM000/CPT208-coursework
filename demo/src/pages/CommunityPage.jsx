import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const mockCommunityRoutes = [
  {
    id: 1,
    routeName: "Neon Ladder",
    difficulty: "Easy",
    styleTags: ["Balance", "Technique"],
    creatorName: "Mia",
    averageRating: 4.7,
    description: "Smooth ladder-style climbing with simple transitions and fun flow."
  },
  {
    id: 2,
    routeName: "Core Crush",
    difficulty: "Hard",
    styleTags: ["Power"],
    creatorName: "Alex",
    averageRating: 4.4,
    description: "Explosive moves and lock-offs for climbers who enjoy strength tests."
  },
  {
    id: 3,
    routeName: "Tempo Traverse",
    difficulty: "Medium",
    styleTags: ["Endurance", "Technique"],
    creatorName: "Leo",
    averageRating: 4.6,
    description: "Long horizontal route focused on pacing, rhythm, and body control."
  },
  {
    id: 4,
    routeName: "Pocket Practice",
    difficulty: "Medium",
    styleTags: ["Power", "Technique"],
    creatorName: "Hannah",
    averageRating: 4.2,
    description: "A playful route that mixes tiny holds with precise foot placement."
  },
  {
    id: 5,
    routeName: "Sunset Circuit",
    difficulty: "Easy",
    styleTags: ["Endurance", "Balance"],
    creatorName: "Ryan",
    averageRating: 4.8,
    description: "Friendly circuit for social climbing sessions and light endurance work."
  }
];

const difficultyChips = ["All", "Easy", "Medium", "Hard"];
const styleChips = ["All", "Balance", "Power", "Endurance", "Technique"];

function renderStars(rating) {
  return `${rating.toFixed(1)}/5`;
}

export default function CommunityPage() {
  const [searchText, setSearchText] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");

  // Filter list based on search + selected filter chips.
  const filteredRoutes = useMemo(() => {
    return mockCommunityRoutes.filter((route) => {
      const matchesSearch =
        route.routeName.toLowerCase().includes(searchText.toLowerCase()) ||
        route.creatorName.toLowerCase().includes(searchText.toLowerCase()) ||
        route.description.toLowerCase().includes(searchText.toLowerCase());

      const matchesDifficulty =
        difficultyFilter === "All" || route.difficulty === difficultyFilter;
      const matchesStyle =
        styleFilter === "All" || route.styleTags.includes(styleFilter);

      return matchesSearch && matchesDifficulty && matchesStyle;
    });
  }, [searchText, difficultyFilter, styleFilter]);

  return (
    <section className="cq-community-page">
      <header className="cq-community-header">
        <p className="cq-page-eyebrow">Community</p>
        <h2>Route feed from climbers</h2>
        <p>Discover shared routes, ratings, and ideas from your climbing community.</p>
      </header>

      <label className="cq-community-search">
        <span className="cq-community-search-label">Search routes</span>
        <input
          type="text"
          placeholder="Search by route, creator, or keyword"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </label>

      <div className="cq-community-filters" aria-label="Route filters">
        <div className="cq-community-chip-group">
          {difficultyChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`cq-tag-btn ${
                difficultyFilter === chip ? "cq-tag-btn-active" : ""
              }`}
              onClick={() => setDifficultyFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="cq-community-chip-group">
          {styleChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`cq-tag-btn ${styleFilter === chip ? "cq-tag-btn-active" : ""}`}
              onClick={() => setStyleFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <section className="cq-community-list" aria-label="Community route feed">
        {filteredRoutes.map((route) => (
          <article key={route.id} className="cq-community-card">
            <div className="cq-route-top-row">
              <h3>{route.routeName}</h3>
              <span className="cq-route-difficulty">{route.difficulty}</span>
            </div>

            <div className="cq-community-meta">
              <span>By {route.creatorName}</span>
              <span className="cq-community-rating">
                Rating: {renderStars(route.averageRating)}
              </span>
            </div>

            <div className="cq-community-style-row">
              {route.styleTags.map((tag) => (
                <span key={`${route.id}-${tag}`} className="cq-route-style-tag">
                  {tag}
                </span>
              ))}
            </div>

            <p className="cq-route-description">{route.description}</p>

            <Link
              className="cq-secondary-btn cq-community-detail-link"
              to="/route-detail"
              state={{
                route: {
                  title: route.routeName,
                  difficulty: route.difficulty,
                  tags: route.styleTags,
                  description: route.description,
                  creator: {
                    name: route.creatorName,
                    club: "ClimbQuest Community"
                  },
                  averageRating: route.averageRating,
                  ratingCount: 1
                }
              }}
            >
              View Detail
            </Link>
          </article>
        ))}
      </section>

      {filteredRoutes.length === 0 && (
        <p className="cq-community-empty">No routes found. Try another filter or keyword.</p>
      )}
    </section>
  );
}
