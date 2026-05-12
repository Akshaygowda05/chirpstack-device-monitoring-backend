# User Management Backend Service

A scalable backend service built using Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, MQTT, and Docker.

This backend is designed to manage:

* User authentication and authorization
* Robot telemetry ingestion
* MQTT event processing
* Real-time robot monitoring
* Device state management
* Queue-based background processing
* ChirpStack integration
* Redis caching and workers

---

# Tech Stack

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Backend runtime           |
| TypeScript | Type safety               |
| Express.js | REST API framework        |
| Prisma ORM | Database ORM              |
| PostgreSQL | Primary database          |
| Redis      | Queue + caching           |
| BullMQ     | Background job processing |
| MQTT       | Robot telemetry ingestion |
| ChirpStack | LoRaWAN integration       |
| Docker     | Containerization          |
| Socket.IO  | Real-time communication   |
| Winston    | Logging                   |

---

# Features

## Authentication & Authorization

* JWT-based authentication
* Role-based access control
* Admin and user roles
* Secure password hashing using bcrypt

---

## Robot Telemetry Processing

* MQTT message ingestion
* Real-time device status updates
* Odometer processing
* Battery monitoring
* Robot activity tracking
* Panel cleaning calculations

---

## Queue Processing

* BullMQ workers for background processing
* Redis-backed queue system
* Async MQTT event handling
* Fault-tolerant processing pipeline

---

## Database Management

* Prisma ORM integration
* PostgreSQL relational database
* Type-safe queries
* Prisma migrations
* Database seeding support

---

## Real-Time Features

* Socket.IO integration
* Live robot monitoring
* Gateway telemetry updates
* Device status broadcasting

---

# Project Structure

```bash
src/
│
├── config/             # Application configurations
├── controllers/        # Business logic controllers
├── middlewares/        # Express middlewares
├── routes/             # API routes
├── services/           # Service layer
├── worker/             # BullMQ workers
├── mqtt/               # MQTT integration
├── socket/             # Socket.IO logic
├── utils/              # Utility functions
├── logger/             # Winston logger setup
└── server.ts           # Application entry point
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
PORT=3000

DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp

REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=your_secret_key

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin

CHIRPSTACK_KEY=your_chirpstack_api_key
```

---

# Running with Docker

## Start Services

```bash
docker compose up --build
```

---

## Stop Services

```bash
docker compose down
```

---

# Prisma Commands

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Migrations

```bash
npx prisma migrate dev
```

---

## Seed Database

```bash
npx prisma db seed
```

---

# API Overview

## Authentication

| Method | Endpoint               | Description |
| ------ | ---------------------- | ----------- |
| POST   | `/api/v1/auth/login`   | User login  |
| POST   | `/api/v1/users/create` | Create user |

---

## Robot APIs

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| GET    | `/api/v1/robots`     | Get all robots    |
| GET    | `/api/v1/robots/:id` | Get robot details |
| GET    | `/api/v1/reports`    | Fetch reports     |

---

# MQTT Integration

This backend subscribes to ChirpStack MQTT topics for robot telemetry ingestion.

Example Topic:

```bash
application/{applicationId}/device/{devEui}/event/up
```

Processed telemetry includes:

* Battery voltage
* Robot status
* Panels cleaned
* Odometer readings
* GPS data
* Device health metrics

---

# Redis & BullMQ

Redis is used for:

* Queue processing
* Background workers
* Temporary caching
* Event processing pipelines

BullMQ workers process MQTT payloads asynchronously to improve performance and reliability.

---

# Logging

Winston logger is used for:

* Error logging
* Request tracking
* MQTT processing logs
* Worker monitoring
* Debugging

---

# Security

* Password hashing using bcrypt
* JWT authentication
* Protected routes
* Environment-based configuration
* Role-based access control

---

# Development

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

---

# Future Improvements

* Refresh token support
* API rate limiting
* Advanced monitoring dashboards
* Kubernetes deployment
* WebSocket scaling
* Redis clustering
* Automated alerting system
* Device analytics engine

---

# Author

Developed for scalable robot monitoring and telemetry management systems.
