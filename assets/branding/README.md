# Pasifika Campus — Branding Assets

This folder holds the approved **Pasifika Campus** brand assets and is the
single place to drop final artwork.

## What's here

| File | Purpose |
|------|---------|
| `pasifika-campus-icon.svg` | App icon / **P monogram** (Logo Concept 1): sun, palm, waves, gold-on-black |
| `pasifika-campus-logo-primary.svg` | **Primary horizontal logo** (Logo Concept 2): Pacific emblem + PASIFIKA CAMPUS wordmark |
| `pasifika-campus-logo-secondary.svg` | Stacked logo for light backgrounds / compact use |
| `brand-colours.json` | Colour tokens (single source of truth), mirrored in `constants/colors.ts` |

## Approved logo direction

The SVGs are **faithful vector placeholders that follow the approved
direction** — Pacific identity (sun, palm, island/mountain, ocean waves),
gold + black + grey, premium and modern. They are **not** generic shopping
bag / cart / globe / storefront icons.

> **When the final approved raster/vector artwork is supplied, place it here**
> using the same file names (and add the PNGs listed below). Keep the same
> viewBox / proportions so the app layout is unaffected. Do **not** distort,
> stretch, recolour, or redesign the approved logos.

## PNGs required by `app.json` (generate from the SVGs)

Expo references these raster files. Export them from the SVGs above:

| File | Size | Notes |
|------|------|-------|
| `app-icon.png` | 1024×1024 | from `pasifika-campus-icon.svg` |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground (safe zone), charcoal background `#0D0D0D` |
| `splash.png` | 1284×2778 | logo centred on charcoal `#0D0D0D` |

Any SVG→PNG tool works, e.g.:

```bash
# example using a local rasteriser (install of your choice)
npx sharp-cli -i pasifika-campus-icon.svg -o app-icon.png resize 1024 1024
```

Until the PNGs are added, run the app with the SVG logo component
(`components/ui/Logo.tsx`) which renders the brand mark natively via
`react-native-svg`.
