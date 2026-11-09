import { useState } from "react";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // REGISTER USER
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage("Registration successful! Please login.");
      setPage("login");
      setPassword("");
      setName("");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN USER
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      setLoggedInUser(data.user);
      setMessage("Login successful!");
      setPage("dashboard");
      setPassword("");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT USER
  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedInUser(null);
    setEmail("");
    setPassword("");
    setMessage("");
    setPage("home");
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">
          StartupConnect<span>.</span>
        </h2>

        <div className="nav-links">
          <a href="#" onClick={() => setPage("home")}>Home</a>
          <a href="#about">About</a>
          <a href="#ideas">Explore Ideas</a>
        </div>

        <div className="nav-buttons">
          {loggedInUser ? (
            <button className="signup-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => {
                  setMessage("");
                  setPage("login");
                }}
              >
                Login
              </button>

              <button
                className="signup-btn"
                onClick={() => {
                  setMessage("");
                  setPage("register");
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HOME PAGE */}
      {page === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <p className="tagline">
                BUILD SOMETHING GREAT TOGETHER
              </p>

              <h1>
                Great ideas need
                <span> great people.</span>
              </h1>

              <p className="hero-description">
                Discover startup ideas, connect with talented students,
                find your perfect co-founders, and turn your vision into reality.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-btn"
                  onClick={() => setPage("register")}
                >
                  Explore Startups →
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => setPage("register")}
                >
                  Share Your Idea
                </button>
              </div>

              <div className="stats">
                <div><h3>500+</h3><p>Innovators</p></div>
                <div><h3>120+</h3><p>Startup Ideas</p></div>
                <div><h3>80+</h3><p>Collaborations</p></div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-card">
                <div className="visual-icon">🚀</div>
                <h2>Your next big idea starts here.</h2>
                <p>Connect. Collaborate. Create.</p>

                <div className="visual-tags">
                  <span>💻 Developers</span>
                  <span>🎨 Designers</span>
                  <span>💡 Innovators</span>
                </div>
              </div>
            </div>
          </section>

          <section className="features" id="about">
            <p className="tagline">WHY STARTUPCONNECT?</p>
            <h2>Everything you need to build together</h2>

            <div className="feature-grid">
              <div className="feature-card">
                <h3>💡 Share Ideas</h3>
                <p>Present your startup concepts and get discovered.</p>
              </div>

              <div className="feature-card">
                <h3>🤝 Find Teammates</h3>
                <p>Connect with students who have the skills your startup needs.</p>
              </div>

              <div className="feature-card">
                <h3>🚀 Build Together</h3>
                <p>Turn your ideas into real projects through collaboration.</p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* REGISTRATION PAGE */}
      {page === "register" && (
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-icon">🚀</div>
            <h2>Create Your Account</h2>
            <p className="auth-subtitle">
              Join StartupConnect and start collaborating.
            </p>

            <form onSubmit={handleRegister}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password (minimum 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              <button className="auth-submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {message && <p className="auth-message">{message}</p>}

            <p className="auth-switch">
              Already have an account?{" "}
              <span onClick={() => {
                setMessage("");
                setPage("login");
              }}>
                Login
              </span>
            </p>
          </div>
        </div>
      )}

      {/* LOGIN PAGE */}
      {page === "login" && (
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-icon">👋</div>
            <h2>Welcome Back!</h2>
            <p className="auth-subtitle">
              Login to continue your startup journey.
            </p>

            <form onSubmit={handleLogin}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button className="auth-submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {message && <p className="auth-message">{message}</p>}

            <p className="auth-switch">
              Don't have an account?{" "}
              <span onClick={() => {
                setMessage("");
                setPage("register");
              }}>
                Register
              </span>
            </p>
          </div>
        </div>
      )}

{/* DASHBOARD */}
{page === "dashboard" && (
    <Dashboard user={loggedInUser} />
)}

    </div>
  );
}

export default App;