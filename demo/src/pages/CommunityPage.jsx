import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { firestoreDb } from "../lib/firebase";

const COMMUNITY_CACHE_KEY = "climbquest_community_cache";
const difficultyChips = ["All", "Easy", "Medium", "Hard"];
const styleChips = ["All", "Balance", "Power", "Endurance", "Technique"];
const sourceChips = ["All", "Community", "AI"];

// AI-generated starter routes for inspiration.
// These keep the feed lively even when user-created routes are still few.
const aiGeneratedRoutes = [
  {
    id: "ai-1",
    routeName: "Zen Ladder Flow",
    difficulty: "Easy",
    styleTags: ["Balance", "Technique"],
    creatorName: "ClimbQuest AI",
    averageRating: 4.4,
    description: "Smooth ladder sequence to practice precise feet and calm pacing.",
    createdTime: 0,
    source: "AI"
  },
  {
    id: "ai-2",
    routeName: "Pulse Power Circuit",
    difficulty: "Hard",
    styleTags: ["Power", "Endurance"],
    creatorName: "ClimbQuest AI",
    averageRating: 4.2,
    description: "A compact but intense sequence focused on lock-off strength.",
    createdTime: 0,
    source: "AI"
  },
  {
    id: "ai-3",
    routeName: "Blue Rhythm Traverse",
    difficulty: "Medium",
    styleTags: ["Endurance", "Technique"],
    creatorName: "ClimbQuest AI",
    averageRating: 4.5,
    description: "Long traverse with tempo changes to build movement efficiency.",
    createdTime: 0,
    source: "AI"
  }
];

function formatRating(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "4.0/5";
  return `${numericValue.toFixed(1)}/5`;
}

function normalizeFirestoreRoute(doc) {
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
    description: data.description || "No description provided for this route yet.",
    createdTime: data.createdTime?.seconds || 0,
    source: "Community"
  };
}

export default function CommunityPage() {
  const [communityRoutes, setCommunityRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  useEffect(() => {
    let isActive = true;
    const cachedRaw = localStorage.getItem(COMMUNITY_CACHE_KEY);
    if (cachedRaw) {
      try {
        const cachedRoutes = JSON.parse(cachedRaw);
        if (Array.isArray(cachedRoutes) && cachedRoutes.length > 0) {
          // Fast path: show last loaded community routes immediately.
          setCommunityRoutes([...cachedRoutes, ...aiGeneratedRoutes]);
          setIsLoading(false);
        }
      } catch {
        // Ignore broken cache and continue with Firestore fetch.
      }
    }

    async function fetchRoutesFromFirestore() {
      // Only show blocking loading when there is no cached data.
      if (!cachedRaw) setIsLoading(true);
      setErrorMessage("");

      try {
        // Read newest community routes only (smaller payload = faster load).
        const routesQuery = query(
          collection(firestoreDb, "routes"),
          orderBy("createdTime", "desc"),
          limit(30)
        );
        const snapshot = await getDocs(routesQuery);

        // Convert Firestore docs into a beginner-friendly UI shape.
        const routes = snapshot.docs.map((doc) => normalizeFirestoreRoute(doc));

        if (isActive) {
          // Merge user/community routes with AI-generated routes.
          setCommunityRoutes([...routes, ...aiGeneratedRoutes]);
          localStorage.setItem(COMMUNITY_CACHE_KEY, JSON.stringify(routes));
        }
      } catch (error) {
        console.error("Failed to fetch Firestore routes:", error);
        if (isActive) {
          setErrorMessage("Could not load community routes. Showing AI routes only.");
          if (!cachedRaw) {
            setCommunityRoutes(aiGeneratedRoutes);
          }
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
      const matchesSource = sourceFilter === "All" || route.source === sourceFilter;

      return matchesSearch && matchesDifficulty && matchesStyle && matchesSource;
    });
  }, [communityRoutes, searchText, difficultyFilter, styleFilter, sourceFilter]);

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

        <div className="cq-community-chip-group">
          {sourceChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`cq-tag-btn ${sourceFilter === chip ? "cq-tag-btn-active" : ""}`}
              onClick={() => setSourceFilter(chip)}
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

              <div className="cq-community-source-row">
                <span
                  className={`cq-community-source-badge ${
                    route.source === "AI"
                      ? "cq-community-source-badge-ai"
                      : "cq-community-source-badge-community"
                  }`}
                >
                  {route.source}
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
