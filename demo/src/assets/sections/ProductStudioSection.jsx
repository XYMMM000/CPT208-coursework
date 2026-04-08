import { useEffect, useMemo, useState } from "react";
import Container from "../components/Container";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import { hasSupabaseConfig, supabase } from "../../lib/supabaseClient";

const emptyRouteForm = {
  title: "",
  grade: "",
  gymName: "",
  notes: "",
};

export default function ProductStudioSection() {
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [session, setSession] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [routeForm, setRouteForm] = useState(emptyRouteForm);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRoutes, setFetchingRoutes] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = session?.user ?? null;
  const routeCountText = useMemo(() => `${routes.length} routes`, [routes.length]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      setError("");
      setMessage("");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || !supabase) {
      setRoutes([]);
      setProfileName("");
      return;
    }

    setProfileName(user.user_metadata?.full_name ?? "");
    fetchRoutes(user.id);
  }, [user?.id]);

  async function fetchRoutes(userId) {
    if (!supabase || !userId) return;
    setFetchingRoutes(true);
    setError("");
    const { data, error: fetchError } = await supabase
      .from("routes")
      .select("id, title, grade, gym_name, notes, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setFetchingRoutes(false);
      return;
    }

    setRoutes(data ?? []);
    setFetchingRoutes(false);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "register") {
      const { error: signUpError } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          data: {
            full_name: authForm.fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("Registration successful. Please check your email to verify.");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        setMessage("Welcome back.");
      }
    }
    setLoading(false);
  }

  async function handleLogout() {
    if (!supabase) return;
    setLoading(true);
    setError("");
    setMessage("");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    setLoading(false);
  }

  async function handleProfileUpdate(event) {
    event.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError("");
    setMessage("");
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: profileName },
    });
    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Profile updated.");
    }
    setLoading(false);
  }

  async function handleRouteCreate(event) {
    event.preventDefault();
    if (!supabase || !user) return;

    setLoading(true);
    setError("");
    setMessage("");

    const { error: createError } = await supabase.from("routes").insert({
      user_id: user.id,
      title: routeForm.title,
      grade: routeForm.grade,
      gym_name: routeForm.gymName,
      notes: routeForm.notes,
    });

    if (createError) {
      setError(createError.message);
    } else {
      setRouteForm(emptyRouteForm);
      setMessage("Route created.");
      await fetchRoutes(user.id);
    }
    setLoading(false);
  }

  async function handleDeleteRoute(routeId) {
    if (!supabase || !user) return;
    setLoading(true);
    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("routes")
      .delete()
      .eq("id", routeId)
      .eq("user_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage("Route deleted.");
      await fetchRoutes(user.id);
    }
    setLoading(false);
  }

  return (
    <section className="section product-section reveal-on-scroll" id="studio">
      <Container>
        <SectionTitle
          eyebrow="Core Product"
          title="Login, user data, and route creation in one iOS-style workflow"
          description="This section is connected to Supabase Auth and user-scoped route data."
        />

        {!hasSupabaseConfig ? (
          <div className="ios-card setup-card">
            <h3>Supabase setup needed</h3>
            <p>
              Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{" "}
              in your environment to enable login, registration, and route persistence.
            </p>
          </div>
        ) : (
          <div className="product-shell">
            {!user ? (
              <article className="ios-card auth-card">
                <div className="segmented-control" role="tablist" aria-label="Auth mode">
                  <button
                    type="button"
                    className={mode === "login" ? "segment active" : "segment"}
                    onClick={() => setMode("login")}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={mode === "register" ? "segment active" : "segment"}
                    onClick={() => setMode("register")}
                  >
                    Register
                  </button>
                </div>

                <form className="ios-form" onSubmit={handleAuthSubmit}>
                  {mode === "register" ? (
                    <label className="form-group">
                      <span>Full Name</span>
                      <input
                        type="text"
                        value={authForm.fullName}
                        onChange={(event) =>
                          setAuthForm((prev) => ({ ...prev, fullName: event.target.value }))
                        }
                        placeholder="Alex climber"
                        required
                      />
                    </label>
                  ) : null}

                  <label className="form-group">
                    <span>Email</span>
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(event) =>
                        setAuthForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="you@climbquest.app"
                      required
                    />
                  </label>

                  <label className="form-group">
                    <span>Password</span>
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(event) =>
                        setAuthForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      minLength={6}
                      required
                    />
                  </label>

                  <PrimaryButton
                    type="submit"
                    label={loading ? "Please wait..." : mode === "register" ? "Create Account" : "Login"}
                  />
                </form>
              </article>
            ) : (
              <>
                <article className="ios-card user-card">
                  <div className="user-meta">
                    <span className="user-chip">Signed in</span>
                    <h3>{profileName || "ClimbQuest User"}</h3>
                    <p>{user.email}</p>
                    <p className="data-stat">{routeCountText}</p>
                  </div>

                  <form className="ios-form compact-form" onSubmit={handleProfileUpdate}>
                    <label className="form-group">
                      <span>Display Name</span>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        placeholder="Your public name"
                      />
                    </label>
                    <div className="inline-actions">
                      <PrimaryButton type="submit" label="Save Profile" />
                      <button type="button" className="ghost-button" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </form>
                </article>

                <article className="ios-card route-create-card">
                  <h3>Create Route</h3>
                  <form className="ios-form route-form" onSubmit={handleRouteCreate}>
                    <label className="form-group">
                      <span>Route Title</span>
                      <input
                        type="text"
                        value={routeForm.title}
                        onChange={(event) =>
                          setRouteForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                        placeholder="Moonlight Traverse"
                        required
                      />
                    </label>

                    <label className="form-group">
                      <span>Grade</span>
                      <input
                        type="text"
                        value={routeForm.grade}
                        onChange={(event) =>
                          setRouteForm((prev) => ({ ...prev, grade: event.target.value }))
                        }
                        placeholder="V4"
                        required
                      />
                    </label>

                    <label className="form-group">
                      <span>Gym</span>
                      <input
                        type="text"
                        value={routeForm.gymName}
                        onChange={(event) =>
                          setRouteForm((prev) => ({ ...prev, gymName: event.target.value }))
                        }
                        placeholder="ClimbQuest Lab"
                        required
                      />
                    </label>

                    <label className="form-group">
                      <span>Notes</span>
                      <textarea
                        rows={4}
                        value={routeForm.notes}
                        onChange={(event) =>
                          setRouteForm((prev) => ({ ...prev, notes: event.target.value }))
                        }
                        placeholder="Footwork-focused route with dynamic finish."
                      />
                    </label>

                    <PrimaryButton type="submit" label={loading ? "Saving..." : "Publish Route"} />
                  </form>
                </article>

                <article className="ios-card route-list-card">
                  <div className="route-list-header">
                    <h3>Your Routes</h3>
                    {fetchingRoutes ? <p>Refreshing...</p> : null}
                  </div>

                  {routes.length === 0 ? (
                    <p className="empty-state">
                      No routes yet. Create your first route using the form above.
                    </p>
                  ) : (
                    <ul className="route-list">
                      {routes.map((route) => (
                        <li key={route.id} className="route-item">
                          <div>
                            <p className="route-title">
                              {route.title} <span>{route.grade}</span>
                            </p>
                            <p className="route-meta">{route.gym_name}</p>
                            {route.notes ? <p className="route-note">{route.notes}</p> : null}
                          </div>
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => handleDeleteRoute(route.id)}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </>
            )}

            {error ? <p className="feedback error">{error}</p> : null}
            {message ? <p className="feedback success">{message}</p> : null}
          </div>
        )}
      </Container>
    </section>
  );
}
