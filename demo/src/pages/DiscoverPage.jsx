import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    emoji: "馃鈥嶁檪锔忦煣?,
    mascot: {
      name: "Aero",
      avatars: ["馃鈥嶁檧锔?, "馃寠", "馃崈"],
      role: "Flow Coach",
      lines: [
        "Keep your breathing calm and trust your feet.",
        "Slow is smooth. Smooth is fast.",
        "Find balance first, then commit."
      ]
    },
    name: "Flow Climber",
    subtitle: "Balanced and precise movement style",
    routePick: "Blue Slab Rhythm",
    reason:
      "You prefer control, stable pacing, and clean body positioning on technical lines.",
    primaryLink: "/create",
    primaryLabel: "Create a Smooth Route",
    secondaryLink: "/community",
    secondaryLabel: "Read Community Beta",
    routes: [
      {
        name: "Blue Slab Rhythm",
        difficulty: "Easy | V0-V1",
        style: "Balance",
        reason: "Great for smooth body position and precise feet."
      },
      {
        name: "Silent Corner Flow",
        difficulty: "Easy | V0-V1",
        style: "Technique",
        reason: "Helps you refine quiet movement and weight transfer."
      },
      {
        name: "Glass Wall Glide",
        difficulty: "Medium | V2-V4",
        style: "Balance",
        reason: "Adds confidence on small footholds with controlled pacing."
      }
    ]
  },
  power: {
    emoji: "鈿○煉?,
    mascot: {
      name: "Blaze",
      avatars: ["馃Ω", "鈿?, "馃"],
      role: "Power Coach",
      lines: [
        "Commit fast, stay tight, and drive from your core.",
        "Explode with confidence and own the move.",
        "Strong hips, strong finish."
      ]
    },
    name: "Power Climber",
    subtitle: "Explosive and committed style",
    routePick: "Crimson Power Burst",
    reason:
      "You enjoy direct movement, dynamic attempts, and higher intensity problem solving.",
    primaryLink: "/discover",
    primaryLabel: "Try Power Challenge",
    secondaryLink: "/community",
    secondaryLabel: "See Hard Route Ratings",
    routes: [
      {
        name: "Crimson Power Burst",
        difficulty: "Hard | V5+",
        style: "Power",
        reason: "Explosive pulls and short, high-intensity sequences."
      },
      {
        name: "Volume Dyno Punch",
        difficulty: "Medium | V2-V4",
        style: "Power",
        reason: "Builds confidence in dynamic movement and lock-offs."
      },
      {
        name: "Overhang Strike Line",
        difficulty: "Hard | V5+",
        style: "Strength",
        reason: "Perfect for body tension and powerful finishing moves."
      }
    ]
  },
  endurance: {
    emoji: "馃敟鉀帮笍",
    mascot: {
      name: "Pace",
      avatars: ["馃弮", "鉀帮笍", "馃敟"],
      role: "Endurance Coach",
      lines: [
        "Stay efficient and keep moving with steady rhythm.",
        "Save energy on every move.",
        "Consistency beats intensity over long routes."
      ]
    },
    name: "Endurance Climber",
    subtitle: "Consistent and persistent style",
    routePick: "Long Traverse Engine",
    reason:
      "You focus on sustained effort, smooth recovery, and finishing longer sequences.",
    primaryLink: "/discover",
    primaryLabel: "Open Endurance Challenge",
    secondaryLink: "/create",
    secondaryLabel: "Design a Long Route",
    routes: [
      {
        name: "Long Traverse Engine",
        difficulty: "Medium | V2-V4",
        style: "Endurance",
        reason: "Sustained movement with limited resting positions."
      },
      {
        name: "Circuit River",
        difficulty: "Medium | V2-V4",
        style: "Endurance",
        reason: "Great for pacing and maintaining form under fatigue."
      },
      {
        name: "Wall Marathon Lite",
        difficulty: "Easy | V0-V1",
        style: "Flow",
        reason: "Builds session volume while preserving technique quality."
      }
    ]
  },
  tech: {
    emoji: "馃馃",
    mascot: {
      name: "Nori",
      avatars: ["馃З", "馃", "馃洶锔?],
      role: "Technique Coach",
      lines: [
        "Solve the sequence first, then execute with precision.",
        "Read the wall before you pull.",
        "Tiny adjustments unlock big sends."
      ]
    },
    name: "Technique Climber",
    subtitle: "Puzzle-driven and thoughtful style",
    routePick: "Volume Logic Maze",
    reason:
      "You like complex movement decisions, micro-adjustments, and clever sequencing.",
    primaryLink: "/create",
    primaryLabel: "Build Technical Route",
    secondaryLink: "/community",
    secondaryLabel: "Explore Technical Beta",
    routes: [
      {
        name: "Volume Logic Maze",
        difficulty: "Medium | V2-V4",
        style: "Technique",
        reason: "Designed for body positioning and subtle foot decisions."
      },
      {
        name: "Heel Hook Study",
        difficulty: "Hard | V5+",
        style: "Technique",
        reason: "Focuses on sequencing with advanced foot and hip control."
      },
      {
        name: "Micro Beta Lab",
        difficulty: "Medium | V2-V4",
        style: "Technique",
        reason: "Encourages route reading and efficient move planning."
      }
    ]
  },
  social: {
    emoji: "馃馃帀",
    mascot: {
      name: "Milo",
      avatars: ["馃槃", "馃帀", "馃"],
      role: "Community Coach",
      lines: [
        "Share beta, cheer each other on, and send together.",
        "Great sessions are built with teammates.",
        "Feedback and fun make progress faster."
      ]
    },
    name: "Community Climber",
    subtitle: "Collaborative and feedback-oriented style",
    routePick: "Partner Session Circuit",
    reason:
      "You value route sharing, collaborative attempts, and learning from community feedback.",
    primaryLink: "/community",
    primaryLabel: "Open Community Feed",
    secondaryLink: "/create",
    secondaryLabel: "Publish a New Route",
    routes: [
      {
        name: "Partner Session Circuit",
        difficulty: "Easy | V0-V1",
        style: "Fun",
        reason: "Great for climbing in pairs and exchanging beta quickly."
      },
      {
        name: "Crowd Favorite Ladder",
        difficulty: "Medium | V2-V4",
        style: "Social",
        reason: "Popular line with lots of community feedback and variations."
      },
      {
        name: "Group Warmup Relay",
        difficulty: "Easy | V0-V1",
        style: "Flow",
        reason: "Perfect for team sessions and confidence building."
      }
    ]
  }
};

function getMascotVariant(result, seed) {
  const avatars = result.mascot.avatars || [];
  const lines = result.mascot.lines || [];
  const safeSeed = Math.abs(Number(seed) || 0);
  const avatar = avatars.length > 0 ? avatars[safeSeed % avatars.length] : "馃";
  const line = lines.length > 0 ? lines[(safeSeed + 1) % lines.length] : "";
  return { avatar, line };
}

const mascotVisualByProfile = {
  flow: { shirt: "#4ba3d9", accent: "#7dd3fc", hair: "#3b2d1f", skin: "#f4c7a5", prop: "#0ea5e9" },
  power: { shirt: "#ef4444", accent: "#f97316", hair: "#2a1b14", skin: "#e9b48f", prop: "#dc2626" },
  endurance: { shirt: "#22c55e", accent: "#84cc16", hair: "#3a2a1d", skin: "#f1c49c", prop: "#65a30d" },
  tech: { shirt: "#8b5cf6", accent: "#6366f1", hair: "#1f2937", skin: "#edc19b", prop: "#4338ca" },
  social: { shirt: "#f59e0b", accent: "#ec4899", hair: "#4b2e20", skin: "#f2c6a0", prop: "#db2777" }
};

function AvatarFace({ style, smileCurve = 6 }) {
  return (
    <>
      <circle cx="60" cy="42" r="16" fill={style.skin} />
      <path
        d="M45 41c1.8-9.8 8.4-14.4 15-14.4 6.6 0 13.2 4.6 15 14.4-3.6-2.4-8.2-3.8-15-3.8s-11.4 1.4-15 3.8z"
        fill={style.hair}
      />
      <circle cx="55" cy="42" r="1.3" fill="#1f2937" />
      <circle cx="65" cy="42" r="1.3" fill="#1f2937" />
      <path d={`M54 48q6 ${smileCurve} 12 0`} stroke="#7c3f2a" strokeWidth="1.8" fill="none" />
    </>
  );
}

function VirtualClimberAvatar({ profileKey, seed }) {
  const style = mascotVisualByProfile[profileKey] || mascotVisualByProfile.flow;
  const safeSeed = Math.abs(Number(seed) || 0);
  const variant = safeSeed % 2;
  const gradientId = `bg-${profileKey}-${safeSeed % 1000}`;

  return (
    <svg viewBox="0 0 120 120" className="cq-mbti-avatar-svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={style.accent} stopOpacity="0.34" />
          <stop offset="100%" stopColor={style.shirt} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="116" height="116" rx="24" fill={`url(#${gradientId})`} />
      <path
        d="M10 92c24-10 45-8 64 0s23 8 36 0"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="3"
        fill="none"
      />

      {profileKey === "flow" && (
        <>
          <AvatarFace style={style} smileCurve={5} />
          <rect x="44" y="57" width="32" height="25" rx="12" fill={style.shirt} />
          <rect
            x="38"
            y="60"
            width="8"
            height="20"
            rx="4"
            fill={style.shirt}
            transform="rotate(-16 42 70)"
          />
          <rect
            x="74"
            y="60"
            width="8"
            height="20"
            rx="4"
            fill={style.shirt}
            transform="rotate(16 78 70)"
          />
          <rect x="50" y="81" width="7" height="22" rx="3.5" fill="#334155" />
          <rect x="63" y="81" width="7" height="22" rx="3.5" fill="#334155" />
          <ellipse cx="94" cy="54" rx="7" ry="9" fill={style.prop} />
        </>
      )}

      {profileKey === "power" && (
        <>
          <AvatarFace style={style} smileCurve={3} />
          <rect x="42" y="56" width="36" height="27" rx="10" fill={style.shirt} />
          <rect
            x="30"
            y="60"
            width="10"
            height="24"
            rx="5"
            fill={style.shirt}
            transform="rotate(-32 35 72)"
          />
          <rect
            x="80"
            y="58"
            width="10"
            height="26"
            rx="5"
            fill={style.shirt}
            transform="rotate(30 85 71)"
          />
          <rect x="49" y="82" width="8" height="22" rx="4" fill="#1f2937" />
          <rect x="63" y="82" width="8" height="22" rx="4" fill="#1f2937" />
          <polygon
            points="92,31 96,40 106,41 98,48 100,58 92,52 84,58 86,48 78,41 88,40"
            fill={style.prop}
          />
        </>
      )}

      {profileKey === "endurance" && (
        <>
          <AvatarFace style={style} smileCurve={7} />
          <rect x="45" y="57" width="30" height="26" rx="11" fill={style.shirt} />
          <rect x="35" y="60" width="8" height="23" rx="4" fill={style.shirt} />
          <rect x="77" y="60" width="8" height="23" rx="4" fill={style.shirt} />
          <rect x="49" y="82" width="8" height="22" rx="4" fill="#0f172a" />
          <rect x="63" y="82" width="8" height="22" rx="4" fill="#0f172a" />
          <circle cx="28" cy="64" r="6" fill="none" stroke={style.prop} strokeWidth="2.6" />
          <circle cx="92" cy="64" r="6" fill="none" stroke={style.prop} strokeWidth="2.6" />
        </>
      )}

      {profileKey === "tech" && (
        <>
          <AvatarFace style={style} smileCurve={4} />
          <rect x="44" y="58" width="32" height="24" rx="10" fill={style.shirt} />
          <rect x="36" y="61" width="8" height="21" rx="4" fill={style.shirt} />
          <rect x="76" y="61" width="8" height="21" rx="4" fill={style.shirt} />
          <rect x="50" y="82" width="7" height="22" rx="3.5" fill="#111827" />
          <rect x="63" y="82" width="7" height="22" rx="3.5" fill="#111827" />
          <rect x="82" y="70" width="20" height="14" rx="3" fill="#e5e7eb" stroke={style.prop} strokeWidth="1.6" />
          <circle cx="87" cy="75" r="1.6" fill={style.prop} />
          <circle cx="94" cy="75" r="1.6" fill={style.prop} />
          <path d="M84 80h14" stroke={style.prop} strokeWidth="1.3" />
        </>
      )}

      {profileKey === "social" && (
        <>
          <AvatarFace style={style} smileCurve={8} />
          <rect x="44" y="58" width="32" height="24" rx="10" fill={style.shirt} />
          <rect x="35" y="61" width="8" height="21" rx="4" fill={style.shirt} />
          <rect x="77" y="61" width="8" height="21" rx="4" fill={style.shirt} />
          <rect x="50" y="82" width="7" height="22" rx="3.5" fill="#334155" />
          <rect x="63" y="82" width="7" height="22" rx="3.5" fill="#334155" />
          <circle cx="24" cy="55" r="6" fill={style.prop} />
          <circle cx="96" cy="56" r="6" fill={style.accent} />
          {variant === 1 && <rect x="49" y="32" width="22" height="4" rx="2" fill={style.accent} />}
        </>
      )}
    </svg>
  );
}

function getTopProfileKey(scoreBoard) {
  return Object.entries(scoreBoard).sort((a, b) => b[1] - a[1])[0]?.[0] || "flow";
}

const routePlanPresets = {
  "Blue Slab Rhythm": {
    wallPhotoIndex: 0,
    start: { x: 18, y: 79 },
    finish: { x: 71, y: 22 },
    hands: [{ x: 29, y: 67 }, { x: 45, y: 52 }, { x: 58, y: 38 }],
    feet: [{ x: 21, y: 83 }, { x: 35, y: 74 }]
  },
  "Silent Corner Flow": {
    wallPhotoIndex: 1,
    start: { x: 16, y: 81 },
    finish: { x: 62, y: 27 },
    hands: [{ x: 24, y: 67 }, { x: 39, y: 51 }, { x: 53, y: 39 }],
    feet: [{ x: 19, y: 84 }, { x: 31, y: 72 }]
  },
  "Glass Wall Glide": {
    wallPhotoIndex: 2,
    start: { x: 23, y: 77 },
    finish: { x: 78, y: 31 },
    hands: [{ x: 35, y: 64 }, { x: 50, y: 49 }, { x: 65, y: 38 }],
    feet: [{ x: 26, y: 80 }, { x: 41, y: 68 }]
  },
  "Crimson Power Burst": {
    wallPhotoIndex: 0,
    start: { x: 34, y: 74 },
    finish: { x: 82, y: 26 },
    hands: [{ x: 41, y: 60 }, { x: 55, y: 46 }, { x: 70, y: 34 }],
    feet: [{ x: 31, y: 78 }, { x: 45, y: 67 }]
  },
  "Volume Dyno Punch": {
    wallPhotoIndex: 1,
    start: { x: 28, y: 76 },
    finish: { x: 76, y: 33 },
    hands: [{ x: 37, y: 63 }, { x: 52, y: 50 }, { x: 64, y: 39 }],
    feet: [{ x: 26, y: 80 }, { x: 40, y: 68 }]
  },
  "Overhang Strike Line": {
    wallPhotoIndex: 2,
    start: { x: 33, y: 73 },
    finish: { x: 84, y: 28 },
    hands: [{ x: 44, y: 61 }, { x: 59, y: 47 }, { x: 73, y: 35 }],
    feet: [{ x: 31, y: 77 }, { x: 47, y: 67 }]
  },
  "Long Traverse Engine": {
    wallPhotoIndex: 0,
    start: { x: 11, y: 69 },
    finish: { x: 86, y: 60 },
    hands: [{ x: 24, y: 66 }, { x: 39, y: 63 }, { x: 56, y: 62 }, { x: 72, y: 61 }],
    feet: [{ x: 15, y: 76 }, { x: 31, y: 72 }]
  },
  "Circuit River": {
    wallPhotoIndex: 1,
    start: { x: 12, y: 67 },
    finish: { x: 84, y: 58 },
    hands: [{ x: 26, y: 64 }, { x: 42, y: 62 }, { x: 58, y: 61 }, { x: 72, y: 60 }],
    feet: [{ x: 16, y: 75 }, { x: 34, y: 70 }]
  },
  "Wall Marathon Lite": {
    wallPhotoIndex: 2,
    start: { x: 13, y: 68 },
    finish: { x: 81, y: 53 },
    hands: [{ x: 27, y: 64 }, { x: 44, y: 60 }, { x: 61, y: 57 }],
    feet: [{ x: 18, y: 76 }, { x: 35, y: 70 }]
  },
  "Volume Logic Maze": {
    wallPhotoIndex: 2,
    start: { x: 25, y: 79 },
    finish: { x: 69, y: 25 },
    hands: [{ x: 34, y: 66 }, { x: 47, y: 53 }, { x: 58, y: 40 }],
    feet: [{ x: 26, y: 82 }, { x: 40, y: 71 }]
  },
  "Heel Hook Study": {
    wallPhotoIndex: 1,
    start: { x: 31, y: 80 },
    finish: { x: 74, y: 29 },
    hands: [{ x: 40, y: 66 }, { x: 52, y: 52 }, { x: 64, y: 38 }],
    feet: [{ x: 30, y: 84 }, { x: 45, y: 72 }]
  },
  "Micro Beta Lab": {
    wallPhotoIndex: 0,
    start: { x: 22, y: 77 },
    finish: { x: 67, y: 30 },
    hands: [{ x: 32, y: 65 }, { x: 45, y: 53 }, { x: 57, y: 41 }],
    feet: [{ x: 22, y: 81 }, { x: 36, y: 70 }]
  },
  "Partner Session Circuit": {
    wallPhotoIndex: 0,
    start: { x: 17, y: 78 },
    finish: { x: 75, y: 34 },
    hands: [{ x: 28, y: 65 }, { x: 43, y: 52 }, { x: 58, y: 42 }],
    feet: [{ x: 19, y: 82 }, { x: 34, y: 71 }]
  },
  "Crowd Favorite Ladder": {
    wallPhotoIndex: 1,
    start: { x: 20, y: 79 },
    finish: { x: 68, y: 30 },
    hands: [{ x: 30, y: 67 }, { x: 42, y: 55 }, { x: 54, y: 44 }],
    feet: [{ x: 21, y: 83 }, { x: 36, y: 73 }]
  },
  "Group Warmup Relay": {
    wallPhotoIndex: 2,
    start: { x: 18, y: 78 },
    finish: { x: 63, y: 33 },
    hands: [{ x: 29, y: 67 }, { x: 40, y: 56 }, { x: 52, y: 45 }],
    feet: [{ x: 20, y: 82 }, { x: 33, y: 72 }]
  }
};

function parseDifficultyLabel(difficultyLabel) {
  if (difficultyLabel.includes("Hard")) return "Hard";
  if (difficultyLabel.includes("Medium")) return "Medium";
  return "Easy";
}

function buildRouteDetailState(route, result) {
  const plan = routePlanPresets[route.name] || null;

  return {
    title: route.name,
    difficulty: parseDifficultyLabel(route.difficulty),
    tags: [route.style],
    description: route.reason,
    suitableFor: "Quiz Recommendation",
    holdContours: [],
    wallPhotoIndex: plan?.wallPhotoIndex ?? 0,
    createdTimeLabel: "Recommended now",
    source: "AI",
    creator: {
      name: result.mascot.name,
      club: "ClimbQuest Quiz Coach"
    },
    averageRating: 4.4,
    ratingCount: 32,
    routePlan: plan
  };
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  // answerMap stores selected option index by question id.
  const [answerMap, setAnswerMap] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [mascotSeed, setMascotSeed] = useState(Date.now());

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
  const mascotVariant = useMemo(
    () => getMascotVariant(result, mascotSeed),
    [result, mascotSeed]
  );

  function handleSelectOption(optionIndex) {
    setAnswerMap((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  }

  function handleNext() {
    if (currentQuestionIndex >= quizQuestions.length - 1) {
      setMascotSeed(Date.now());
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
    setMascotSeed(Date.now());
  }

  function openRecommendedRoute(route) {
    navigate("/route-detail", {
      state: {
        route: buildRouteDetailState(route, result)
      }
    });
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

          <section className="cq-discover-mascot-card" aria-label="Virtual coach">
            <div className="cq-discover-mascot-avatar" aria-hidden="true">
              <VirtualClimberAvatar profileKey={topProfileKey} seed={mascotSeed} />
            </div>
            <div>
              <p className="cq-discover-mascot-name">
                {result.mascot.name} · {result.mascot.role}
              </p>
              <p className="cq-discover-mascot-line">{mascotVariant.line}</p>
              <p className="cq-discover-mascot-emoji">{result.emoji}</p>
            </div>
          </section>

          <section className="cq-discover-route-pick">
            <p className="cq-discover-route-label">Suggested route vibe</p>
            <p className="cq-discover-route-name">{result.routePick}</p>
            <p className="cq-discover-route-reason">{result.reason}</p>
          </section>

          <section className="cq-discover-reco-list" aria-label="Recommended routes by profile">
            {result.routes.map((route) => (
              <Link
                key={`${result.name}-${route.name}`}
                className="cq-discover-reco-link cq-discover-reco-card"
                to="/route-detail"
                state={{
                  route: buildRouteDetailState(route, result)
                }}
              >
                <div className="cq-route-top-row">
                  <h4>{route.name}</h4>
                  <span className="cq-route-difficulty">{route.difficulty}</span>
                </div>
                <span className="cq-route-style-tag">{route.style}</span>
                <p className="cq-route-description">{route.reason}</p>
                <p className="cq-route-reason">Tap to view start/finish + hand/foot points</p>
              </Link>
            ))}
          </section>

          <div className="cq-discover-result-actions">
            <button
              type="button"
              className="cq-primary-btn cq-discover-result-btn"
              onClick={() => openRecommendedRoute(result.routes[0])}
            >
              {result.primaryLabel}
            </button>
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

