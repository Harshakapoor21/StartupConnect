import { useEffect, useState } from "react";

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
                `http://localhost:5000/api/ideas/${idea.id}/milestones`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setMilestones(data);

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

        try {
            const response = await fetch(
                `http://localhost:5000/api/ideas/${idea.id}/milestones`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title,
                        description
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
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

        try {
            const response = await fetch(
                `http://localhost:5000/api/milestones/${milestoneId}/tasks`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: taskTitle
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setTaskInputs(prev => ({
                ...prev,
                [milestoneId]: ""
            }));

            setMessage("Task added successfully!");

            await fetchMilestones();

        } catch (error) {
            setMessage(error.message);
        }
    };

    // UPDATE TASK STATUS
    const updateTask = async (milestoneId, taskId, status) => {

        try {
            const response = await fetch(
                `http://localhost:5000/api/milestones/${milestoneId}/tasks/${taskId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

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

            <div className="milestone-form">

                <h2>Create New Milestone</h2>

                <form onSubmit={createMilestone}>

                    <label>Milestone Title</label>

                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Example: Frontend Development"
                        required
                    />

                    <label>Description</label>

                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
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

            {milestones.map(milestone => (

                <div className="milestone-card" key={milestone.id}>

                    <h3>{milestone.title}</h3>

                    <p>{milestone.description}</p>

                    <h4>Tasks</h4>

                    {milestone.tasks.map(task => (

                        <div className="task-row" key={task.id}>

                            <span>{task.title}</span>

                            <select
                                value={task.status}
                                onChange={e =>
                                    updateTask(
                                        milestone.id,
                                        task.id,
                                        e.target.value
                                    )
                                }
                            >
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>

                        </div>

                    ))}

                    <div className="add-task-row">

                        <input
                            placeholder="Enter a new task"
                            value={taskInputs[milestone.id] || ""}
                            onChange={e =>
                                setTaskInputs(prev => ({
                                    ...prev,
                                    [milestone.id]: e.target.value
                                }))
                            }
                        />

                        <button
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