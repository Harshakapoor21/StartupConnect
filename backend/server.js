const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const verifyToken = require("./middleware/authMiddleware");
const app = express();

// ===============================
// 1. MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// 2. TEMPORARY DATABASE
// ===============================

let users = [];
let ideas = [];
let milestones = [];

// ===============================
// 3. HOME ROUTE
// ===============================

app.get("/", (req, res) => {
    res.send("Welcome to StartupConnect Backend!");
});

// ===============================
// 4. TEST ROUTE
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        message: "Backend is working successfully!"
    });
});

// ===============================
// 5. GET ALL USERS
// ===============================

app.get("/api/users", (req, res) => {
    // Do not expose password hashes
    const safeUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        skills: user.skills
    }));

    res.json(safeUsers);
});

// ===============================
// 6. USER REGISTRATION API
// ===============================

app.post("/api/register", async (req, res) => {

    try {
        // Get user information
        const { name, password } = req.body;

        const email = req.body.email
            ? req.body.email.toLowerCase().trim()
            : "";

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check existing email
        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: Date.now(),
            name: name.trim(),
            email: email,
            password: hashedPassword,
            skills: []
        };

        // Save user
        users.push(newUser);

        // Send successful response
        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });

    }

});

// ===============================
// 7. USER LOGIN API
// ===============================


app.post("/api/login", async (req, res) => {

    try {
        const { password } = req.body;

        const email = req.body.email
            ? req.body.email.toLowerCase().trim()
            : "";

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = users.find(
            user => user.email === email
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found. Please register first."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }

        // STEP 8.5: Generate JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send token to user
        res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }

});

// PROTECTED PROFILE ROUTE
app.get("/api/profile", verifyToken, (req, res) => {
    const user = users.find(user => user.id === req.userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json({
        message: "Profile accessed successfully!",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            skills: user.skills
        }
    });
});
// UPDATE USER SKILLS

app.put("/api/profile/skills", verifyToken, (req, res) => {

    const { skills } = req.body;

    // Validate skills
    if (!Array.isArray(skills)) {
        return res.status(400).json({
            message: "Skills must be provided as an array"
        });
    }

    const user = users.find(
        user => user.id === req.userId
    );

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // Save skills
    user.skills = skills
        .filter(skill => typeof skill === "string")
        .map(skill => skill.trim())
        .filter(Boolean);

    res.status(200).json({
        message: "Skills updated successfully!",
        skills: user.skills
    });

});
// ===============================
// 8. GET ALL STARTUP IDEAS
// ===============================

// GET ALL STARTUP IDEAS WITH CREATOR NAME

app.get("/api/ideas", (req, res) => {

    const ideasWithCreator = ideas.map(idea => {

        const creator = users.find(
            user => user.id === idea.createdBy
        );

        return {
            ...idea,
            creatorName: creator ? creator.name : "Unknown User"
        };

    });

    res.status(200).json(ideasWithCreator);
});

// ===============================
// 9. ADD STARTUP IDEA
// ===============================

app.post("/api/ideas", verifyToken, (req, res) => {

    const {
    title,
    description,
    requiredSkills,
    teamRoles
} = req.body;

    // Check required fields
    if (!title || !description) {
        return res.status(400).json({
            message: "Title and description are required"
        });
    }

    // Create new idea
const newIdea = {
    id: Date.now(),
    title: title.trim(),
    description: description.trim(),
    requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : [],
    teamRoles: Array.isArray(teamRoles)
        ? teamRoles
        : [],
    createdBy: req.userId
};

    // Save idea
    ideas.push(newIdea);

    res.status(201).json({
        message: "Startup idea added successfully!",
        idea: newIdea
    });

});
// GET SINGLE STARTUP IDEA
app.get("/api/ideas/:id", (req, res) => {

    const idea = ideas.find(
        idea => idea.id === Number(req.params.id)
    );

    if (!idea) {
        return res.status(404).json({
            message: "Startup idea not found"
        });
    }

    res.status(200).json(idea);
});
// =================================
// SKILLS-BASED FOUNDER MATCHING API
// =================================

app.get("/api/ideas/:id/matches", verifyToken, (req, res) => {

    const idea = ideas.find(
        idea => idea.id === Number(req.params.id)
    );

    if (!idea) {
        return res.status(404).json({
            message: "Startup idea not found"
        });
    }

    const requiredSkills = (idea.requiredSkills || [])
        .map(skill => skill.toLowerCase().trim());

    if (requiredSkills.length === 0) {
        return res.status(200).json({
            message: "No required skills specified for this startup.",
            matches: []
        });
    }

    const matches = users
        .filter(user => user.id !== idea.createdBy)
        .map(user => {

            const founderSkills = (user.skills || [])
                .map(skill => skill.toLowerCase().trim());

            const matchedSkills = requiredSkills.filter(
                skill => founderSkills.includes(skill)
            );

            const matchPercentage = Math.round(
                (matchedSkills.length / requiredSkills.length) * 100
            );

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                skills: user.skills || [],
                matchedSkills,
                matchPercentage
            };
        })
        .filter(user => user.matchPercentage > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
        message: "Founder matches retrieved successfully!",
        matches
    });

});
// =================================
// PROJECT MILESTONE APIs
// =================================

// GET MILESTONES FOR A STARTUP
app.get("/api/ideas/:id/milestones", verifyToken, (req, res) => {

    const ideaId = Number(req.params.id);

    const idea = ideas.find(item => item.id === ideaId);

    if (!idea) {
        return res.status(404).json({
            message: "Startup idea not found"
        });
    }

    const projectMilestones = milestones.filter(
        milestone => milestone.ideaId === ideaId
    );

    res.json(projectMilestones);
});


// CREATE A NEW MILESTONE
app.post("/api/ideas/:id/milestones", verifyToken, (req, res) => {

    const ideaId = Number(req.params.id);
    const { title, description } = req.body;

    const idea = ideas.find(item => item.id === ideaId);

    if (!idea) {
        return res.status(404).json({
            message: "Startup idea not found"
        });
    }

    if (idea.createdBy !== req.userId) {
        return res.status(403).json({
            message: "Only the startup creator can add milestones"
        });
    }

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Milestone title is required"
        });
    }

    const newMilestone = {
        id: Date.now(),
        ideaId,
        title: title.trim(),
        description: description || "",
        tasks: [],
        createdAt: new Date().toISOString()
    };

    milestones.push(newMilestone);

    res.status(201).json({
        message: "Milestone created successfully!",
        milestone: newMilestone
    });
});


// ADD TASK TO A MILESTONE
app.post("/api/milestones/:id/tasks", verifyToken, (req, res) => {

    const milestone = milestones.find(
        item => item.id === Number(req.params.id)
    );

    if (!milestone) {
        return res.status(404).json({
            message: "Milestone not found"
        });
    }

    const idea = ideas.find(
        item => item.id === milestone.ideaId
    );

    if (!idea || idea.createdBy !== req.userId) {
        return res.status(403).json({
            message: "Only the startup creator can add tasks"
        });
    }

    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const newTask = {
        id: Date.now(),
        title: title.trim(),
        status: "Pending"
    };

    milestone.tasks.push(newTask);

    res.status(201).json({
        message: "Task added successfully!",
        task: newTask
    });
});


// UPDATE TASK STATUS
app.patch("/api/milestones/:milestoneId/tasks/:taskId", verifyToken, (req, res) => {

    const milestone = milestones.find(
        item => item.id === Number(req.params.milestoneId)
    );

    if (!milestone) {
        return res.status(404).json({
            message: "Milestone not found"
        });
    }

    const idea = ideas.find(
        item => item.id === milestone.ideaId
    );

    if (!idea || idea.createdBy !== req.userId) {
        return res.status(403).json({
            message: "Only the startup creator can update tasks"
        });
    }

    const task = milestone.tasks.find(
        item => item.id === Number(req.params.taskId)
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const allowedStatuses = ["Pending", "In Progress", "Completed"];

    if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
            message: "Invalid task status"
        });
    }

    task.status = req.body.status;

    res.json({
        message: "Task status updated successfully!",
        task
    });
});
// ===============================
// 10. START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`StartupConnect server running on port ${PORT}`);
});
