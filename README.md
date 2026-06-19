# AIBites

AIBites is a modern, premium AI learning platform designed to make learning AI concept bites easy, interactive, and fun.

## Getting Started

To run the application locally, you need to start both the **Backend API** and the **Frontend dev server**.

---

### 1. Start the Backend API
The backend is built with Python and FastAPI.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```
3. Run the development server:
   ```bash
   uvicorn server:app --reload --host 127.0.0.1 --port 8000
   ```
   *The backend will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).*

---

### 2. Start the Frontend App
The frontend is built with React, TailwindCSS, and Framer Motion.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (use the `--legacy-peer-deps` flag if needed to resolve peer dependency issues):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   *The app will automatically open in your browser at [http://localhost:3000](http://localhost:3000).*
