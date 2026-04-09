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
          Hold contours: {Array.isArray(routeState.holdContours) ? routeState.holdContours.length : 0}
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

                {Array.isArray(routeState.holdContours) &&
                  routeState.holdContours.map((hold, index) => (
                    <polygon
                      key={`detail-hold-${photoIndex}-${hold.id || index}`}
                      points={pointsToSvgString(hold.points)}
                      fill="rgba(88, 232, 158, 0.32)"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      filter={`url(#cqDetailHoldMaskGlow-${photoIndex})`}
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
