import React, { useMemo, useState } from "react";

const USER = {
  name: "Luna",
  level: "V2 Explorer",
  streak: 6,
  gym: "Vertical Peak Climbing Gym",
};

const INITIAL_QUESTS = [
  {
    id: 1,
    title: "Warm-Up Flow",
    zone: "Zone A · Slab",
    difficulty: "Easy",
    points: 20,
    done: false,
    tip: "Focus on quiet feet and balance.",
  },
  {
    id: 2,
    title: "Technique Quest",
    zone: "Zone C · Vertical",
    difficulty: "V1–V2",
    points: 40,
    done: false,
    tip: "Keep hips close to the wall.",
  },
  {
    id: 3,
    title: "Confidence Push",
    zone: "Zone D · Overhang",
    difficulty: "V2",
    points: 60,
    done: false,
    tip: "Try one dynamic move and commit.",
  },
];

const BUDDIES = [
  { id: 1, name: "Mia", match: "92% match", style: "Beginner-friendly", goal: "Technique practice" },
  { id: 2, name: "Leo", match: "87% match", style: "Encouraging", goal: "V2 breakthrough" },
  { id: 3, name: "Kai", match: "81% match", style: "Chill session", goal: "After-work climbing" },
];

const FEEDBACK_CARDS = [
  {
    id: 1,
    coach: "Coach Amy",
    tag: "Footwork improving",
    note: "You used your legs better today. Next step: trust your right foot on small holds.",
  },
  {
    id: 2,
    coach: "System Insight",
    tag: "Confidence rising",
    note: "You attempted 2 harder routes this week. Keep one challenge route per session to build momentum.",
  },
];

const NAV_ITEMS = [
  ["home", "Home"],
  ["quest", "Quest"],
  ["buddy", "Buddy"],
  ["growth", "Growth"],
];

const DIFFICULTY_THEME = {
  Easy: {
    badge: "V0 · Easy",
    tone: "text-emerald-700 bg-emerald-100 border-emerald-200",
    card: "border-emerald-200 bg-emerald-50/60",
    rail: "bg-emerald-500",
  },
  "V1–V2": {
    badge: "V2 · Medium",
    tone: "text-amber-700 bg-amber-100 border-amber-200",
    card: "border-amber-200 bg-amber-50/50",
    rail: "bg-amber-500",
  },
  V2: {
    badge: "V3 · Challenge",
    tone: "text-rose-700 bg-rose-100 border-rose-200",
    card: "border-rose-200 bg-rose-50/60",
    rail: "bg-rose-500",
  },
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function calculateProgress(quests) {
  if (!Array.isArray(quests) || quests.length === 0) {
    return { completed: 0, totalPoints: 0, progress: 0 };
  }

  const completed = quests.filter((q) => q.done).length;
  const totalPoints = quests.filter((q) => q.done).reduce((sum, q) => sum + q.points, 0);
  const progress = Math.round((completed / quests.length) * 100);

  return { completed, totalPoints, progress };
}

function calculateDimensions(completed) {
  return [
    ["Technique", clamp(62 + completed * 10)],
    ["Consistency", clamp(72 + completed * 6)],
    ["Confidence", clamp(55 + completed * 12)],
    ["Strength", clamp(48 + completed * 8)],
  ];
}

function getDifficultyTheme(difficulty) {
  return (
    DIFFICULTY_THEME[difficulty] || {
      badge: difficulty,
      tone: "text-slate-700 bg-slate-100 border-slate-200",
      card: "border-slate-200 bg-white",
      rail: "bg-slate-400",
    }
  );
}

function NavIcon({ name, active }) {
  const base = active ? "text-white" : "text-slate-500";
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className={`w-4 h-4 ${base}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.8V21h13V9.8" />
      </svg>
    );
  }
  if (name === "quest") {
    return (
      <svg viewBox="0 0 24 24" className={`w-4 h-4 ${base}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 20h12" />
        <path d="M8 20V7l4-3 4 3v13" />
      </svg>
    );
  }
  if (name === "buddy") {
    return (
      <svg viewBox="0 0 24 24" className={`w-4 h-4 ${base}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="9" r="3" />
        <circle cx="16" cy="9" r="3" />
        <path d="M3.5 20a4.5 4.5 0 0 1 9 0" />
        <path d="M11.5 20a4.5 4.5 0 0 1 9 0" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={`w-4 h-4 ${base}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 18h16" />
      <path d="M7 18V9" />
      <path d="M12 18V5" />
      <path d="M17 18v-6" />
    </svg>
  );
}

function runDemoTests() {
  const empty = calculateProgress([]);
  console.assert(empty.completed === 0, "Expected empty completed count to be 0");
  console.assert(empty.totalPoints === 0, "Expected empty total points to be 0");
  console.assert(empty.progress === 0, "Expected empty progress to be 0");

  const full = calculateProgress(INITIAL_QUESTS.map((q) => ({ ...q, done: true })));
  console.assert(full.completed === 3, "Expected all quests to be completed");
  console.assert(full.totalPoints === 120, "Expected total points to equal 120");
  console.assert(full.progress === 100, "Expected full progress to be 100");

  const dimensions = calculateDimensions(10);
  console.assert(dimensions.every(([, value]) => value <= 100), "Expected dimension values to be clamped at 100");
}

runDemoTests();

export default function ClimbQuestDemo() {
  const [tab, setTab] = useState("home");
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [storyOpen, setStoryOpen] = useState(false);

  const { completed, totalPoints, progress } = useMemo(() => calculateProgress(quests), [quests]);
  const dimensions = useMemo(() => calculateDimensions(completed), [completed]);
  const radarPoints = useMemo(() => {
    const centerX = 90;
    const centerY = 90;
    const radius = 62;
    return dimensions
      .map(([, value], index) => {
        const angle = ((Math.PI * 2) / dimensions.length) * index - Math.PI / 2;
        const valueRadius = (value / 100) * radius;
        const x = centerX + Math.cos(angle) * valueRadius;
        const y = centerY + Math.sin(angle) * valueRadius;
        return `${x},${y}`;
      })
      .join(" ");
  }, [dimensions]);

  const toggleQuest = (id) => {
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, done: !q.done } : q)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-cyan-50 to-emerald-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[390px_1fr] gap-6">
        <div className="mx-auto w-full max-w-sm rounded-[2rem] shadow-2xl bg-white overflow-hidden border border-slate-200 ring-4 ring-white/60">
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white p-5">
            <div className="flex items-center justify-between text-sm opacity-90">
              <span>{USER.gym}</span>
              <span>On-site Demo</span>
            </div>
            <div className="mt-5 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] opacity-75">Welcome back</p>
                <h1 className="text-2xl font-bold mt-1">{USER.name}</h1>
                <p className="mt-1 text-emerald-50">{USER.level} · {USER.streak}-day streak</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🪨</div>
            </div>
            <div className="mt-5 bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex justify-between text-sm">
                <span>Today Quest Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-lg font-semibold">{completed}</div>
                  <div className="text-[11px] opacity-80">Finished</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-lg font-semibold">{totalPoints}</div>
                  <div className="text-[11px] opacity-80">XP</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-lg font-semibold">V2</div>
                  <div className="text-[11px] opacity-80">Goal</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 pb-24 min-h-[620px]">
            {tab === "home" && (
              <div className="space-y-4">
                <section className="rounded-2xl border border-emerald-200 p-4 bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Dynamic mission</p>
                      <h2 className="font-semibold text-lg">45-min after-work session</h2>
                    </div>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">Balanced plan for technique, confidence, and one light challenge route.</p>
                  <button onClick={() => setTab("quest")} className="mt-3 w-full rounded-xl bg-slate-900 text-white py-3 font-medium shadow-lg shadow-slate-900/15 transition hover:translate-y-[-1px]">Start Today’s Quest</button>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-500">Buddy radar</div>
                    <div className="text-xl font-semibold mt-1">3 nearby matches</div>
                    <button onClick={() => setTab("buddy")} className="mt-3 text-sm font-medium text-teal-700">Open matching →</button>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-500">Coach signal</div>
                    <div className="text-xl font-semibold mt-1">2 fresh feedback cards</div>
                    <button onClick={() => setTab("growth")} className="mt-3 text-sm font-medium text-teal-700">Review insights →</button>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Your Climb Story Card</h3>
                    <span>✨</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">Turn today’s session into a shareable growth story for your climbing circle.</p>
                  <button onClick={() => setStoryOpen((v) => !v)} className="mt-3 w-full rounded-xl border border-slate-300 py-3 font-medium">{storyOpen ? "Hide Story Card" : "Preview Story Card"}</button>
                  {storyOpen && (
                    <div className="mt-3 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white p-4">
                      <div className="text-xs uppercase tracking-[0.18em] opacity-70">Climb Story</div>
                      <div className="mt-2 text-xl font-semibold">Today I pushed past my comfort zone.</div>
                      <div className="mt-3 text-sm opacity-90">Completed {completed}/3 quests · Earned {totalPoints} XP · Focused on footwork and confidence.</div>
                      <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm">“You’re building smoother movement and better trust in your feet.” — Coach Amy</div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {tab === "quest" && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Today’s route plan</p>
                  <h2 className="text-xl font-semibold">Quest sequence</h2>
                </div>
                {quests.map((q, idx) => {
                  const theme = getDifficultyTheme(q.difficulty);
                  return (
                  <div key={q.id} className={`rounded-2xl border p-4 transition ${q.done ? "border-emerald-300 bg-emerald-50" : theme.card}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className={`w-1.5 rounded-full ${theme.rail}`} />
                        <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Mission {idx + 1}</div>
                        <div className="font-semibold text-lg mt-1">{q.title}</div>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-slate-600">{q.zone}</span>
                          <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold ${theme.tone}`}>{theme.badge}</span>
                        </div>
                        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">Tip: {q.tip}</div>
                      </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-teal-700">+{q.points} XP</div>
                        <button
                          onClick={() => toggleQuest(q.id)}
                          className={`mt-3 rounded-xl px-4 py-2 text-sm font-medium ${q.done ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"}`}
                        >
                          {q.done ? "Completed" : "Mark done"}
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 bg-slate-50">
                  <div className="font-medium">Adaptive suggestion</div>
                  <div className="text-sm text-slate-600 mt-1">If the overhang feels too hard today, switch to a V1 balance challenge and keep the confidence streak alive.</div>
                </div>
              </div>
            )}

            {tab === "buddy" && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">On-site social mode</p>
                  <h2 className="text-xl font-semibold">Buddy Match</h2>
                </div>
                {BUDDIES.map((b) => (
                  <div key={b.id} className={`rounded-2xl border p-4 ${selectedBuddy?.id === b.id ? "border-teal-400 bg-teal-50" : "border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{b.name}</div>
                        <div className="text-sm text-slate-600 mt-1">{b.match} · {b.style}</div>
                        <div className="text-sm text-slate-500 mt-1">Goal: {b.goal}</div>
                      </div>
                      <button onClick={() => setSelectedBuddy(b)} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium">Match</button>
                    </div>
                  </div>
                ))}

                {selectedBuddy && (
                  <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-4">
                    <div className="text-sm opacity-90">Matched with {selectedBuddy.name}</div>
                    <div className="text-xl font-semibold mt-1">Break-the-ice challenge unlocked</div>
                    <div className="mt-2 text-sm opacity-95">Complete one warm-up route together and exchange one route recommendation.</div>
                    <button className="mt-3 rounded-xl bg-white text-slate-900 px-4 py-3 text-sm font-semibold">Start team mini quest</button>
                  </div>
                )}
              </div>
            )}

            {tab === "growth" && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Progress beyond grades</p>
                  <h2 className="text-xl font-semibold">Growth Dashboard</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                    <div className="mx-auto">
                      <svg width="180" height="180" viewBox="0 0 180 180">
                        <circle cx="90" cy="90" r="62" fill="#ecfeff" stroke="#bae6fd" />
                        <polygon points={radarPoints} fill="rgba(20, 184, 166, 0.35)" stroke="#0f766e" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      {dimensions.map(([label, value]) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{label}</span>
                          <span>{value}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {FEEDBACK_CARDS.map((f) => (
                    <div key={f.id} className="rounded-2xl border border-slate-200 p-4 bg-white">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold">{f.coach}</div>
                        <div className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">{f.tag}</div>
                      </div>
                      <p className="text-sm text-slate-600 mt-3">{f.note}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="font-medium">Healthy climbing reminder</div>
                  <div className="text-sm text-slate-700 mt-1">You’ve done well today. Consider ending with a wrist and shoulder stretch to protect recovery streaks.</div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-4 px-2 py-2">
            {NAV_ITEMS.map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`rounded-2xl py-2 flex flex-col items-center gap-1 ${tab === key ? "bg-slate-900 text-white" : "text-slate-500"}`}>
                <NavIcon name={key} active={tab === key} />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-lg border border-slate-200 p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-teal-700">ClimbQuest Demo</div>
                <h2 className="text-3xl font-bold mt-2">Usable web app concept for your coursework</h2>
                <p className="text-slate-600 mt-3 max-w-2xl">This interactive demo shows a mobile-first on-site climbing experience with three core playful features: dynamic quests, buddy matching, and coach feedback. It is designed to support beginners and intermediate climbers in climbing gyms.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 min-w-[220px]">
                <div className="font-semibold">Must-have playful features</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc ml-5">
                  <li>Dynamic mission generator</li>
                  <li>Buddy matching with mini team quests</li>
                  <li>Coach + system growth feedback</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className="text-2xl">1️⃣</div>
              <div className="font-semibold text-lg mt-3">On-site Quest</div>
              <p className="text-sm text-slate-600 mt-2">The app creates a tailored mission sequence based on time, skill level, and confidence.</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className="text-2xl">2️⃣</div>
              <div className="font-semibold text-lg mt-3">Social Motivation</div>
              <p className="text-sm text-slate-600 mt-2">Buddy Match lowers the barrier to meeting partners and turns sessions into shared mini-adventures.</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className="text-2xl">3️⃣</div>
              <div className="font-semibold text-lg mt-3">Human-Centric Growth</div>
              <p className="text-sm text-slate-600 mt-2">Progress is tracked beyond grades, including confidence, consistency, and sustainable training behavior.</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-lg border border-slate-200 p-6 md:p-8">
            <h3 className="text-2xl font-bold">Recommended next build steps</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="font-semibold">For poster / portfolio</div>
                <p className="text-sm text-slate-600 mt-2">Use screenshots from this demo for screen flow, user journey, and feature explanation panels.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="font-semibold">For development</div>
                <p className="text-sm text-slate-600 mt-2">Convert this prototype into a real React or Next.js app with data storage, QR zone scanning, and onboarding logic.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
