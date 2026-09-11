# Hé

A quiet mood journal. Harmony, yin and yang, and oneness — 天人合一.

## Deploy

Vercel Hobby is enough. For moods to persist across visits, add a Postgres URL:

1. Create a free Neon project: https://neon.tech
2. In the Vercel project, set `DATABASE_URL` to the pooled connection string
3. Redeploy. Migrations run on build.

Without `DATABASE_URL` the app still builds; serverless instances use an in-memory store that resets.
