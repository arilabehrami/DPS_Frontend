# Digital Personality Simulator (DPS) — Frontend

React frontend for the **Digital Personality Simulator** — chat with **Aura**, your adaptive AI personality. Ready for backend integration via REST APIs only (no mocks, no database logic).

## Project Structure

```
src/
├── api/                 # Axios client, HTTP helpers, API modules
│   ├── axios.js         # JWT interceptors
│   ├── http.js          # GET, POST, PUT, DELETE
│   ├── authApi.js
│   ├── employeesApi.js  # Persona registry (GET /api/employees)
│   └── aiApi.js
├── context/             # AuthContext, LanguageContext, ThemeContext
├── hooks/
├── components/          # Navbar, Sidebar, Table, Modal, etc.
├── pages/
├── routes/
├── services/            # chatService, settingsService, toastService
└── test/
```

## Installation

```bash
cd digital-personality-simulator
npm install
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:8000
```

See **[docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md)** for the full API contract and team split (frontend vs backend).

## Run

```bash
npm run dev      # http://localhost:5173
npm run build
npm run test:run
```

## API Endpoints

| Method | Endpoint           | Usage                          |
|--------|--------------------|--------------------------------|
| POST   | `/api/login`       | Login                          |
| POST   | `/api/register`    | Register (name, email, password, company) |
| GET    | `/api/profile`     | User profile                   |
| GET    | `/api/employees`   | Persona registry + search      |
| POST   | `/api/ai/chat`     | Chat with Aura                 |

### Search example

```
GET /api/employees?search=john&role=admin&department=Creative&status=active&sort=name_asc&page=1
```

### Headers (automatic)

- `Authorization: Bearer <JWT>`
- `Authorization: Bearer <JWT>` only (no tenant headers — backend assigns roles)

## Features

- **Aura AI** — Chat with typing indicator, history, memory toggle
- **Role-based access** — admin, employee (user), guest (assigned by backend via `user.role`)
- **Auth** — Login, register, JWT, role-based UI (admin / employee / guest)
- **Persona registry** — Lists profiles from `/api/employees`
- **Advanced search** — Debounced filters (style, role, status, dates, sort)
- **Contexts** — AuthContext, LanguageContext, ThemeContext (no prop drilling)
- **i18n** — English, Albanian, Spanish, French, German
- **Responsive** — Collapsible sidebar

## Pages

| Route              | Page                    |
|--------------------|-------------------------|
| `/login`           | Login                   |
| `/register`        | Register                |
| `/dashboard`       | Dashboard               |
| `/employees`       | Persona registry        |
| `/employees/:id`   | Persona details         |
| `/search`          | Advanced search         |
| `/ai-chat`         | AI Chat (Aura)          |
| `/history`         | Chat history            |
| `/notifications`   | Notifications           |
| `/settings`        | Personality settings    |
| `/profile`         | Profile                 |

## Roles

| Role     | Access                                      |
|----------|---------------------------------------------|
| Admin    | Full dashboard, persona management, settings |
| Employee | Chat, registry, search, settings          |
| Guest    | Read-only                                   |

## Screenshots

Add screenshots to `/docs/screenshots/` after running the app.

## Backend Integration

1. Copy `.env.example` → `.env` and set `VITE_API_URL`
2. Start your backend with CORS enabled for the Vite dev server
3. Implement endpoints per **[docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md)**

No mock layer — all requests go to the real API.
