import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const ROUTE_INTERACTIONS_STORAGE_KEY = "climbquest_route_interactions";

const initialRoute = {
  title: "Blue Slab Balance Route",
  difficulty: "Medium",
  tags: ["Balance", "Technique", "Endurance"],
  description:
    "A smooth slab-focused route with controlled shifts, precise feet, and steady rhythm.",
  creator: {
    name: "Eric",
    club: "NerdCave Climbing Club"
  },
  averageRating: 4.3,
  ratingCount: 26
};

function renderStarLine(value) {
  return "*".repeat(value) + "-".repeat(5 - value);
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
          <span className="cq-route-difficulty">{routeState.difficulty}</span>
          <span className="cq-detail-rating-summary">{ratingSummary}</span>
        </div>

        <div className="cq-community-style-row">
          {routeState.tags.map((tag) => (
            <span key={tag} className="cq-route-style-tag">
              {tag}
            </span>
          ))}
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
        <h3>Comments</h3>

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
            Post Comment
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
          {routeState.isLiked ? `Liked (${routeState.likes})` : `Like (${routeState.likes})`}
        </button>

        <button
          type="button"
          className={`cq-secondary-btn ${routeState.isSaved ? "cq-action-active" : ""}`}
          onClick={toggleSave}
        >
          {routeState.isSaved ? "Saved" : "Save"}
        </button>

        <button
          type="button"
          className={`cq-primary-btn cq-detail-complete-btn ${
            routeState.isCompleted ? "cq-detail-complete-btn-active" : ""
          }`}
          onClick={toggleCompleted}
        >
          {routeState.isCompleted ? "Completed" : "I completed this route"}
        </button>
      </section>
    </section>
  );
}
