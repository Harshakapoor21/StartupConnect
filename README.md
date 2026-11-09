# StartupConnect – Startup Collaboration Platform

StartupConnect is a web-based platform designed to help startup founders connect, collaborate, and build teams based on their skills and interests.

The platform allows users to create startup ideas, share their skills, discover potential teammates, and manage project milestones and tasks.

## Features

- **User Registration and Login:** Secure user registration and login using password hashing and JWT authentication.
- **Startup Idea Creation:** Create and share startup ideas with descriptions, required skills, and team roles.
- **Founder Skills Management:** Add and manage skills to showcase your expertise.
- **Skills-Based Matching:** Find potential teammates based on the skills required by a startup idea.
- **Milestone Management:** Create milestones for startup projects.
- **Task Tracking:** Add tasks to milestones and update their status (Pending, In Progress, Completed).
- **Startup Discovery:** View startup ideas created by registered users.

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt.js
- REST API

## Project Structure

```text
FSD-project/
│
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Milestones.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── index.html
│
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd FSD-project
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
JWT_SECRET=replace_with_a_secure_secret
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## Application Workflow

1. Register a new account.
2. Log in using your credentials.
3. Add your skills to your profile.
4. Create a startup idea with required skills and team roles.
5. Explore startup ideas and find potential teammates.
6. View skill-based matching results.
7. Manage project milestones and tasks.

## Current Implementation Notes

- The backend currently uses in-memory arrays to store users, startup ideas, and milestones.
- Data is temporary and resets when the backend server restarts.
- MySQL database integration and real-time chat are not included in this implementation.

## Future Enhancements

- MySQL database integration for permanent data storage.
- Real-time team communication using Socket.io.
- Advanced founder matching.
- Email-based team invitations.
- Cloud-based file storage.

## Project

**Project Name:** StartupConnect  
**Project Type:** Full Stack Web Development  
**Purpose:** Startup collaboration and founder networking platform