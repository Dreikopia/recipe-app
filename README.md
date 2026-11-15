# Recipe App

Search live recipes and open any one of them for ingredients and step-by-step instructions. Built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui, on top of the [Spoonacular](https://spoonacular.com/food-api) API.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env` and add a free key from [spoonacular.com/food-api](https://spoonacular.com/food-api):

   ```bash
   VITE_SPOONACULAR_KEY=your_key_here
   ```

3. `npm run dev`

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |

## Deploy to Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new). Vercel detects Vite: build `npm run build`, output `dist`.
2. Add `VITE_SPOONACULAR_KEY` under **Settings → Environment Variables**, for both Production and Preview.
3. Deploy.

## API usage

The free plan allows 50 points per day. A homepage load and a search cost about 1 point each; opening a recipe costs about 0.75 and is cached for the session.

## Notes

Vite inlines every `VITE_*` variable into the bundle, so the key is visible to anyone who opens devtools or reads the network tab. That is acceptable for a free key you can rotate. A backend proxy is the fix for a real product.
