import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function mapFirebaseError(errorCode) {
  if (errorCode === "auth/email-already-in-use") {
    return "This email is already in use. Try logging in.";
  }
  if (errorCode === "auth/invalid-email") return "Please enter a valid email.";
  if (errorCode === "auth/weak-password") return "Password should be at least 6 characters.";
  return "Unable to create account. Please try again.";
}

export default function SignupPage() {
  const { currentUser, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to="/home" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    // Simple client-side check for beginner-friendly UX.
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signUpWithEmail(email, password);
      navigate("/onboarding", { replace: true });
    } catch (error) {
      setErrorMessage(mapFirebaseError(error.code));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="cq-auth-page">
      <article className="cq-auth-card">
        <p className="cq-page-eyebrow">Get Started</p>
        <h2>Create your ClimbQuest account</h2>
        <p>Sign up with email and password to save routes and track progress.</p>

        <form className="cq-auth-form" onSubmit={handleSubmit}>
          <label className="cq-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="cq-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>

          <label className="cq-field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat password"
              required
            />
          </label>

          {errorMessage && <p className="cq-auth-error">{errorMessage}</p>}

          <button type="submit" className="cq-primary-btn cq-auth-btn" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="cq-auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </article>
    </section>
  );
}
