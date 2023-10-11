# Trivia Discord Bot - Interactions

## Tools Used

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
  - [D1](https://developers.cloudflare.com/d1/) (Serverless SQLite managed by Cloudflare)
- [Drizzle](https://orm.drizzle.team/docs/quick-sqlite/d1)

## Schema Generation

### Generate Schema Migrations

```bash
npm run generate
```

This will output a `####-abcd-efg.sql` file into the drizzle directory. This will be referred to as <GENERATED_SQL>.

### Apply Migrations

```bash
npx wrangler d1 execute discord-bot --file=./drizzle/<GENERATED_SQL>
```
