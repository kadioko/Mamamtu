# Education System

Last updated: 2026-05-07

The education area is the public learning library for patients, families, and care teams.

## Public Experience

Public route:

```text
/education
```

Resource detail route:

```text
/education/[id-or-slug]
```

The public education browser includes:

- Automatic search as the user types.
- URL-backed filters for category, difficulty, content type, sort order, and page.
- Featured resource recommendations.
- Published resource, category, and current result counts.
- Category buttons with live published-resource counts.
- Mobile-friendly filter and result layout.
- Error and empty states that keep the page usable when the content API is unavailable.

## Automatic Behavior

Search is debounced, then written to the URL automatically. That means users can share filtered education links and use browser back/forward naturally.

The content API supports these sorting modes:

- `newest`
- `popular`
- `title-asc`
- `title-desc`

Featured resources are loaded automatically from published content marked `isFeatured`.

## Content Management

Dashboard route:

```text
/dashboard/education
```

Admins and healthcare providers can:

- Add a new education resource.
- Review draft and published resources.
- Publish or unpublish resources.
- Open resources from the dashboard list.

Content creation route:

```text
/education/new
```

## API

List published content:

```text
GET /api/content
```

Common query params:

- `page`
- `limit`
- `search`
- `category`
- `difficulty`
- `type`
- `featured=true`
- `sort`

List categories:

```text
GET /api/content/categories
```

## Verification

The Playwright suite verifies:

- Public education resources load.
- A resource detail page can be opened.
- Dashboard education management controls render for admins.

Next test improvements:

- Exercise automatic search and filter URLs.
- Verify featured resources render when seeded content has `isFeatured=true`.
- Add a publish/unpublish dashboard flow in an isolated test database.
