# Resume Vault

A React and TypeScript workspace for importing PDF and DOCX résumés and editing reusable résumé profiles. The web app uses Supabase for authentication and profile storage.

| Package | Purpose |
| --- | --- |
| [packages/core](packages/core) | Document parsers and shared profile types |
| [packages/web](packages/web) | Sign-in, résumé import, and profile editing |

## Run locally

Use Node.js and pnpm. Copy [the environment template](packages/web/.env.example) to `packages/web/.env.local` and set the Supabase project URL and anonymous key. Then run `pnpm install` and `pnpm dev` from the repository root.

Profile operations require a Supabase `profiles` table. See [the data access code](packages/web/src/lib/api.ts) for the expected fields. This workspace does not include a database migration. Use sample data until database access policies are configured and verified.
