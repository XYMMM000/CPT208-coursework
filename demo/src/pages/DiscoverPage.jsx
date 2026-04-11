import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Quiz questions for the Discover page.
// Each option contributes points to one or more climbing profiles.
const quizQuestions = [
  {
    id: "q1",
    title: "When you enter a gym, which wall attracts you first?",
    options: [
      { label: "Simple slab to warm up", scores: { flow: 2, social: 1 } },
      { label: "Overhang with powerful moves", scores: { power: 2 } },
      { label: "Long endurance circuit", scores: { endurance: 2 } },
      { label: "Creative technical volumes", scores: { tech: 2, flow: 1 } }
    ]
  },
  {
    id: "q2",
    title: "What is your ideal climbing session vibe?",
    options: [
      { label: "Calm and focused", scores: { flow: 2 } },
      { label: "High energy challenge", scores: { power: 2 } },
      { label: "Steady pace for many attempts", scores: { endurance: 2 } },
      { label: "Trying movement puzzles with friends", scores: { social: 2, tech: 1 } }
    ]
  },
  {
    id: "q3",
    title: "If you fail a move, what do you usually do?",
    options: [
      { label: "Refine footwork and retry", scores: { flow: 2, tech: 1 } },
      { label: "Commit with more strength", scores: { power: 2 } },
      { label: "Shake out and keep climbing", scores: { endurance: 2 } },
      { label: "Ask for beta and discuss", scores: { social: 2 } }
    ]
  },
  {
    id: "q4",
    title: "What do you want from ClimbQuest today?",
    options: [
      { label: "A smooth confidence route", scores: { flow: 2 } },
      { label: "A hard move challenge", scores: { power: 2 } },
      { label: "A longer stamina route", scores: { endurance: 2 } },
      { label: "Community ideas and ratings", scores: { social: 2, tech: 1 } }
    ]
  },
  {
    id: "q5",
    title: "Which move style sounds most fun to you?",
    options: [
      { label: "Slow weight shifts and balance control", scores: { flow: 2 } },
      { label: "Big dynamic reaches and lock-offs", scores: { power: 2 } },
      { label: "Continuous movement with little rest", scores: { endurance: 2 } },
      { label: "Heel hooks, toe hooks, and body puzzles", scores: { tech: 2 } }
    ]
  },
  {
    id: "q6",
    title: "What makes a route feel successful for you?",
    options: [
      { label: "Clean technique with no panic", scores: { flow: 2, tech: 1 } },
      { label: "Sending a move that felt impossible", scores: { power: 2 } },
      { label: "Finishing after many linked moves", scores: { endurance: 2 } },
      { label: "Sharing beta and helping friends send", scores: { social: 2 } }
    ]
  },
  {
    id: "q7",
    title: "How do you usually warm up?",
    options: [
      { label: "Quiet easy slab and movement drills", scores: { flow: 2 } },
      { label: "A few hard pulls to activate power", scores: { power: 2 } },
      { label: "Long easy circuits to build rhythm", scores: { endurance: 2 } },
      { label: "Different hold types to test body positions", scores: { tech: 2 } }
    ]
  },
  {
    id: "q8",
    title: "After climbing, what do you most want to do?",
    options: [
      { label: "Reflect on movement quality", scores: { flow: 2 } },
      { label: "Plan a stronger project for next time", scores: { power: 2 } },
      { label: "Track volume and consistency", scores: { endurance: 2 } },
      { label: "Post route notes and discuss beta", scores: { social: 2, tech: 1 } }
    ]
  }
];

const profileResults = {
  flow: {
    emoji: "🧘‍♂️🧗",
    name: "Flow Climber",
    subtitle: "Balanced and precise movement style",
    routePick: "Blue Slab Rhythm",
    reason:
      "You prefer control, stable pacing, and clean body positioning on technical lines.",
    primaryLink: "/create",
    primaryLabel: "Create a Smooth Route",
    secondaryLink: "/community",
    secondaryLabel: "Read Community Beta"
  },
  power: {
    emoji: "⚡💪",
    name: "Power Climber",
    subtitle: "Explosive and committed style",
    routePick: "Crimson Power Burst",
    reason:
      "You enjoy direct movement, dynamic attempts, and higher intensity problem solving.",
    primaryLink: "/discover",
    primaryLabel: "Try Power Challenge",
    secondaryLink: "/community",
    secondaryLabel: "See Hard Route Ratings"
  },
  endurance: {
    emoji: "🔥⛰️",
    name: "Endurance Climber",
    subtitle: "Consistent and persistent style",
    routePick: "Long Traverse Engine",
    reason:
      "You focus on sustained effort, smooth recovery, and finishing longer sequences.",
    primaryLink: "/discover",
    primaryLabel: "Open Endurance Challenge",
    secondaryLink: "/create",
    secondaryLabel: "Design a Long Route"
  },
  tech: {
    emoji: "🧠🪢",
    name: "Technique Climber",
    subtitle: "Puzzle-driven and thoughtful style",
    routePick: "Volume Logic Maze",
    reason:
      "You like complex movement decisions, micro-adjustments, and clever sequencing.",
    primaryLink: "/create",
    primaryLabel: "Build Technical Route",
    secondaryLink: "/community",
    secondaryLabel: "Explore Technical Beta"
  },
  social: {
    emoji: "🤝🎉",
    name: "Community Climber",
    subtitle: "Collaborative and feedback-oriented style",
    routePick: "Partner Session Circuit",
    reason:
      "You value route sharing, collaborative attempts, and learning from community feedback.",
    primaryLink: "/community",
    primaryLabel: "Open Community Feed",
    secondaryLink: "/create",
    secondaryLabel: "Publish a New Route"
  }
};

function getTopProfileKey(scoreBoard) {
  return Object.entries(scoreBoard).sort((a, b) => b[1] - a[1])[0]?.[0] || "flow";
}

export default function DiscoverPage() {
  // answerMap stores selected option index by question id.
  const [answerMap, setAnswerMap] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(answerMap).length;
  const progressPercent = Math.round((answeredCount / quizQuestions.length) * 100);

  const scoreBoard = useMemo(() => {
    const base = { flow: 0, power: 0, endurance: 0, tech: 0, social: 0 };

    for (const question of quizQuestions) {
      const selectedIndex = answerMap[question.id];
      if (typeof selectedIndex !== "number") continue;
      const selectedOption = question.options[selectedIndex];
      if (!selectedOption?.scores) continue;

      for (const [profileKey, score] of Object.entries(selectedOption.scores)) {
        base[profileKey] += score;
      }
    }

    return base;
  }, [answerMap]);

  const topProfileKey = useMemo(() => getTopProfileKey(scoreBoard), [scoreBoard]);
  const result = profileResults[topProfileKey];

  function handleSelectOption(optionIndex) {
    setAnswerMap((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  }

  function handleNext() {
    if (currentQuestionIndex >= quizQuestions.length - 1) {
      setIsFinished(true);
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  }

  function handleBack() {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }

  function handleRestartQuiz() {
    setAnswerMap({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
  }

  return (
    <section className="cq-discover-quiz-page">
      <header className="cq-discover-quiz-header">
        <p className="cq-page-eyebrow">Discover</p>
        <h2>Climb Style Quiz</h2>
        <p>Answer a few quick questions to find your climbing profile and best next action.</p>
      </header>

      {!isFinished && (
        <article className="cq-discover-quiz-card">
          <div className="cq-discover-quiz-meta">
            <span>
              Question {currentQuestionIndex + 1} / {quizQuestions.length}
            </span>
            <span>{progressPercent}%</span>
          </div>

          <div className="cq-quest-progress-track" aria-label="Quiz progress">
            <div className="cq-quest-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <h3>{currentQuestion.title}</h3>

          <div className="cq-discover-option-list">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = answerMap[currentQuestion.id] === optionIndex;

              return (
                <button
                  key={`${currentQuestion.id}-option-${optionIndex}`}
                  type="button"
                  className={`cq-discover-option-btn ${
                    isSelected ? "cq-discover-option-btn-active" : ""
                  }`}
                  onClick={() => handleSelectOption(optionIndex)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="cq-discover-action-row">
            <button
              type="button"
              className="cq-secondary-btn"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              Back
            </button>
            <button
              type="button"
              className="cq-primary-btn cq-discover-next-btn"
              onClick={handleNext}
              disabled={typeof answerMap[currentQuestion.id] !== "number"}
            >
              {currentQuestionIndex === quizQuestions.length - 1 ? "See My Result" : "Next"}
            </button>
          </div>
        </article>
      )}

      {isFinished && (
        <article className="cq-discover-result-card">
          <p className="cq-page-eyebrow">Your Result</p>
          <h3>
            {result.name} {result.emoji}
          </h3>
          <p className="cq-discover-result-subtitle">{result.subtitle}</p>

          <section className="cq-discover-route-pick">
            <p className="cq-discover-route-label">Suggested route vibe</p>
            <p className="cq-discover-route-name">{result.routePick}</p>
            <p className="cq-discover-route-reason">{result.reason}</p>
          </section>

          <div className="cq-discover-result-actions">
            <Link className="cq-primary-btn cq-discover-result-btn" to={result.primaryLink}>
              {result.primaryLabel}
            </Link>
            <Link className="cq-secondary-btn cq-discover-result-btn" to={result.secondaryLink}>
              {result.secondaryLabel}
            </Link>
          </div>

          <button type="button" className="cq-reset-btn" onClick={handleRestartQuiz}>
            Retake Quiz
          </button>
        </article>
      )}
    </section>
  );
}
