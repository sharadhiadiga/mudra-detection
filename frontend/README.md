# NrityaAI Frontend (React + Vite)

## Setup

```bash
cd frontend
npm install
npm run dev
```

### Run (two terminals)

1. **Backend** (from `backend`):
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Frontend** (from `frontend`):
   ```bash
   npm run dev
   ```

3. **Open the UI** (not the API docs URL):
   - **http://localhost:3000** ← React app

4. **API docs** (optional, **new tab only** — do not iframe):
   - **http://127.0.0.1:8000/docs**

All API calls use full URLs in `src/config.js` → `http://127.0.0.1:8000/mudra/predict-frame`.

## API

| Endpoint | Use |
|----------|-----|
| `POST /mudra/predict-frame` | Live webcam + image upload |

Form field name: **`file`**

## Live logic (`src/utils/liveDetection.js`)

- Ignore confidence &lt; 0.5
- Buffer last 5 predictions
- Majority vote for display
- Streak: lock when same mudra 3 times → `FINAL: Mudra 🔒`
- Stop updates after lock
