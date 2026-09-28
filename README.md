# Premium Personal Portfolio

A modern, minimalist, and dynamic personal portfolio designed for developers and designers. Features a fully custom Content Management System (CMS) built right into the application, allowing you to update your profile, upload certifications, and view contact messages securely from an admin dashboard.

## Features

- **Public Portfolio**: Fast, responsive, glassmorphism-inspired UI showcasing an "About Me" section and a dynamic grid of Certifications.
- **Admin Dashboard**: Secure login area (`/login`) to manage content on the fly without touching the codebase.
- **Dynamic Profile Management**: Edit your bio, headline, and technologies directly from the dashboard.
- **File Uploads**: Upload certification images (PNG/JPG/PDF) from the dashboard, handled automatically by the backend.
- **Contact Form**: Securely receive messages from recruiters, stored directly in the database.

## Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Vanilla CSS (Custom Design System, Glassmorphism, CSS Variables)

### Backend
- Node.js & Express
- Supabase (PostgreSQL & Storage)
- Multer (File Uploads)
- Express Rate Limit & Helmet (Security)

---

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Run the SQL script found in `database/schema.sql` in the Supabase SQL Editor. This will create the required tables (`profile`, `certifications`, `contact_messages`, `admin_users`, `resumes`) and set up Row Level Security.
3. Create a Storage Bucket named `project-media` and set it to **Public**.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory based on `.env.example`:
   ```env
   PORT=5001
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd "frontend/Premium Personal Portfolio App"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend directory based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5001
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Admin Access
To access the admin dashboard, you must insert your user ID into the `admin_users` table in Supabase.
1. Sign up on the frontend via `/login`.
2. Go to your Supabase Dashboard -> Authentication -> Users, and copy your User UID.
3. Go to the SQL Editor and run:
   ```sql
   INSERT INTO admin_users (id) VALUES ('your-user-uid');
   ```
4. Log back in on the frontend to access the secure Admin Dashboard.

## License
MIT
