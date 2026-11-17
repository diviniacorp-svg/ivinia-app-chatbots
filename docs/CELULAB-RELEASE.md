# CeluLab release preparation

Keep the active Divinia deployment serving traffic until the source baseline and database gates below pass. The existing deployment `90a6a0cbfc44d837b730ac11f46f5f50463e3051` was uploaded from files. It is not the current GitHub main commit and its commit is not available in the GitHub repository. A partial source comparison found shared files that differ as well as three source files absent from the preview branch. The deployment file listing and some file responses are truncated. Do not replace missing content with those excerpts.

## Source baseline

Obtain the complete archive/worktree used to build the live deployment, or a commit that matches it. Verify overlapping file hashes against the deployment manifest. Apply the approved CeluLab changes to that baseline, keeping unrelated routes, middleware, dependencies, configuration and scheduled jobs. Smoke test the shared app as well as CeluLab. Use the preview environment for tests and do not promote the test database or demo PINs.

## Database

Run `scripts/celulab/release-preflight.sql` against the correct project before and after migration. Identify overlapping migrations by live schema and migration history. The existing production nucleus sessions, customer profiles and price-list function are not absent. Do not blindly replay their creation scripts.

The known missing upgrades, in order, cover technician access, order tracking/evidence/additional jobs, shipping/physical stock, owner access, quote versions, order fields, quote contact/labor rates, and provider-specific availability. Review existing partner PIN access and preserve original order IDs, payment status and stock rows. Do not treat NULL provider availability as confirmed or turn an aggregate stock number into a provider-wide flag. Verify separately that the active offers needed for launch have trustworthy stock values.

Apply approved additive changes in a reversible release window after backing up, rehearse with a production-shaped fixture, and verify table/column/function readiness. Do not rerun baseline setup SQL, re-seed demo data, or trigger a live supplier job as part of the initial migration.

## Release checks

- Authenticated local demo opens Nueva orden and Nuevo presupuesto. Check the order and budget in the proper scope without exposing workshop-only amounts.
- One test pickup uses an accessory with confirmed availability and linked physical stock. Confirm product, server-side price, idempotent order, stock decrement, tracking and simulated payment in the separate test database.
- Check the price list, storefront and unaffected Divinia routes before switching traffic. Keep the prior deployment available for a rollback. A code rollback does not revert database migrations.

## Local rehearsal

The rehearsal uses an isolated PostgreSQL-compatible in-memory process with a minimal production-shaped fixture. It does not connect to any Supabase project. Install the test dependency outside the repository and run:

```sh
npm install --prefix /tmp/celulab-release-test @electric-sql/pglite@0.5.16
node scripts/celulab/rehearse-release.mjs /tmp/celulab-release-test
```

It checks that old repair and pending store orders remain intact, old supplier availability stays unknown, owner access and tracking can be created, the pickup reserves units once, and the transaction is rolled back. This is not a replacement for an authenticated browser test or a rehearsal with a full production backup.
