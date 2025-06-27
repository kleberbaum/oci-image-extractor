<p align="center">
  <a href="https://netsnek.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://avatars.githubusercontent.com/u/148873257?s=400&u=db7fa77c9a2a16eec51871024811abd21f734787&v=4" alt="SNEK Logo" height="150">
  </a>
</p>

<h3 align="center">Docker Image Explorer</h3>

This repository hosts a static **Astro** site that lets you inspect and
download public Docker or OCI images directly in the browser. The UI uses
**Chakra UI**, and the site is deployed to **Cloudflare Pages**.

## Local development

1. Ensure **Node.js 20+** and `pnpm` are installed.
2. Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

To create a production build locally, run:

```bash
pnpm build
Visit `http://localhost:4321` and enter an image such as
`ghcr.io/getcronit/jaen-agent:zitadel`. After fetching, a table lists every file
with the option to download a ZIP archive of the extracted filesystem.

## Continuous deployment

A GitHub Actions workflow builds the site and uploads the `dist/` folder to
Cloudflare Pages. It expects these configuration values:

- `CF_API_TOKEN` — repository secret
- `CF_ACCOUNT_ID` — repository variable
- `CF_PAGES_PROJECT` — repository variable
The site deploys to `oci-image-extractor.pages.dev` using the project name
`oci-image-extractor`. See `.github/workflows/pages.yml` for the full
pipeline.

## Repository files

- `CODE_OF_CONDUCT.md` – our Code of Conduct
- `CONTRIBUTING.md` – guidelines for contributors
- `LICENSES/preferred/EUPL-1.2` – license text
- `COPYING` – licensing notes
- `src/` – the Astro project containing all source files

## License

SPDX-License-Identifier: EUPL-1.2

Copyright © 2019-2024 netsnek
