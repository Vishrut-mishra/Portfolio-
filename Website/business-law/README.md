# Business Law Synchronized Presentation

This project contains two parts: a Node.js backend for synchronization and a React frontend for the UI.

## How to Run

1. **Start the Synchronization Server**
   Open a terminal and run:
   ```bash
   cd backend
   npm start
   ```
   *(If `npm start` doesn't work, run `node server.js`)*

2. **Start the Frontend UI**
   Open a second terminal and run:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Presenting**
   - The presenter (you) should open `http://localhost:5173` and click on **[Presenter Access]** (the faded button at the bottom).
   - Your audience members (students) should connect to your local IP address (e.g., `http://192.168.x.x:5173`) and choose their roles: Gatekeeper, Enforcer, or Disruptor.
   - Use the Presenter Dashboard to advance the chapters globally. All student screens will automatically flip to the next chapter at the same time.
