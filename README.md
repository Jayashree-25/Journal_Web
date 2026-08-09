# Journal_Web

A full-stack personal journal application built with **React** on the frontend and **Node.js + Express + MongoDB** on the backend. Users can register, log in, and manage their own journal entries — create, edit, view, and delete them from a dark, Dracula-inspired UI.

## Features

- User registration and login with hashed passwords and JWT authentication
- Add journal entries with a title and content
- Edit and delete existing entries
- Entries are stored per user and shown newest-first
- "View All Journals" page to browse every user's public entries
- Session persistence via `localStorage`
- CORS-restricted API with allowed frontend origins

## Tech Stack

- **Frontend:** React 19, React Router, Create React App (plain CSS / inline styles)
- **Backend:** Node.js, Express 5, Mongoose
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs
- **Other:** CORS, dotenv, Fetch API

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB connection string (local or Atlas)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Then start the server:

```bash
npm start
```

The API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

The app runs at `http://localhost:3000`.

> The frontend is configured to talk to the deployed backend at `https://journal-backend-web.onrender.com`. To use the local server instead, update the API URLs in `src/App.js` and `src/AllJournals.js`.

### API Endpoints

| Method | Endpoint         | Description                          |
| ------ | ---------------- | ------------------------------------ |
| POST   | `/register`      | Register a new user                  |
| POST   | `/login`         | Log in and receive a JWT token       |
| GET    | `/entries`       | Get entries for a given username     |
| POST   | `/entries`       | Create a new journal entry           |
| PUT    | `/entries/:id`   | Update an entry                      |
| DELETE | `/entries/:id`   | Delete an entry                      |
| GET    | `/entries-all`   | Get all users' entries               |

## Project Structure

```
Journal_Web/
├── backend/
│   ├── server.js          # Express app, schemas, and routes
│   ├── package.json
│   └── .env               # Environment variables (not committed)
└── frontend/
    ├── public/
    └── src/
        ├── App.js              # Routing and journal home page
        ├── LoginRegister.js    # Login / registration UI
        └── AllJournals.js      # View all journals page
```

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
