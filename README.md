# E-Commerce Modular Monolith

An e-commerce backend built as a **modular monolith** — one deployable application, organized into independent feature modules (users, products, cart, orders) that share a common infrastructure layer.

Built with Node.js, Express 5, and Prisma, with Redis-backed background jobs for email and optional AI-generated product descriptions.

## Tech Stack

| Area            | Choice                                |
| --------------- | ------------------------------------- |
| Runtime         | Node.js (CommonJS)                    |
| Web framework   | Express 5                             |
| Database        | SQLite via Prisma ORM                 |
| Validation      | Joi                                   |
| Auth            | JWT (`jsonwebtoken`) + `bcryptjs`     |
| Background jobs | BullMQ + Redis (`ioredis`)            |
| AI              | Groq SDK (product descriptions)       |
| Security        | Helmet, CORS                          |
| API docs        | Swagger (swagger-jsdoc + swagger-ui)  |
| Tooling         | Jest, Supertest, ESLint, Prettier     |

## Folder Structure

```
E-Commerce-Modular-Monolith-/
└── main-app/
    ├── prisma/
    │   ├── migrations/            # Prisma migration history
    │   └── schema.prisma          # Data models: User, Product, CartItem, Order, OrderItem
    │
    ├── src/
    │   ├── app.js                 # Express app: middleware, routes, error handling
    │   ├── server.js              # Boots the app, graceful shutdown
    │   │
    │   ├── routes/
    │   │   └── v1.js              # Mounts module routes under /api/v1
    │   │
    │   ├── modules/               # Feature modules (self-contained slices)
    │   │   └── users/
    │   │       ├── users.routes.js        # Route definitions
    │   │       ├── users.controller.js    # Request/response handling
    │   │       ├── users.service.js       # Business logic
    │   │       ├── users.repository.js    # Data access
    │   │       ├── users.validation.js    # Joi schemas
    │   │       └── users.selects.js       # Reusable Prisma field selections
    │   │
    │   └── shared/                # Cross-cutting infrastructure
    │       ├── config/            # db (Prisma), redis
    │       ├── middlewares/       # auth, validate, errorHandler, notFound
    │       ├── integrations/      # groq (AI descriptions)
    │       ├── queue/             # emailQueue (BullMQ)
    │       ├── repository/        # baseRepository (shared CRUD)
    │       └── utils/             # AppError, tokens
    │
    ├── .env.example
    ├── package.json
    └── prisma.config.ts
```

### Module anatomy

Each feature lives in its own folder under `src/modules/` and follows the same layered shape:

```
routes → controller → service → repository → database
```

- **routes** – declare endpoints and attach validation/auth middleware
- **controller** – parse the request, call the service, shape the response
- **service** – business rules, orchestration, calls to shared integrations
- **repository** – all database access (extends `shared/repository/baseRepository`)
- **validation** – Joi schemas for request bodies

This keeps modules loosely coupled: they talk to each other through services, not by reaching into each other's data.

## Data Models

Defined in [`prisma/schema.prisma`](main-app/prisma/schema.prisma):

- **User** – account, hashed password, password-reset token
- **Product** – catalog item; description auto-generated via Groq when omitted
- **CartItem** – a user's cart line (unique per user + product)
- **Order** / **OrderItem** – placed orders; item price is frozen at purchase time

> Prices are stored as integers in **kobo** (₦1,500.00 = `150000`).

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (for background email jobs)

### Setup

```bash
cd main-app
npm install

# Create your environment file
cp .env.example .env

# Set up the database
npx prisma migrate dev

# Start the server
npm run dev
```

The API runs at `http://localhost:5000` (or the `PORT` you set).

### Environment variables

| Variable       | Description                               |
| -------------- | ----------------------------------------- |
| `DATABASE_URL` | Prisma connection string (SQLite default) |
| `REDIS_URL`    | Redis connection, e.g. `redis://localhost:6379` |
| `PORT`         | HTTP port                                 |
| `JWT_SECRET`   | Secret for signing auth tokens            |
| `GROQ_API_KEY` | Optional — enables AI product descriptions |

## API

All routes are versioned under `/api/v1`.

| Method | Endpoint                      | Description             |
| ------ | ----------------------------- | ----------------------- |
| GET    | `/health`                     | Health check            |
| POST   | `/api/v1/users/register`      | Create an account       |
| POST   | `/api/v1/users/login`         | Log in, receive a JWT   |
| POST   | `/api/v1/users/forgot-password` | Request a password reset |
| POST   | `/api/v1/users/reset-password`  | Reset a password        |

> Product, cart, and order modules follow the same structure and are being added.

## Design Notes

- **Resilient background work** – email jobs are enqueued, never sent inline. If Redis is down, user actions still succeed and the failure is logged (see [`emailQueue.js`](main-app/src/shared/queue/emailQueue.js)).
- **Graceful degradation** – AI description generation returns `null` instead of throwing when Groq is unavailable, so product creation never fails because of it.
- **Graceful shutdown** – on `SIGTERM`/`SIGINT`, the server drains the queue and closes Redis and Prisma connections cleanly.

## Authors

- Kemka Ofoha
- Joseph Adeoluwa Odamo

## License

ISC
