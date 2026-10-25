# LeadFlow — Lead Management System

A full-stack web application for managing sales leads, tracking follow-ups, and monitoring the sales pipeline. Built with React, Node.js, Express.js, and PostgreSQL.

## Live Demo

- **Frontend:** [https://lead-management-frontend-o2ta.onrender.com](https://lead-management-frontend-o2ta.onrender.com)
- **Backend API(Health Check):** [ https://lead-management-system-uqj7.onrender.com/api/health]( https://lead-management-system-uqj7.onrender.com/api/health)
- **GitHub Repository:** [https://github.com/chhavidwivedi/lead-management-system](https://github.com/chhavidwivedi/lead-management-system)

## Features

### Authentication and Security

- User registration and login
- JWT-based authentication
- Protected routes and API endpoints
- Password hashing using bcrypt
- User-specific lead management

### Lead Management

- Create, view, update, and delete leads
- Manage lead details, including name, email, phone, company, and service of interest
- Track lead statuses: New, Contacted, Qualified, Converted, and Lost
- Record follow-up dates and notes

### Search and Filtering

- Search leads by name, email, or phone number
- Filter leads by status and follow-up date
- Paginated lead listings

### Dashboard

- Dashboard statistics
- Lead status distribution chart
- Responsive user interface

## Technology Stack

| Category        | Technologies        |
| --------------- | ------------------- |
| Frontend        | React, Vite, CSS    |
| Backend         | Node.js, Express.js |
| Database        | PostgreSQL          |
| Authentication  | JWT, bcrypt         |
| Charts          | Recharts            |
| API             | REST API            |
| Version Control | Git, GitHub         |
| Deployment      | Render              |

## Project Structure

```text
Lead Management/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── server/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

*This is a simplified overview of the project structure.*

## Getting Started Locally

### Prerequisites

Install the following:

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/chhavidwivedi/lead-management-system.git
cd lead-management-system
```

### 2. Configure the Backend

Navigate to the backend directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory using this template:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lead_management
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET=replace_with_a_secure_random_secret
```

Replace the example values with your local PostgreSQL credentials and a secure, randomly generated JWT secret.

### 3. Set Up the Database

Create a PostgreSQL database named `lead_management`.

Ensure the database contains the required `users` and `leads` tables with the columns and relationships expected by the application.

The `users` table stores user accounts, while the `leads` table stores leads associated with their respective users.

### 4. Start the Backend

From the `server` directory, run the start script configured in `server/package.json`:

```bash
npm start
```

The backend should run on port 5000, unless configured otherwise.

### 5. Configure and Start the Frontend

Open a separate terminal from the project root and run:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal by Vite.

## API Overview

The backend provides REST API endpoints for authentication, dashboard statistics, and lead management.

| Method | Endpoint               | Description                             |
| ------ | ---------------------- | --------------------------------------- |
| GET    | `/api/health`          | Check backend health                    |
| POST   | `/api/auth/register`   | Register a new user                     |
| POST   | `/api/auth/login`      | Authenticate a user                     |
| GET    | `/api/auth/me`         | Retrieve authenticated user information |
| GET    | `/api/dashboard/stats` | Retrieve dashboard statistics           |
| GET    | `/api/leads`           | Retrieve leads                          |
| POST   | `/api/leads`           | Create a lead                           |

Additional lead endpoints support updating and deleting individual leads. Protected endpoints require valid authentication.

## Security

- Passwords are hashed before storage.
- JWT authentication protects authorized routes.
- Leads are associated with authenticated users.
- Database credentials and application secrets are stored in environment variables.
- Environment files containing real credentials must never be committed to version control.

## Future Enhancements

- CSV export for leads
- Lead activity history
- Automated follow-up reminders
- Unit and integration tests

## Author

**Chhavi Dwivedi**

