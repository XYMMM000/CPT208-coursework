import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function mapFirebaseError(errorCode) {
  if (errorCode === "auth/invalid-email") return "Please enter a valid email.";
  if (errorCode === "auth/user-disabled") return "This account has been disabled.";
  if (errorCode === "auth/user-not-found") return "No account found with this email.";
  if (errorCode === "auth/wrong-password") return "Incorrect password.";
  if (errorCode === "auth/invalid-credential") return "Email or password is incorrect.";
  if (errorCode === "auth/too-many-requests") return "Too many attempts. Try again later.";
  return "Unable to log in. Please try again.";
}

export default function LoginPage() {
  const { currentUser, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, go directly to app home.
  if (currentUser) {
    return <Navigate to="/home" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await loginWithEmail(email, password);
      navigate("/home", { replace: true });
    } catch (error) {
      setErrorMessage(mapFirebaseError(error.code));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="cq-auth-page">
      <article className="cq-auth-card">
        <p className="cq-page-eyebrow">Welcome Back</p>
        <h2>Log in to ClimbQuest</h2>
        <p>Use your email account to continue your climbing journey.</p>

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
              placeholder="Enter password"
              required
            />
          </label>

          {errorMessage && <p className="cq-auth-error">{errorMessage}</p>}

          <button type="submit" className="cq-primary-btn cq-auth-btn" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="cq-auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </article>
    </section>
  );
}
