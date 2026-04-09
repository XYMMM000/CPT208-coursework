import { useMemo, useState } from "react";
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
  imageDataUrl: "",
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

function getContoursForPhoto(routeState, photoIndex) {
  const hasUserContours =
    Array.isArray(routeState.holdContours) && routeState.holdContours.length > 0;
  if (hasUserContours) return routeState.holdContours;

  const difficultyKey =
    routeState.difficulty === "Hard"
      ? "Hard"
      : routeState.difficulty === "Easy"
        ? "Easy"
        : "Medium";

  return WALL_GALLERY_CONTOUR_PRESETS_BY_DIFFICULTY[difficultyKey][photoIndex] || [];
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
  const routeKey = `${resolvedInitialRoute.title}::${resolvedInitialRoute.creator.name}`;
  const savedInteractions = readRouteInteractions()[routeKey];

  // Route state is kept in one object so interaction updates are easier to follow.
  const [routeState, setRouteState] = useState({
    ...resolvedInitialRoute,
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
  const displayedContourCount = useMemo(() => {
    const hasUserContours =
      Array.isArray(routeState.holdContours) && routeState.holdContours.length > 0;
    if (hasUserContours) return routeState.holdContours.length;

    const difficultyKey =
      routeState.difficulty === "Hard"
        ? "Hard"
        : routeState.difficulty === "Easy"
          ? "Easy"
          : "Medium";

    return (WALL_GALLERY_CONTOUR_PRESETS_BY_DIFFICULTY[difficultyKey][0] || []).length;
  }, [routeState.holdContours, routeState.difficulty]);
  const ratingSummary = useMemo(() => {
    return `${routeState.averageRating.toFixed(1)} (${routeState.ratingCount} ratings)`;
  }, [routeState.averageRating, routeState.ratingCount]);

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
          Hold contours: {displayedContourCount}
        </p>
      </section>

      <section className="cq-detail-card">
        <h3>Hold Contour Preview</h3>
        <p className="cq-detail-creator">
          Showing 3 wall photos from assets with your DIY route contour overlay.
        </p>

        <div className="cq-detail-wall-grid">
          {WALL_GALLERY_PHOTOS.map((photoSrc, photoIndex) => (
            <div key={`wall-photo-${photoIndex}`} className="cq-preview-wall-wrap">
              <img
                className="cq-create-preview-image"
                src={photoSrc}
                alt={`Wall preview ${photoIndex + 1}`}
              />

              {/* Render the same user DIY hold contours above each wall photo. */}
              <svg
                className="cq-wall-svg-overlay"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <filter
                    id={`cqDetailHoldMaskGlow-${photoIndex}`}
                    x="-40%"
                    y="-40%"
                    width="180%"
                    height="180%"
                  >
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {getContoursForPhoto(routeState, photoIndex).map((hold, index) => (
                    <polygon
                      key={`detail-hold-${photoIndex}-${hold.id || index}`}
                      points={pointsToSvgString(hold.points)}
                      fill="none"
                      stroke="rgba(255,255,255,0.75)"
                      strokeWidth="3.6"
                      strokeLinejoin="round"
                      filter={`url(#cqDetailHoldMaskGlow-${photoIndex})`}
                    />
                  ))}

                {getContoursForPhoto(routeState, photoIndex).map((hold, index) => (
                    <polygon
                      key={`detail-hold-main-${photoIndex}-${hold.id || index}`}
                      points={pointsToSvgString(hold.points)}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  ))}
              </svg>
            </div>
          ))}
        </div>
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
