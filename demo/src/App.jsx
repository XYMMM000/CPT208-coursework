import React from "react";
import "./App.css";

function PrimaryButton({ text }) {
  return <button className="primary-button">{text}</button>;
}

function FeatureCard({ title, description, emoji }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{emoji}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function BottomNavPreview() {
  const navItems = [
    { label: "Home", icon: "🏠" },
    { label: "Routes", icon: "🧗" },
    { label: "Explore", icon: "🗺️" },
    { label: "Profile", icon: "👤" },
  ];

  return (
    <div className="bottom-nav-preview">
      {navItems.map((item) => (
        <div className="nav-item" key={item.label}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const features = [
    {
      title: "Personalized Challenge",
      description: "Challenges tailored to your skill level.",
      emoji: "🎯",
    },
    {
      title: "DIY Route Creation",
      description: "Create and share your own routes.",
      emoji: "🛠️",
    },
    {
      title: "Community Rating",
      description: "Get feedback from other climbers.",
      emoji: "⭐",
    },
  ];

  return (
    <div className="app">
      <section className="hero">
        <h1>ClimbQuest</h1>
        <p className="subtitle">
          A playful climbing experience platform for route creation, challenge
          discovery, and community feedback
        </p>
        <PrimaryButton text="Start Your Climb" />
      </section>

      <section className="features-section">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </section>

      <BottomNavPreview />
    </div>
  );
}