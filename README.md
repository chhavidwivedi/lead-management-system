# LeadFlow — Lead Management System

A full-stack web application for managing sales leads, tracking follow-ups, and monitoring the sales pipeline.

## Features

- User registration and login
- JWT-based authentication and protected routes
- Create, view, update, and delete leads
- Search by name, email, or phone
- Filter by status and follow-up date
- Pagination for lead listings
- Dashboard statistics and lead status distribution chart
- PostgreSQL database persistence
- Responsive user interface

## Technology Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT, bcrypt
- **Charts:** Recharts

## Project Structure

```text
Lead Management/
├── client/
├── server/
│   ├── middleware/
│   ├── routes/
│   └── server.js
└── README.md
```

## Local Setup

### Prerequisites

Install Node.js, npm, and PostgreSQL.

### 1. Install backend dependencies

```bash
cd server
npm install
```

Configure the backend environment variables in `server/.env`. Use your local PostgreSQL credentials and a secure JWT secret. Never commit this file to GitHub.

### 2. Set up the database

Create a PostgreSQL database named `lead_management` and ensure the required `users` and `leads` tables exist.

### 3. Start the backend

Run the start command defined in `server/package.json`, for example:

```bash
npm start
```

### 4. Install and start the frontend

Open a separate terminal:

```bash
cd client
npm install
npm run dev
```

Configure `client/.env` with the backend API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Open the local URL displayed by Vite.

## Security

- Passwords are hashed before storage.
- Protected API routes require authentication.
- Leads are associated with their authenticated user.
- Environment secrets must not be committed to version control.

## Future Enhancements

- CSV export
- Lead activity history
- Follow-up reminders
- Automated tests

## Author

Chhavi.
