# Architecture

## Product boundary
This is a real-estate content platform. The original crypto/airdrop concerns are intentionally removed.

## Runtime
- `Next.js` serves the public website and admin UI.
- `Express` exposes the versioned REST API.
- `PostgreSQL` stores all durable business content.
- `Prisma` provides typed database access and migrations.

## Content ownership
Homepage copy, brand/contact settings, about content, services, statistics, testimonials and footer settings live in `SiteContent` JSON. Listings, estates, enquiries and journal posts use dedicated tables because they require search, filtering and lifecycle management.

## Security boundary
Public read APIs expose only public content. Admin mutations require an HTTP-only signed-by-randomness session token, validated against its hashed record in PostgreSQL. Passwords are derived using Node's `scrypt` with a server-side pepper.

## Media
The starter stores public image URLs. For production, replace them with an object-storage service (S3-compatible storage, Cloudflare R2 or equivalent) and store only canonical URLs/keys in PostgreSQL.

## Scalability
The API is stateless apart from the database-backed sessions, so multiple API instances can run behind a reverse proxy. PostgreSQL should be managed and backed up. Add Redis only when traffic, rate-limiting or background work justifies it.
