# TradePlanner

A full-featured task management and trading journal web application with user authentication, persistent database storage, and real-time analytics.

## Features

### Task Manager (Planner)
- **Inbox** — Quick task capture with priority levels
- **Today** — Focus on today's tasks
- **Upcoming** — 7-day calendar view with week navigation
- **Projects** — Organize tasks into color-coded projects
- **Labels** — Custom labels for filtering
- **Reporting** — Charts showing daily/weekly/monthly completion rates

### Trading Journal
- **Persian (Farsi) UI** — Full RTL trade journal interface
- **Trade Logging** — Date, pair, direction (Long/Short), result, entry/exit prices, quantity, PnL, notes, chart image links
- **Statistics** — Win rate, total PnL, best/worst trades, balance change
- **Charts** — Cumulative PnL, balance change %, pair distribution, win rate gauge
- **Initial Balance Tracking** — Track account balance changes over time

### Security & Architecture
- **JWT Authentication** — Secure login/register with bcrypt password hashing
- **SQLite Database** — Persistent, zero-configuration storage
- **XSS Protection** — Input sanitization on all user inputs
- **Rate Limiting** — API request throttling (200 requests per 15 minutes)
- **Helmet** — HTTP security headers
- **CORS** — Cross-origin resource sharing configured

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | HTML, CSS, JavaScript, Chart.js   |
| Backend  | Node.js, Express                  |
| Database | SQLite (via better-sqlite3)       |
| Auth     | JWT (jsonwebtoken + bcryptjs)     |
| Security | Helmet, CORS, express-rate-limit, XSS sanitization |
| DevOps   | Docker, docker-compose            |

## Getting Started

### Quick Start (Node.js)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/tradeplaner.git
cd tradeplaner

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# 4. Run the server
npm start
```

Open http://localhost:3000 — you'll be redirected to the login page. Create an account and start using the app.

### Using Docker

```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t tradeplaner .
docker run -d -p 3000:3000 -v app-data:/app/data tradeplaner
```

### Development Mode

```bash
npm run dev
```

Auto-restarts the server on file changes using Node.js built-in `--watch` flag.

## Environment Variables

| Variable        | Description              | Default                          |
|-----------------|--------------------------|----------------------------------|
| `PORT`          | Server port              | `3000`                           |
| `NODE_ENV`      | Environment mode          | `production`                     |
| `JWT_SECRET`    | JWT signing secret        | *(required — set a strong value)* |
| `JWT_EXPIRES_IN`| Token expiration          | `7d`                             |
| `DB_PATH`       | SQLite database file path | `./data/app.db`                  |
| `CORS_ORIGIN`   | Allowed CORS origin       | `*`                              |

## Project Structure

```
tradeplaner/
├── public/              # Static frontend files
│   ├── index.html       # Main application (Planner + Journal)
│   ├── login.html       # Login page
│   └── register.html    # Registration page
├── server/              # Backend
│   ├── index.js         # Express server entry point
│   ├── db.js            # SQLite database setup & schema
│   ├── auth.js          # Authentication routes & middleware
│   └── api.js           # All CRUD API routes
├── data/                # SQLite database file (auto-created)
├── package.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | `/api/auth/register` | Create a new account |
| POST   | `/api/auth/login`    | Sign in              |
| GET    | `/api/auth/me`       | Get current user     |

### Tasks
| Method | Endpoint          | Description      |
|--------|--------------------|------------------|
| GET    | `/api/tasks`       | List all tasks   |
| POST   | `/api/tasks`       | Create a task    |
| PUT    | `/api/tasks/:id`   | Update a task    |
| DELETE | `/api/tasks/:id`   | Delete a task    |

### Projects
| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| GET    | `/api/projects`      | List all projects   |
| POST   | `/api/projects`      | Create a project    |
| PUT    | `/api/projects/:id`  | Update a project    |
| DELETE | `/api/projects/:id`  | Delete a project    |

### Labels
| Method | Endpoint            | Description       |
|--------|----------------------|-------------------|
| GET    | `/api/labels`        | List all labels   |
| POST   | `/api/labels`        | Create a label    |
| DELETE | `/api/labels/:id`    | Delete a label    |

### Trades
| Method | Endpoint           | Description     |
|--------|--------------------|-----------------|
| GET    | `/api/trades`      | List all trades |
| POST   | `/api/trades`      | Create a trade  |
| PUT    | `/api/trades/:id`  | Update a trade  |
| DELETE | `/api/trades/:id`  | Delete a trade  |

### Settings
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | `/api/settings`   | Get all user settings    |
| PUT    | `/api/settings`   | Update a setting (key/value) |

## Deployment

### Deploy to a VPS (e.g., DigitalOcean, Hetzner, Linode)

```bash
# 1. Copy files to server
scp -r . user@your-server:/opt/tradeplaner

# 2. SSH into server
ssh user@your-server

# 3. Install Docker & docker-compose, then:
cd /opt/tradeplaner
cp .env.example .env
nano .env  # Set JWT_SECRET to a strong random value

# 4. Start with Docker
docker-compose up -d
```

### Deploy with a reverse proxy (Nginx + Let's Encrypt SSL)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then run `certbot` to get a free SSL certificate.

## Security Notes

- **Change the JWT_SECRET** in production to a strong random value (use `openssl rand -hex 32` to generate one)
- Always use HTTPS in production
- The SQLite database file (`.data/app.db`) is stored in a Docker volume for persistence
- Rate limiting is set to 200 requests per 15 minutes per IP
- All user inputs are sanitized against XSS attacks

## License

MIT
