# ResvHub

ResvHub is a focused resource reservation portal for shared meeting rooms, equipment, and vehicles. It prevents overlapping bookings, keeps an auditable reservation record, and gives users a simple way to look up or cancel their own upcoming reservations.

## Features

- Resource catalog with category and active-status filters
- Reservation form with validation for future times and valid time ranges
- Serializable transaction plus overlap check to prevent double booking
- Booking lookup and cancellation by the email used at booking time
- Admin resource catalog management (add resources, activate/deactivate them, and view upcoming organization-wide reservations)
- PostgreSQL persistence through Prisma ORM 7
- Credential authentication with signed HTTP-only sessions and admin role protection

## Local setup

Requirements: Node.js 20+, PostgreSQL 14+, and npm.

```bash
cp .env.example .env
# Update DATABASE_URL in .env for your PostgreSQL database
npm install
npm run db:sync
npm run db:seed
npm run dev
```

`db:sync` is used here because the assessment project may be opened against an existing local PostgreSQL database without migration history. It updates the schema without resetting existing rows. For a new production workflow, use reviewed Prisma migrations via `npm run db:migrate`.

Open http://localhost:3000. The admin page is available at `/admin` and is protected by the administrator role.

## Demo accounts

Run `npm run db:seed` to create the local assessment accounts:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@resvhub.local` | `Admin123!` |
| User | `user@resvhub.local` | `User123!` |

Change these credentials before any shared or production deployment. Users must sign in to create or cancel reservations. The `/admin` page and its server actions require the `ADMIN` role. Set `AUTH_SECRET` in `.env` to a long random value; the development fallback is not suitable for production.

New regular users can register at `/register`. Registration always creates a `USER` account; administrator access is never selectable during registration.

## Data model

The database contains `User`, `Resource`, and `Reservation`. A user can have many reservations and a resource can have many reservations. Reservation status is explicit (`CONFIRMED` or `CANCELLED`) and indexed for availability queries. The overlap rule is:

```text
existing.start < requested.end AND existing.end > requested.start
```

An ER diagram is included in [`docs/er-diagram.md`](./docs/er-diagram.md) and can be rendered by GitHub or any Mermaid-compatible viewer.

## Validation

```bash
npm run lint
npm run build
```
