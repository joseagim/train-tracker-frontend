# TrainTracker Frontend

**Live demo: [train-tracker-frontend.vercel.app](https://train-tracker-frontend.vercel.app/)**

TrainTracker is a train ticket search & booking web app built as a **portfolio project** to showcase a REST API I built from scratch. All stations, schedules and tickets are **fictional demo data** — this is not a real train service.

> The demo is the fastest way to try it out — see [Demo accounts](#demo-accounts) for credentials and [A note on the API waking up](#a-note-on-the-api-waking-up) before you click through, since the API may need a minute to start. The rest of this README also covers how to run the project locally.

The goal of the project was to practice building a complete, production-shaped full-stack app: a Spring Boot REST API on one side, and this React frontend consuming it on the other.

- **Frontend (this repo):** React 19, Vite, Tailwind CSS v4, React Router v7 — no UI component library, everything built by hand. Deployed on Vercel.
- **Backend:** [train-tracker](https://github.com/joseagim/train-tracker) — Spring Boot REST API, JWT authentication, containerized with Docker and deployed on Render's free tier, connecting to a PostgreSQL database hosted on [Neon](https://neon.tech)'s free tier.

## Features

- **Search trips** between two stations, with sorting by departure time or price, and a "recent searches" shortcut that refills the form (it never auto-submits, so you can tweak the date or passenger count first).
- **Trip details**: seats available, duration, intermediate stops, and the operator's logo (Renfe / Iryo) detected from the train type.
- **Booking flow**: buy one or several tickets for a trip and see them confirmed with the total price.
- **My tickets**: every ticket is rendered like a real boarding pass, including a QR code generated from its UUID.
- **QR ticket validation (admin only)**: a dedicated panel where an admin can scan a ticket's QR code with the device camera, see the passenger and trip details, and mark it as scanned. See [Testing the QR flow](#testing-the-qr-flow) below.
- **English / Spanish language switcher**, with the whole UI translated — station names, cities and train identifiers are left untouched since they come straight from the API.
- **Accessible by design**: skip link, visible focus states, ARIA tabs on the login screen, custom form validation instead of the browser's default bubbles.
- **Resilient to a cold API**: the backend runs on a free hosting plan and spins down after inactivity, so the very first request after a while can take up to ~3 minutes to respond. Instead of showing a raw error, the app shows a "waking up the server" screen and reloads automatically once it's ready — see [A note on the API waking up](#a-note-on-the-api-waking-up).

## Demo accounts

Two accounts already exist on the deployed API so you don't need to register before trying anything:

| Role  | Email                    | Password    |
| ----- | ------------------------ | ----------- |
| Admin | `admin@traintracker.com` | `admin1234` |
| User  | `user@traintracker.com`  | `user1234`  |

Only the admin account can see and access the **Validate QR** panel in the navbar.

## Testing the QR flow

1. Log in (as either account) and buy a ticket from the search results.
2. Go to **My tickets** and click **View QR** on any ticket — it opens the real QR code (encoding the ticket's UUID) in a modal.
3. Log in as the **admin** account and open **Validate QR** in the navbar.
4. Click **Scan ticket** — the browser will ask for camera permission. Point it at the QR code from step 2 (e.g. on another screen or device).
5. Once decoded, the app calls the API to validate the ticket and shows the passenger's name, DNI and trip details, with a **Mark as scanned** button.

Camera access requires a secure context; `localhost` counts as one, so this works out of the box when running the project locally.

## A note on the API waking up

The backend is deployed on Render's free tier, which spins the service down after a period of inactivity. If nobody has used the app in a while, the **first** request can take up to ~3 minutes to go through — you'll see a "waking up the server" message instead of an error, and the page reloads automatically once the API responds. This only happens on that first request; everything is fast afterwards.

## Running locally

### Prerequisites

- [Node.js](https://nodejs.org/) `^20.19.0` or `>=22.12.0` (required by Vite 8)
- npm (comes with Node)

### 1. Clone the repository

```bash
git clone https://github.com/joseagim/train-tracker-frontend.git
cd train-tracker-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API URL

Create a `.env.development` file in the project root (it's gitignored, so it won't exist after cloning):

```bash
VITE_API_URL=https://train-tracker-api-w194.onrender.com
```

This points at the already-deployed backend, so you don't need to run anything else locally. If you'd rather run the [backend](https://github.com/joseagim/train-tracker) yourself (e.g. via its Docker setup), point this at it instead:

```bash
VITE_API_URL=http://localhost:8080
```

In development, Vite proxies every `/api/*` request to `VITE_API_URL` (see `vite.config.js`) so the browser never has to deal with CORS.

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Other scripts

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # run ESLint
```

For a production build, create a `.env.production` file the same way, with the API URL you want the built app to use.

## Related repository

- **Backend API**: [github.com/joseagim/train-tracker](https://github.com/joseagim/train-tracker) — Spring Boot, REST, JWT auth, PostgreSQL, Docker.
