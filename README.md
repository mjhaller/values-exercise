# Core Values Exercise

A phone-friendly version of the [Taproot values exercise](http://www.taproot.com/archives/37771):

1. **Pick** every value that resonates (search, or add your own).
2. **Group** similar values into up to five groups (pick a group, tap values).
3. **Label** each group with the one value that sums it up.

You get a short list of core values you can share or copy. Progress is saved on the device (localStorage); nothing is sent anywhere.

It's a React + Vite web app that installs as a PWA (works offline, "Add to Home Screen" on iOS/Android), with an Electron wrapper for desktop.

## Develop

```bash
npm install
npm run dev            # web, http://localhost:5173 (use --host to open it on your phone over LAN)
npm run electron:dev   # Electron window against the Vite dev server
```

## Build

```bash
npm run build          # static site in dist/
npm run electron       # build, then open in Electron
npm run dist           # desktop installers in release/ (dmg / nsis / AppImage)
```

## Put it on your phone

Electron doesn't run on iOS/Android, so on a phone you use the web build:

- Deploy `dist/` to any static host. `.github/workflows/pages.yml` deploys to GitHub Pages on every push to `main` (enable Pages → Source: GitHub Actions in repo settings; Pages on private repos requires a paid plan).
- Open the URL on your phone and choose **Add to Home Screen**. It then launches full-screen and works offline.
