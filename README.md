# gosynapse.net

The synapse marketing site — a Next.js app exported as static files and served
by GitHub Pages. The product itself lives in a separate, private repository.

```bash
pnpm install
pnpm dev        # http://localhost:3002
pnpm build      # static site in out/
```

Nothing needs a server:

- **Contact form** posts straight to [Web3Forms](https://web3forms.com), which
  emails the enquiry on. Set `NEXT_PUBLIC_WEB3FORMS_KEY`.
- **`/tour`** is unlisted and gated by a code shared on request
  (`/tour?k=<code>`). The browser compares the SHA-256 of the code with
  `NEXT_PUBLIC_TOUR_CODE_SHA256`; the code itself never ships. This keeps
  casual visitors out — it is not access control.

Copy `.env.example` to `.env.local` for local values. In CI both come from the
repository variables `WEB3FORMS_KEY` and `TOUR_CODE_SHA256`.

## Deploying

Every push to `main` builds and publishes via
[`.github/workflows/pages.yml`](.github/workflows/pages.yml). One-time setup:
Settings → Pages → Source: **GitHub Actions**, custom domain `gosynapse.net`.

The illustrations use real product data: `src/app/data.ts` mirrors the demo
seed in the synapse repo — update it when the seed's menu, members or plans
change.

## Docs (/docs)

`docs/` is a separate Astro Starlight project served at https://gosynapse.net/docs. The same Pages workflow builds and deploys it. See `docs/README.md`.
