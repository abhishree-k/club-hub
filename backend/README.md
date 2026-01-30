# Club Hub Backend

This directory contains the backend server for the Club Hub application. It is built with Node.js, Express, and Sequelize (SQLite).

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the `backend` directory (if not exists) with the following content:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

## Running the Server

Start the application:
```bash
npm start
```
The server will run on `http://localhost:3000`.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new student
- `POST /api/auth/login` - Login for students and admins
- `GET /api/auth/me` - Get current user profile (protected)

### Events
- `GET /api/events` - List all events
- `POST /api/events/:id/register` - Register for an event (protected)

### Admin (Protected)
- `GET /api/admin/registrations` - List all student registrations
- `GET /api/admin/club-memberships` - List club memberships
- `GET /api/admin/feedbacks` - List user feedback

### Feedback
- `POST /api/feedback` - Submit feedback

## Creating Admin Accounts

To access the Admin Dashboard, you need an admin account. Since there is no public registration for admins, you must use the provided utility script.

Run the following command in the `backend` directory:

```bash
node add_admin.js <email> <password> [FirstName] [LastName]
```

**Example:**
```bash
node add_admin.js admin@dsce.edu securePass123 Super Admin
```

This will create a new user with the `admin` role. You can then log in via the Admin Login page (`/admin-login.html`).

## Database
The project uses SQLite (`database.sqlite`). The database is automatically synced on server start. Initial seed data is created if the database is empty.

## Scripts
- `node add_admin.js <email> <password> [firstName] [lastName]` - Utility script to create a new admin user manually.
