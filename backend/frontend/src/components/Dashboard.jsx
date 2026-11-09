import { useEffect, useState } from "react";
import Milestones from "./Milestones";

function Dashboard({ user }) {
  // STATES
  const [ideas, setIdeas] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [skillMessage, setSkillMessage] = useState("");
  const [matchMessage, setMatchMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [teamRoles, setTeamRoles] = useState("");
  const [mySkills, setMySkills] = useState("");

  const [selectedMatches, setSelectedMatches] = useState([]);
  const [matchingIdeaId, setMatchingIdeaId] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const token = localStorage.getItem("token");

  // FETCH STARTUP IDEAS
  const fetchIdeas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/ideas");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load ideas");
      }

      setIdeas(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // FETCH REGISTERED USERS
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Unable to load users");
      }

      setUsers(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchIdeas();
    fetchUsers();
  }, []);

  // POST STARTUP IDEA
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please login again to post an idea.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          requiredSkills: requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
          teamRoles: teamRoles.split(",").map(s => s.trim()).filter(Boolean)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to post idea");
      }

      setMessage("Startup idea posted successfully!");
      setTitle("");
      setDescription("");
      setRequiredSkills("");
      setTeamRoles("");

      await fetchIdeas();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // UPDATE FOUNDER SKILLS
  const handleSkillsSubmit = async (e) => {
    e.preventDefault();
    setSkillMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/profile/skills", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          skills: mySkills.split(",").map(s => s.trim()).filter(Boolean)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update skills");
      }

      setSkillMessage("Your skills have been updated successfully!");
      await fetchUsers();
    } catch (err) {
      setSkillMessage(err.message);
    }
  };

  // FIND MATCHING FOUNDERS
  const findMatches = async (ideaId) => {
    setMatchingIdeaId(ideaId);
    setSelectedMatches([]);
    setMatchMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/ideas/${ideaId}/matches`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to find matches");
      }

      setSelectedMatches(data.matches || []);

      if (!data.matches || data.matches.length === 0) {
        setMatchMessage(data.message || "No matching founders found yet.");
      }
    } catch (err) {
      setMatchMessage(err.message);
    }
  };

  // OPEN MILESTONE COMPONENT
  if (selectedIdea) {
    return (
      <Milestones
        idea={selectedIdea}
        onBack={() => setSelectedIdea(null)}
      />
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        <h1>Welcome, {user?.name}!</h1>
        <p>Explore ideas and find your next collaboration.</p>

        {/* POST STARTUP IDEA */}
        <div className="post-idea-section">
          <h2>Share Your Startup Idea 💡</h2>

          <form onSubmit={handleSubmit} className="idea-form">
            <label>Startup Idea Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter your startup idea title"
              required
            />

            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your startup idea..."
              required
            />

            <label>Required Skills</label>
            <input
              value={requiredSkills}
              onChange={e => setRequiredSkills(e.target.value)}
              placeholder="Python, React, UI/UX"
            />

            <label>Team Roles Required</label>
            <input
              value={teamRoles}
              onChange={e => setTeamRoles(e.target.value)}
              placeholder="Frontend Developer, Designer, Marketing"
            />

            <button type="submit" className="auth-submit">
              Post Startup Idea
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}
        </div>

        {/* MY SKILLS */}
        <div className="skills-section">
          <h2>My Skills 👩‍💻</h2>
          <p>Add your skills so other students can discover you.</p>

          <form onSubmit={handleSkillsSubmit} className="idea-form">
            <label>Enter Your Skills</label>
            <input
              value={mySkills}
              onChange={e => setMySkills(e.target.value)}
              placeholder="Python, React, Java, UI/UX"
              required
            />

            <button type="submit" className="auth-submit">
              Save My Skills
            </button>
          </form>

          {skillMessage && <p className="auth-message">{skillMessage}</p>}
        </div>

        {/* FIND TEAMMATES */}
        <div className="teammates-section">
          <h2>Find Teammates 🤝</h2>
          <p>Discover talented students for your startup.</p>

          <div className="idea-grid">
            {users
              .filter(person => person.id !== user?.id)
              .map(person => (
                <div className="idea-card" key={person.id}>
                  <h3>{person.name}</h3>
                  <p>{person.email}</p>
                  <h4>Skills</h4>

                  <div className="idea-skills">
                    {person.skills?.length > 0
                      ? person.skills.map((skill, index) => (
                          <span key={index}>{skill}</span>
                        ))
                      : <p>Skills not added yet.</p>}
                  </div>
                </div>
              ))}
          </div>

          {users.filter(person => person.id !== user?.id).length === 0 && (
            <p>No other students have registered yet.</p>
          )}
        </div>

        {/* STARTUP IDEAS */}
        <h2>Explore Startup Ideas 🚀</h2>

        {loading && <p>Loading ideas...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && ideas.length === 0 && (
          <p>No startup ideas yet. Be the first to share one!</p>
        )}

        <div className="idea-grid">
          {ideas.map(idea => (
            <div className="idea-card" key={idea.id}>

              <h3>{idea.title}</h3>
              <p>{idea.description}</p>

              <h4>Required Skills</h4>
              <div className="idea-skills">
                {idea.requiredSkills?.map((skill, index) => (
                  <span key={index}>{skill}</span>
                ))}
              </div>

              <h4>Team Roles Required</h4>
              <div className="idea-skills">
                {idea.teamRoles?.map((role, index) => (
                  <span key={index}>{role}</span>
                ))}
              </div>

              <p className="creator">
                Created by: {idea.creatorName || "Unknown User"}
              </p>

              <button
                className="primary-btn"
                onClick={() => findMatches(idea.id)}
              >
                Find Teammates
              </button>

              <button
                className="secondary-btn"
                onClick={() => setSelectedIdea(idea)}
              >
                Manage Milestones
              </button>

              {matchingIdeaId === idea.id && (
                <div className="matches-section">
                  <h4>Recommended Founders 🤝</h4>

                  {matchMessage && <p>{matchMessage}</p>}

                  {selectedMatches.map(person => (
                    <div className="idea-card" key={person.id}>
                      <h3>{person.name}</h3>
                      <p>{person.email}</p>

                      <h4>Matching Skills</h4>
                      <div className="idea-skills">
                        {person.matchedSkills.map((skill, index) => (
                          <span key={index}>{skill}</span>
                        ))}
                      </div>

                      <h4>Match Percentage</h4>
                      <h2>{person.matchPercentage}%</h2>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;