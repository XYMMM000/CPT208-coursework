import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ONBOARDING_STORAGE_KEY = "climbquest_onboarding_preferences";

const steps = [
  {
    key: "level",
    title: "Experience level",
    options: ["Beginner", "Intermediate", "Advanced"]
  },
  {
    key: "style",
    title: "Preferred climbing style",
    options: ["Balance", "Strength", "Endurance", "Technique", "Fun"]
  },
  {
    key: "goal",
    title: "Goal today",
    options: ["Learn", "Challenge", "Socialize", "Improve technique"]
  }
];

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

  function getInitialSelections() {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!saved) {
        return { level: "", style: "", goal: "" };
      }

      const parsed = JSON.parse(saved);
      return {
        level: parsed.level || "",
        style: parsed.style || "",
        goal: parsed.goal || ""
      };
    } catch {
      return { level: "", style: "", goal: "" };
    }
  }

  // Keep onboarding answers in one object so the data model is simple for beginners.
  const [selections, setSelections] = useState(getInitialSelections);

  // Step index controls which onboarding question is visible.
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Progress is based on the current screen position in the 3-step flow.
  const progress = useMemo(() => {
    const completed = currentStepIndex + 1;
    return {
      completed,
      total: totalSteps,
      percent: (completed / totalSteps) * 100
    };
  }, [currentStepIndex, totalSteps]);

  const hasSelectedCurrentStep = Boolean(selections[currentStep.key]);

  function updateSelection(field, value) {
    setSelections((prev) => {
      const nextSelections = {
        ...prev,
        [field]: value
      };

      // Save every change so refresh will not lose onboarding progress.
      localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify(nextSelections)
      );

      return nextSelections;
    });
  }

  function handleBack() {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }

  function handleNext() {
    if (!hasSelectedCurrentStep) return;

    if (isLastStep) {
      // In a real app, you could save selections to backend/local storage here.
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(selections));
      console.log("Onboarding selections:", selections);
      navigate("/home");
      return;
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }

  function handleResetPreferences() {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setSelections({
      level: "",
      style: "",
      goal: ""
    });
    setCurrentStepIndex(0);
  }

  return (
    <div className="cq-onboarding-page">
      <section className="cq-onboarding-card">
        <p className="cq-eyebrow">
          Step {progress.completed} of {progress.total}
        </p>
        <h1>Let&apos;s personalize your climb</h1>
        <p className="cq-subtitle">
          Pick your preferences so ClimbQuest can suggest better routes and challenges.
        </p>

        {/* Progress indicator for multi-step onboarding */}
        <div className="cq-progress-wrapper" aria-label="Onboarding progress">
          <div className="cq-progress-meta">
            <span>Progress</span>
            <span>{Math.round(progress.percent)}%</span>
          </div>
          <div className="cq-progress-track">
            <div
              className="cq-progress-fill"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <OptionGroup
          title={currentStep.title}
          options={currentStep.options}
          selectedValue={selections[currentStep.key]}
          onSelect={(value) => updateSelection(currentStep.key, value)}
        />

        {/* Navigation buttons for step-by-step onboarding */}
        <div className="cq-onboarding-actions">
          <button
            type="button"
            className="cq-secondary-btn"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </button>

          <button
            type="button"
            className="cq-primary-btn cq-onboarding-continue"
            onClick={handleNext}
            disabled={!hasSelectedCurrentStep}
          >
            {isLastStep ? "Continue" : "Next"}
          </button>
        </div>

        <button
          type="button"
          className="cq-reset-btn"
          onClick={handleResetPreferences}
        >
          Reset preferences
        </button>
      </section>
    </div>
  );
}
