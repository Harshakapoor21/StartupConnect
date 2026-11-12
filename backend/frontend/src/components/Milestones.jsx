
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Milestones({ idea, onBack }) {
  const [milestones, setMilestones] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskInputs, setTaskInputs] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // FETCH MILESTONES
  const fetchMilestones = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/ideas/${idea.id}/milestones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load milestones");
      }

      setMilestones(data);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [idea.id]);

  // CREATE MILESTONE
  const createMilestone = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/ideas/${idea.id}/milestones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create milestone");
      }

      setTitle("");
      setDescription("");
      setMessage("Milestone created successfully!");

      await fetchMilestones();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // ADD TASK
  const addTask = async (milestoneId) => {
    const taskTitle = taskInputs[milestoneId];

    if (!taskTitle || !taskTitle.trim()) {
      setMessage("Please enter a task name.");
      return;
    }

    if (!token) {
      setMessage("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/milestones/${milestoneId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: taskTitle.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add task");
      }

      setTaskInputs((prev) => ({
        ...prev,
        [milestoneId]: "",
      }));

      setMessage("Task added successfully!");

      await fetchMilestones();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // UPDATE TASK STATUS
  const updateTask = async (milestoneId, taskId, status) => {
    if (!token) {
      setMessage("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/milestones/${milestoneId}/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update task status");
      }

      setMessage("Task status updated successfully!");
      await fetchMilestones();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="milestones-container">

      <button className="secondary-btn" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <h1>Project Milestones</h1>

      <h3>{idea.title}</h3>

      {/* CREATE MILESTONE */}
      <div className="milestone-form">
        <h2>Create New Milestone</h2>

        <form onSubmit={createMilestone}>
          <label>Milestone Title</label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Frontend Development"
            required
          />

          <label>Description</label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this milestone..."
          />

          <button className="auth-submit" type="submit">
            Create Milestone
          </button>
        </form>
      </div>

      {message && <p className="auth-message">{message}</p>}

      <h2>Milestones and Tasks</h2>

      {loading && <p>Loading milestones...</p>}

      {!loading && milestones.length === 0 && (
        <p>No milestones created yet.</p>
      )}

      {/* DISPLAY MILESTONES */}
      {milestones.map((milestone) => (
        <div className="milestone-card" key={milestone.id}>
          <h3>{milestone.title}</h3>

          <p>{milestone.description}</p>

          <h4>Tasks</h4>

          {milestone.tasks?.map((task) => (
            <div className="task-row" key={task.id}>
              <span>{task.title}</span>

              <select
                value={task.status}
                onChange={(e) =>
                  updateTask(
                    milestone.id,
                    task.id,
                    e.target.value
                  )
                }
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          ))}

          {/* ADD TASK */}
          <div className="add-task-row">
            <input
              placeholder="Enter a new task"
              value={taskInputs[milestone.id] || ""}
              onChange={(e) =>
                setTaskInputs((prev) => ({
                  ...prev,
                  [milestone.id]: e.target.value,
                }))
              }
            />

            <button
              type="button"
              className="primary-btn"
              onClick={() => addTask(milestone.id)}
            >
              Add Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Milestones;
