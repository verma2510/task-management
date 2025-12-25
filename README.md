# Task Management System

A comprehensive web application for managing tasks, designed for educational environments. Admins (Teachers) can create tasks and assign them to Students, who can view and submit their work.

## Features

*   **Admin Dashboard**: Create tasks, view all tasks, and assign tasks to specific students.
*   **Student Dashboard**: View assigned tasks and submit work.
*   **Authentication**: Secure login and registration for both Admins and Students.
*   **Task Management**: Create, read, update, and delete tasks.
*   **Student Selection**: Admins can easily assign tasks by selecting students from a dropdown list.

## Tech Stack

**MERN Stack**:
*   **M**ongoDB: Database
*   **E**xpress.js: Backend Framework
*   **R**eact: Frontend Library
*   **N**ode.js: Runtime Environment

## Getting Started

### Prerequisites

*   Node.js installed on your machine.
*   MongoDB installed and running locally, or a MongoDB Atlas connection string.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

Create a `.env` file in the `server` directory and add the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager  # Or your MongoDB Atlas URI
JWT_SECRET=your_jwt_secret_key
```

### Running the Application

1.  **Start the Server:**
    ```bash
    cd server
    npm run dev
    ```
    The server will run on `http://localhost:5000`.

2.  **Start the Client:**
    Open a new terminal window:
    ```bash
    cd client
    npm run dev
    ```
    The client will run on `http://localhost:5173` (or the port specified by Vite).

## Usage

1.  Register a new account (select role as 'Student' or 'Admin').
2.  Log in to access the dashboard.
3.  Admins can create tasks and assign them to registered students.
4.  Students can see their assigned tasks on their dashboard.
