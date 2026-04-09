import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { firestoreDb } from "../lib/firebase";

const COMMUNITY_CACHE_KEY = "climbquest_community_cache";
const CREATED_ROUTES_STORAGE_KEY = "climbquest_created_routes";
const FAST_FETCH_TIMEOUT_MS = 2600;
const difficultyChips = ["All", "Easy", "Medium", "Hard"];
const styleChips = ["All", "Balance", "Power", "Endurance", "Technique"];
const sourceChips = ["All", "Community", "AI"];

function getDifficultyMeta(difficulty) {
  if (difficulty === "Easy") return { grade: "V0-V1", toneClass: "cq-difficulty-easy" };
  if (difficulty === "Medium") return { grade: "V2-V4", toneClass: "cq-difficulty-medium" };
  return { grade: "V5+", toneClass: "cq-difficulty-hard" };
}

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
    suitableFor: data.suitableFor || "Beginner",
    holdContours: Array.isArray(data.holdContours) ? data.holdContours : [],
    imageDataUrl: data.imageDataUrl || "",
    wallPhotoIndex: Number.isInteger(data.wallPhotoIndex) ? data.wallPhotoIndex : 0,
    createdTime: data.createdTime?.seconds || 0,
    source: "Community"
  };
}

function normalizeLocalRoute(route, index) {
  return {
    id: route.id ? `local-${route.id}` : `local-${Date.now()}-${index}`,
    routeName: route.routeName || "Untitled Route",
    difficulty: route.difficulty || "Easy",
    styleTags:
      Array.isArray(route.styleTags) && route.styleTags.length > 0
        ? route.styleTags
        : ["Technique"],
    creatorName: route.creatorName || "You",
    averageRating: route.averageRating ?? 4.0,
    description: route.description || "No description provided for this route yet.",
    suitableFor: route.suitableFor || "Beginner",
    holdContours: Array.isArray(route.holdContours) ? route.holdContours : [],
    imageDataUrl: route.imageDataUrl || "",
    wallPhotoIndex: Number.isInteger(route.wallPhotoIndex) ? route.wallPhotoIndex : 0,
    createdTime: route.createdTime || 0,
    source: "Community"
  };
}

function formatCreatedTime(createdTime) {
  if (!createdTime) return "Unknown";
  const dateValue =
    typeof createdTime === "number" ? new Date(createdTime * 1000) : new Date(createdTime);
  if (Number.isNaN(dateValue.getTime())) return "Unknown";
  return dateValue.toLocaleDateString();
}

function safeReadRoutesFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeAndDedupeRoutes(...routeLists) {
  const merged = routeLists.flat();
  const byKey = new Map();

  for (const route of merged) {
    // Dedupe by route name + creator to avoid repeated cards.
    const dedupeKey = `${route.routeName}::${route.creatorName}`.toLowerCase();
    if (!byKey.has(dedupeKey)) {
      byKey.set(dedupeKey, route);
    }
  }

  return Array.from(byKey.values());
}

export default function CommunityPage() {
  // Instant first paint: build feed immediately from local sources.
  const [communityRoutes, setCommunityRoutes] = useState(() => {
    const cachedRoutes = safeReadRoutesFromStorage(COMMUNITY_CACHE_KEY);
    const localRoutes = safeReadRoutesFromStorage(CREATED_ROUTES_STORAGE_KEY).map(
      normalizeLocalRoute
    );
    return mergeAndDedupeRoutes(localRoutes, cachedRoutes, aiGeneratedRoutes);
  });
  const [isLoading, setIsLoading] = useState(communityRoutes.length === 0);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  useEffect(() => {
    let isActive = true;

    async function fetchRoutesFromFirestore() {
      if (communityRoutes.length === 0) setIsLoading(true);
      setErrorMessage("");

      try {
        // Read a smaller first page to reduce time-to-first-render.
        const routesQuery = query(
          collection(firestoreDb, "routes"),
          orderBy("createdTime", "desc"),
          limit(18)
        );

        // Timeout guard: if network is slow, keep current feed and stop blocking.
        const snapshot = await Promise.race([
          getDocs(routesQuery),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("fetch-timeout")), FAST_FETCH_TIMEOUT_MS)
          )
        ]);

        // Convert Firestore docs into a beginner-friendly UI shape.
        const routes = snapshot.docs.map((doc) => normalizeFirestoreRoute(doc));
        const localRoutes = safeReadRoutesFromStorage(CREATED_ROUTES_STORAGE_KEY).map(
          normalizeLocalRoute
        );
        const nextFeed = mergeAndDedupeRoutes(localRoutes, routes, aiGeneratedRoutes);

        if (isActive) {
          setCommunityRoutes(nextFeed);
          localStorage.setItem(COMMUNITY_CACHE_KEY, JSON.stringify(routes));
        }
      } catch (error) {
        console.error("Failed to fetch Firestore routes:", error);
        if (isActive) {
          // Keep already-rendered routes and only show a soft warning.
          setErrorMessage("Cloud refresh is slow. Showing local + cached routes.");
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
      const matchesStyle = styleFilter === "All" || route.styleTags.includes(styleFilter);
      const matchesSource = sourceFilter === "All" || route.source === sourceFilter;

      return matchesSearch && matchesDifficulty && matchesStyle && matchesSource;
    });
  }, [communityRoutes, searchText, difficultyFilter, styleFilter, sourceFilter]);

  return (
    <section className="cq-community-page">
      <header className="cq-community-header">
        <p className="cq-page-eyebrow">Community</p>
        <h2>Community beta feed</h2>
        <p>Discover shared routes, quick beta tips, and fresh ideas from climbers.</p>
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
              className={`cq-tag-btn ${difficultyFilter === chip ? "cq-tag-btn-active" : ""}`}
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

      {errorMessage && (
        <p className="cq-community-status cq-community-status-error" role="alert">
          {errorMessage}
        </p>
      )}

      {!isLoading && (
        <section className="cq-community-list" aria-label="Community route feed">
          {filteredRoutes.map((route) => {
            const difficultyMeta = getDifficultyMeta(route.difficulty);

            return (
              <article key={route.id} className="cq-community-card">
                <div className="cq-route-top-row">
                  <h3>{route.routeName}</h3>
                  <span className={`cq-route-difficulty ${difficultyMeta.toneClass}`}>
                    {route.difficulty} | {difficultyMeta.grade}
                  </span>
                </div>

                <div className="cq-community-meta">
                  <span>By {route.creatorName}</span>
                  <span className="cq-community-rating">
                    Community score: {formatRating(route.averageRating)}
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
                    {route.source === "AI" ? "AI Route Setter" : "Community Setter"}
                  </span>
                </div>

                <div className="cq-route-line" aria-hidden="true">
                  <span className="cq-route-line-node cq-route-line-node-start" />
                  <span className="cq-route-line-segment" />
                  <span className="cq-route-line-node cq-route-line-node-mid" />
                  <span className="cq-route-line-segment" />
                  <span className="cq-route-line-node cq-route-line-node-finish" />
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
                      id: route.id,
                      title: route.routeName,
                      difficulty: route.difficulty,
                      tags: route.styleTags,
                      description: route.description,
                      suitableFor: route.suitableFor,
                      holdContours: route.holdContours,
                      imageDataUrl: route.imageDataUrl,
                      wallPhotoIndex: route.wallPhotoIndex,
                      createdTime: route.createdTime,
                      createdTimeLabel: formatCreatedTime(route.createdTime),
                      source: route.source,
                      creator: {
                        name: route.creatorName,
                        club: "ClimbQuest Community"
                      },
                      averageRating: Number(route.averageRating) || 4.0,
                      ratingCount: 1
                    }
                  }}
                >
                  Open Route Beta
                </Link>
              </article>
            );
          })}
        </section>
      )}

      {!isLoading && filteredRoutes.length === 0 && (
        <p className="cq-community-empty">No routes found. Try another filter or keyword.</p>
      )}
    </section>
  );
}
