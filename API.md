# API

Base URL: `/api/v1`

## Public
- `GET /content`
- `GET /properties`
- `GET /properties/:slug`
- `GET /estates`
- `GET /estates/:slug`
- `GET /posts`
- `POST /leads`

## Admin
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /content`
- `POST/PATCH/DELETE /properties`
- `POST/PATCH/DELETE /estates`
- `POST/PATCH/DELETE /posts`
- `GET/PATCH /leads`

All admin mutation routes require the `cms_session` HTTP-only cookie.
