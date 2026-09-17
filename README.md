# MyFin

A Next.js personal finance dashboard with Prisma and PostgreSQL.

## Requirements

- Node.js 20+
- npm
- External PostgreSQL database
- Docker and Docker Compose (for the app container)

## Local development

1. Create a local environment file from the sample config:

   ```bash
   cp .env.example .env
   ```

   Then update the values in `.env` to match your local setup.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Confirm that your external PostgreSQL instance is running and reachable, and that `.env` contains your `DATABASE_URL`.

4. Set environment variables before running the app. Example:

   ```bash
   export DATABASE_URL="postgresql://myfin:myfin_secure_password@localhost:5432/myfin?schema=public"
   export NEXTAUTH_URL="http://localhost:3000"
   export NEXTAUTH_SECRET="replace-with-a-long-random-secret"
   export ENCRYPTION_KEY="replace-with-a-32-byte-key"
   ```

   On Windows PowerShell, use:

   ```powershell
   $env:DATABASE_URL="postgresql://myfin:myfin_secure_password@localhost:5432/myfin?schema=public"
   $env:NEXTAUTH_URL="http://localhost:3000"
   $env:NEXTAUTH_SECRET="replace-with-a-long-random-secret"
   $env:ENCRYPTION_KEY="replace-with-a-32-byte-key"
   ```

5. Prepare the database schema:

   ```bash
   npx prisma db push
   ```

6. Start the app in development mode:

   ```bash
   npm run dev
   ```

7. Open the app in your browser at:

   ```text
   http://localhost:3000
   ```

### Useful development commands

```bash
npm run build
npm run lint
npx prisma generate
npx prisma studio
```

---

## Production mode

### Option 1: Run the app with an external database

From the project root:

```bash
docker compose up --build -d
```

This starts only the app container and connects it to the external database configured in `.env`. The app will be available at:

```text
http://localhost:3000
```

To stop it:

```bash
docker compose down
```

### Option 2: Build and run the app without Docker Compose

1. Build the app:

   ```bash
   npm run build
   ```

2. Start the production server:

   ```bash
   npm run start
   ```

> Note: Make sure the required environment variables are set in your shell or deployment environment before running the production server.

### Production environment variables

Set these in `.env` to point at your external PostgreSQL instance:

```bash
DATABASE_URL="postgresql://user:password@host:5432/myfin?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
ENCRYPTION_KEY="replace-with-a-32-byte-key"
```

If you are using a managed database, just set `DATABASE_URL` to the provider connection string and leave the app container alone.

---

## Troubleshooting

- If Prisma cannot connect to PostgreSQL, verify that the database container is running and that `DATABASE_URL` matches your database host and credentials.
- If authentication fails, regenerate `NEXTAUTH_SECRET` and ensure `NEXTAUTH_URL` points to the correct domain.
- If you change Prisma models, run:

  ```bash
  npx prisma generate
  npx prisma db push
  ```
