# GymOS API Conventions

Base path: `/api/v1`

## Endpoint groups

- `/auth`
- `/tenants`
- `/domains`
- `/branches`
- `/members`
- `/membership-plans`
- `/subscriptions`
- `/invoices`
- `/payments`
- `/attendance`
- `/trainers`
- `/workouts`
- `/fitness`
- `/classes`
- `/notifications`
- `/reports`
- `/platform`

## Response shape

Success:

```json
{
  "success": true,
  "message": "Member registered successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "The request could not be completed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

## API requirements

- Validate all request bodies with Pydantic.
- Use consistent pagination, filtering and sorting.
- Return appropriate HTTP status codes.
- Apply authentication and tenant authorization on every protected endpoint.
- Do not expose internal exception traces to clients.
- Use idempotency keys for payment initiation and other retry-sensitive operations.
- Version breaking API changes.
- Document endpoints with OpenAPI.

## Initial endpoint catalogue

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create login account |
| POST | `/auth/login` | Authenticate |
| POST | `/auth/refresh` | Refresh session |
| POST | `/tenants/register` | Submit gym registration |
| GET | `/tenants/current` | Current workspace |
| POST | `/tenants/{id}/approve` | Platform approval |
| POST | `/domains` | Add workspace domain |
| GET/POST | `/branches` | List/create branches |
| GET/POST | `/members` | List/register members |
| GET/PATCH | `/members/{id}` | Read/update member |
| GET/POST | `/membership-plans` | List/create plans |
| GET/POST | `/subscriptions` | List/create subscriptions |
| POST | `/subscriptions/{id}/renew` | Renew subscription |
| POST | `/payments/initialize` | Start provider checkout |
| POST | `/payments/webhooks/{provider}` | Provider webhook |
| POST | `/attendance/check-in` | Check in member |
| POST | `/attendance/check-out` | Check out member |
| GET | `/reports/dashboard` | Dashboard aggregates |
| GET | `/platform/plans` | Available GymOS plans |

These are proposed routes; implement them incrementally.
