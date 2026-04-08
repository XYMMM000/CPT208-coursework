import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // Keep onboarding answers in one object so the data model is simple for beginners.
  const [selections, setSelections] = useState({
    level: "",
    style: "",
    goal: ""
  });

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
    setSelections((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function handleBack() {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }

  function handleNext() {
    if (!hasSelectedCurrentStep) return;

    if (isLastStep) {
      // In a real app, you could save selections to backend/local storage here.
      console.log("Onboarding selections:", selections);
      navigate("/home");
      return;
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
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
      </section>
    </div>
  );
}
