# Security baseline

- Use HTTPS in production.
- Set a long random `PASSWORD_PEPPER` and keep it in a secret manager.
- Change `ADMIN_PASSWORD` before deployment.
- Restrict `WEB_ORIGIN` to the exact production frontend origin.
- Use managed PostgreSQL with backups and point-in-time recovery.
- Replace remote demo images with licensed assets stored in private/public object storage as appropriate.
- Add distributed rate limiting at the reverse proxy/API gateway before exposing the admin login publicly.
- Add audit logs and role-based access control when more than one administrator is required.
- Consider 2FA for production administrators.

The included rate limiter is intentionally small and process-local. In a multi-instance deployment, move rate limiting to the reverse proxy/API gateway or a shared Redis store.
