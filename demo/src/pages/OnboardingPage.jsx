import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const experienceOptions = ["Beginner", "Intermediate", "Advanced"];
const styleOptions = ["Balance", "Strength", "Endurance", "Technique", "Fun"];
const goalOptions = ["Learn", "Challenge", "Socialize", "Improve technique"];

function OptionGroup({ title, options, selectedValue, onSelect }) {
  return (
    <section className="cq-onboarding-group" aria-label={title}>
      <h2>{title}</h2>

      <div className="cq-option-grid">
        {options.map((option) => {
          const isSelected = selectedValue === option;

          return (
            <button
              key={option}
              type="button"
              className={`cq-option-card ${isSelected ? "cq-option-card-selected" : ""}`}
              onClick={() => onSelect(option)}
              aria-pressed={isSelected}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();

  // We keep all selections in one state object so beginners can see the full form state clearly.
  const [selections, setSelections] = useState({
    level: "",
    style: "",
    goal: ""
  });

  // Progress is based on how many onboarding sections are completed.
  const progress = useMemo(() => {
    const completed = Object.values(selections).filter(Boolean).length;
    return {
      completed,
      total: 3,
      percent: (completed / 3) * 100
    };
  }, [selections]);

  const isFormComplete = progress.completed === progress.total;

  function updateSelection(field, value) {
    setSelections((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function handleContinue() {
    if (!isFormComplete) return;

    // In a real app, this is where you could save selections to backend/local storage.
    console.log("Onboarding selections:", selections);
    navigate("/home");
  }

  return (
    <div className="cq-onboarding-page">
      <section className="cq-onboarding-card">
        <p className="cq-eyebrow">Step 1 of 3</p>
        <h1>Let&apos;s personalize your climb</h1>
        <p className="cq-subtitle">
          Pick a few options so ClimbQuest can recommend better challenges for you.
        </p>

        {/* Progress indicator for onboarding */}
        <div className="cq-progress-wrapper" aria-label="Onboarding progress">
          <div className="cq-progress-meta">
            <span>Progress</span>
            <span>
              {progress.completed}/{progress.total}
            </span>
          </div>
          <div className="cq-progress-track">
            <div
              className="cq-progress-fill"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <OptionGroup
          title="Experience level"
          options={experienceOptions}
          selectedValue={selections.level}
          onSelect={(value) => updateSelection("level", value)}
        />

        <OptionGroup
          title="Preferred climbing style"
          options={styleOptions}
          selectedValue={selections.style}
          onSelect={(value) => updateSelection("style", value)}
        />

        <OptionGroup
          title="Goal today"
          options={goalOptions}
          selectedValue={selections.goal}
          onSelect={(value) => updateSelection("goal", value)}
        />

        <button
          type="button"
          className="cq-primary-btn cq-onboarding-continue"
          onClick={handleContinue}
          disabled={!isFormComplete}
        >
          Continue
        </button>
      </section>
    </div>
  );
}
