# E-Commerce Modular Monolith

An e-commerce backend built as a **modular monolith** with small **supporting services** split out:

- **`main-app/`** — the core application. One deployable Express app, organized into independent feature modules (users, products, cart, orders) over a shared infrastructure layer. Owns the business data and enqueues background work.
- **`email-service/`** — a standalone transactional-email service. Renders templates, sends via [Resend](https://resend.com), and records every send in an `EmailLog` for idempotency and auditing.
- **`workers/`** — a standalone background worker that consumes the BullMQ `email` queue and bridges it to the email service over HTTP. Keeps the two services decoupled: `main-app` never calls `email-service` directly.

The repository root has a package.json with scripts that install, run, test, and lint all three together.

```
┌──────────────┐  enqueue job   ┌─────────┐   consume    ┌───────────┐  POST /email/send   ┌───────────────┐
│   main-app   │ ─────────────▶ │  Redis  │ ───────────▶ │  worker   │ ──────────────────▶ │ email-service │ ──▶ Resend
│  (modules)   │   (BullMQ)     │  queue  │              │           │   (x-api-key)       │  (EmailLog)   │
└──────────────┘                └─────────┘              └───────────┘                     └───────────────┘
```

## Tech Stack

| Area            | main-app                                 | email-service                       | workers                              |
| --------------- | ---------------------------------------- | ----------------------------------- | ------------------------------------ |
| Runtime         | Node.js 20+ (CommonJS)                   | Node.js 20+ (CommonJS)              | Node.js 20+ (CommonJS)               |
| Web framework   | Express 5                                | Express 5                           | — (no HTTP server)                   |
| Database        | SQLite via Prisma ORM                    | SQLite via Prisma ORM               | —                                    |
| Validation      | Joi                                      | Joi                                 | —                                    |
| Auth            | JWT (`jsonwebtoken`) + `bcryptjs`        | Internal API key (`x-api-key`)      | Sends `x-api-key` to email-service   |
| Background jobs | BullMQ + Redis (`ioredis`) — enqueues    | —                                   | BullMQ + Redis (`ioredis`) — consumes |
| Email           | — (enqueues jobs)                        | Resend                              | — (calls email-service over HTTP)    |
| AI              | Groq SDK (product descriptions)          | —                                   | —                                    |
| Security        | Helmet, CORS                             | Helmet                              | —                                    |
| API docs        | Swagger / OpenAPI 3                      | Swagger / OpenAPI 3                 | —                                    |
| Tooling         | Jest, Supertest, ESLint, Prettier        | Jest, Supertest, ESLint, Prettier   | Jest, nodemon                        |

Orchestration at the root uses **`concurrently`** to run all three with one command.

## Folder Structure

```
E-Commerce-Modular-Monolith-/
├── package.json                  # Root scripts (run/test/lint both services together)
│
├── main-app/                     # Core modular-monolith application
│   ├── prisma/
│   │   ├── migrations/           # Prisma migration history
│   │   └── schema.prisma         # User, Product, CartItem, Order, OrderItem
│   └── src/
│       ├── app.js                # Express app: middleware, routes, error handling
│       ├── server.js             # Boots the app, graceful shutdown
│       ├── routes/v1.js          # Mounts module routes under /api/v1
│       ├── modules/              # Feature modules (users, products, …)
│       │   └── <module>/
│       │       ├── *.routes.js       # Route definitions
│       │       ├── *.controller.js   # Request/response handling
│       │       ├── *.service.js      # Business logic
│       │       ├── *.repository.js   # Data access (extends baseRepository)
│       │       ├── *.validation.js   # Joi schemas
│       │       ├── *.docs.js         # Swagger / OpenAPI annotations
│       │       └── *.selects.js      # Reusable Prisma field selections
│       └── shared/               # Cross-cutting infrastructure
│           ├── config/           # db (Prisma), redis, swagger
│           ├── middlewares/      # auth, validate, errorHandler, notFound
│           ├── integrations/     # groq (AI descriptions)
│           ├── queue/            # emailQueue (BullMQ)
│           ├── repository/       # baseRepository (shared CRUD)
│           └── utils/            # AppError, tokens
│
├── email-service/                # Transactional email microservice
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma         # EmailLog
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── routes/v1.js          # Mounts /email
│       ├── modules/email/        # Same layered shape as main-app modules
│       ├── templates/            # welcome, passwordReset, orderConfirmation (HTML)
│       └── shared/
│           ├── config/           # db (Prisma), resend, swagger
│           ├── middlewares/      # apiKey, validate, errorHandler, notFound
│           ├── repository/       # baseRepository
│           └── utils/            # AppError
│
└── workers/                      # Background queue consumer (no HTTP server)
    └── src/
        ├── index.js              # Boots the BullMQ Worker, wiring, graceful shutdown
        ├── config/
        │   └── redis.js          # ioredis connection (maxRetriesPerRequest: null)
        ├── clients/
        │   └── emailService.client.js  # POSTs to email-service, maps HTTP status → retry/fail
        └── processors/
            ├── email.processor.js       # Processes one email job
            └── email.processor.test.js  # Jest tests (success + error paths)
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
- **docs** – Swagger/OpenAPI annotations that generate the live API docs

This keeps modules loosely coupled: they talk to each other through services, not by reaching into each other's data. The same convention is reused inside `email-service`.

## Data Models

**main-app** — [`main-app/prisma/schema.prisma`](main-app/prisma/schema.prisma):

- **User** – account, hashed password, password-reset token
- **Product** – catalog item; description auto-generated via Groq when omitted
- **CartItem** – a user's cart line (unique per user + product)
- **Order** / **OrderItem** – placed orders; item price is frozen at purchase time

**email-service** — [`email-service/prisma/schema.prisma`](email-service/prisma/schema.prisma):

- **EmailLog** – one row per email: `type`, `to`, `subject`, `status` (`pending` → `sent`/`failed`), the provider's id, retry `attempts`, and the `jobId` that makes sends idempotent.

> Prices are stored as integers in **kobo** (₦1,500.00 = `150000`).

## Getting Started

### Prerequisites

- Node.js 20+
- Redis (for the main-app background email queue)
- A [Resend](https://resend.com) API key (for the email service to actually deliver mail)

### Install everything

From the repository root:

```bash
npm run install:all
```

This installs the root dependencies plus both services (`main-app` and `email-service`).

### Configure environment

Each service has its own `.env` (both are git-ignored). For `main-app`, copy the example:

```bash
cp main-app/.env.example main-app/.env
```

For `email-service`, create `email-service/.env` with the variables listed [below](#environment-variables).

### Set up databases

```bash
# From the repo root — runs migrations for both services
npm run db:deploy      # apply existing migrations
npm run db:generate    # (re)generate both Prisma clients
```

> For local development you can also run `npm run db:migrate` inside an individual service to create new migrations.

### Run all services

```bash
npm run dev
```

This starts, concurrently:

- **main-app** on `http://localhost:5000` (color: blue)
- **email-service** on `http://localhost:5001` (color: green)
- **workers** — the background queue consumer, no HTTP port (color: magenta)

To run a single piece, use its own `dev` script, e.g. `npm run dev --prefix workers`.

> The worker needs Redis and a reachable `email-service`. It fails fast on startup if `REDIS_URL`, `EMAIL_SERVICE_URL`, or `INTERNAL_API_KEY` are missing.

### Root npm scripts

| Script                | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | Start **all three** (main-app, email-service, workers) with `concurrently` |
| `npm run install:all` | Install the root dependencies and all three                |
| `npm test`            | Run the Jest suites for all three                          |
| `npm run lint`        | Lint main-app and email-service with ESLint                |
| `npm run format`      | Format main-app and email-service with Prettier            |
| `npm run db:deploy`   | Apply Prisma migrations for both database services         |
| `npm run db:generate` | Generate the Prisma client for both database services      |

Each piece also keeps its own scripts — run them with `--prefix main-app` / `--prefix email-service` / `--prefix workers`. The worker exposes `start`, `dev`, and `test` (it has no database, so no `db:*` scripts).

### Environment variables

**main-app**

| Variable       | Description                                      |
| -------------- | ------------------------------------------------ |
| `DATABASE_URL` | Prisma connection string (SQLite default)        |
| `REDIS_URL`    | Redis connection, e.g. `redis://localhost:6379`  |
| `PORT`         | HTTP port (default `5000`)                        |
| `JWT_SECRET`   | Secret for signing auth tokens                   |
| `GROQ_API_KEY` | Optional — enables AI product descriptions        |
| `GROQ_MODEL` | Optional — defaults to openai/gpt-oss-20b        |

**email-service**

| Variable           | Description                                                    |
| ------------------ | ------------------------------------------------------------- |
| `DATABASE_URL`     | Prisma connection string (SQLite default)                     |
| `PORT`             | HTTP port (default `5001`)                                     |
| `RESEND_API_KEY`   | Resend API key — required to deliver mail                     |
| `EMAIL_FROM`       | Default sender, e.g. `Shop <onboarding@resend.dev>`           |
| `INTERNAL_API_KEY` | Shared secret callers must send as the `x-api-key` header     |

**workers**

| Variable                  | Description                                                         |
| ------------------------- | ------------------------------------------------------------------ |
| `REDIS_URL`               | Redis connection (same queue as main-app), e.g. `redis://localhost:6379` |
| `EMAIL_SERVICE_URL`       | Base URL of email-service, e.g. `http://localhost:5001/api/v1`     |
| `INTERNAL_API_KEY`        | Must match email-service's `INTERNAL_API_KEY` (sent as `x-api-key`) |
| `EMAIL_CONCURRENCY`       | Optional — jobs processed in parallel (default `5`)                 |
| `EMAIL_RATE_LIMIT_PER_SEC`| Optional — max jobs/sec, to stay under Resend's limit (default `2`) |

## API

### main-app (`http://localhost:5000`)

All routes are versioned under `/api/v1`.

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| GET    | `/health`                       | Health check              |
| POST   | `/api/v1/users/register`        | Create an account         |
| POST   | `/api/v1/users/login`           | Log in, receive a JWT     |
| POST   | `/api/v1/users/forgot-password` | Request a password reset  |
| POST   | `/api/v1/users/reset-password`  | Reset a password          |
| …      | `/api/v1/products`              | Product CRUD + stock check |



### email-service (`http://localhost:5001`)

An internal service — every request must include the `x-api-key` header matching `INTERNAL_API_KEY`.

| Method | Endpoint             | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| GET    | `/health`            | Health check                              |
| POST   | `/api/v1/email/send` | Render and send a transactional email     |

**`POST /api/v1/email/send`**

```http
POST /api/v1/email/send
x-api-key: <INTERNAL_API_KEY>
Content-Type: application/json

{
  "type": "welcome",            // welcome | password_reset | order_confirmation
  "to": "user@example.com",
  "jobId": "email:42",          // optional — makes the send idempotent
  "data": { "name": "Ada" }     // shape depends on `type` (validated per template)
}
```

`data` is validated per `type`:

| `type`               | Expected `data`                                                       |
| -------------------- | --------------------------------------------------------------------- |
| `welcome`            | `{ name }`                                                            |
| `password_reset`     | `{ name, resetUrl }`                                                  |
| `order_confirmation` | `{ name, orderId, total, items: [{ name, quantity, price }] }` (kobo) |

Responses are idempotent on `jobId`: if a job already succeeded, the service returns the existing log instead of sending again. If Resend fails, the row is marked `failed` and the endpoint signals whether a retry is worthwhile: a **502** for transient problems (network/timeout, rate limiting, or a Resend 5xx) that the caller can retry, or a **422** for permanent ones (invalid address, validation failure, bad payload or config) that a retry won't fix.

## API Documentation (Swagger)

Both services generate interactive OpenAPI 3 docs from the `*.docs.js` annotations in their modules. Once a service is running:

| Service       | Swagger UI                           | Raw OpenAPI spec                        |
| ------------- | ------------------------------------ | --------------------------------------- |
| main-app      | `http://localhost:5000/api-docs`     | `http://localhost:5000/api-docs.json`   |
| email-service | `http://localhost:5001/api-docs`     | `http://localhost:5001/api-docs.json`   |

You can send requests straight from the page. For main-app's protected routes, click **Authorize** and paste your JWT (from the login response) to attach it as a Bearer token.

> Adjust the ports if you changed `PORT` in the relevant `.env`.

## Design Notes

- **Resilient background work** – in main-app, email jobs are enqueued, never sent inline. If Redis is down, user actions still succeed and the failure is logged (see [`emailQueue.js`](main-app/src/shared/queue/emailQueue.js)). Jobs retry up to 5 times with exponential backoff.
- **Smart retry classification** – the worker translates the email service's HTTP responses into BullMQ outcomes: transient failures (service unreachable, timeouts, 5xx, or `408`/`409`/`429`) throw a normal error so the job retries, while permanent failures (`400`, `401`, bad payload) throw an `UnrecoverableError` so the job fails immediately without wasting retries (see [`emailService.client.js`](workers/src/clients/emailService.client.js)).
- **Rate limiting** – the worker caps throughput (default 2 jobs/sec) to stay under Resend's per-second limit, independent of how many jobs are queued.
- **Idempotent email delivery** – the worker passes each BullMQ job id to the email service, which keys the send on it and passes an idempotency key to Resend, so a retried job is designed to avoid sending the same email twice. Every attempt is recorded in `EmailLog`.
- **Service isolation** – the email service is reachable only with the shared `INTERNAL_API_KEY`, compared in constant time to avoid timing attacks (see [`apiKey.js`](email-service/src/shared/middlewares/apiKey.js)).
- **Graceful degradation** – AI description generation returns `null` instead of throwing when Groq is unavailable, so product creation never fails because of it.
- **Graceful shutdown** – on `SIGTERM`/`SIGINT`, main-app drains the queue and closes Redis and Prisma connections cleanly. The worker does the same: it stops taking new jobs, lets in-progress jobs finish, then closes its Redis connection before exiting.

## Authors

- Kemka Ofoha
- Joseph Adeoluwa Odamo

## License

ISC
