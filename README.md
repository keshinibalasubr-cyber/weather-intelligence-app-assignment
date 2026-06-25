<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Weather Intelligence Platform

This application fetches real-time weather analytics and generates custom operational planning recommendations using the public Open-Meteo API.

## 🚀 Deployment Instructions & Engineering Handoff

### 1. GitHub Sync Sequence
1. Connect your workspace directly to continuous integration networks.
2. In Google AI Studio, access the top-right Settings panel.
3. Initiate the "Export to GitHub" action.
4. Grant authorized access to your account and select the target repository.
5. Push the source branch (typically `main`) to complete synchronization.

### 2. Cloudflare Pages Configuration
Deploy the static single-page assets globally using the following build configurations:
* **Framework Preset:** `Vite` (or `React`)
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Node Compatibility:** Ensure the environment has the environment version variable `NODE_VERSION = 18` or higher configured.
