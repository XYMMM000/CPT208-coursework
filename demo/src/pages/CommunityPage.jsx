import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { firestoreDb } from "../lib/firebase";

const difficultyChips = ["All", "Easy", "Medium", "Hard"];
const styleChips = ["All", "Balance", "Power", "Endurance", "Technique"];

function formatRating(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "4.0/5";
  return `${numericValue.toFixed(1)}/5`;
}

export default function CommunityPage() {
  const [communityRoutes, setCommunityRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");

  useEffect(() => {
    let isActive = true;

    async function fetchRoutesFromFirestore() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        // Read all routes from Firestore collection "routes".
        const snapshot = await getDocs(collection(firestoreDb, "routes"));

        // Convert Firestore docs into a beginner-friendly UI shape.
        const routes = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            routeName: data.routeName || "Untitled Route",
            difficulty: data.difficulty || "Easy",
            styleTags:
              Array.isArray(data.styleTags) && data.styleTags.length > 0
                ? data.styleTags
                : ["Technique"],
            creatorName: data.creatorName || "Anonymous Climber",
            averageRating: data.averageRating ?? 4.0,
            description:
              data.description || "No description provided for this route yet.",
            createdTime: data.createdTime?.seconds || 0
          };
        });

        // Show newest routes first when timestamp exists.
        routes.sort((a, b) => b.createdTime - a.createdTime);

        if (isActive) {
          setCommunityRoutes(routes);
        }
      } catch (error) {
        console.error("Failed to fetch Firestore routes:", error);
        if (isActive) {
          setErrorMessage("Could not load community routes. Please try again.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchRoutesFromFirestore();
    return () => {
      isActive = false;
    };
  }, []);

  // Search + filter logic works on the Firestore-loaded routes.
  const filteredRoutes = useMemo(() => {
    return communityRoutes.filter((route) => {
      const searchValue = searchText.toLowerCase().trim();
      const matchesSearch =
        route.routeName.toLowerCase().includes(searchValue) ||
        route.creatorName.toLowerCase().includes(searchValue) ||
        route.description.toLowerCase().includes(searchValue);

      const matchesDifficulty =
        difficultyFilter === "All" || route.difficulty === difficultyFilter;
      const matchesStyle =
        styleFilter === "All" || route.styleTags.includes(styleFilter);

      return matchesSearch && matchesDifficulty && matchesStyle;
    });
  }, [communityRoutes, searchText, difficultyFilter, styleFilter]);

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

      {isLoading && (
        <p className="cq-community-status" role="status">
          Loading community routes...
        </p>
      )}

      {!isLoading && errorMessage && (
        <p className="cq-community-status cq-community-status-error" role="alert">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && (
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
                  Rating: {formatRating(route.averageRating)}
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
                    averageRating: Number(route.averageRating) || 4.0,
                    ratingCount: 1
                  }
                }}
              >
                View Detail
              </Link>
            </article>
          ))}
        </section>
      )}

      {!isLoading && !errorMessage && filteredRoutes.length === 0 && (
        <p className="cq-community-empty">No routes found. Try another filter or keyword.</p>
      )}
    </section>
  );
}
