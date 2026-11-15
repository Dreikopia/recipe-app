# Product Requirements Document: Recipe App v1

| Field | Value |
|---|---|
| Version | 1.1 (Draft) |
| Date | 2026-11-15 |
| Project | Recipe App (React + TypeScript fundamentals, modeled on BookZilla v1) |
| Stack | Vite, React, TypeScript (TSX), Tailwind CSS, shadcn/ui, React Router (later), Spoonacular Recipe API |
| Status | Draft |

**Tags:** `[REQUIRED]` must be built as written. `[RECOMMENDED]` is a suggestion. `[ASSUMPTION]` is believed true but not confirmed. `[OPEN QUESTION]` is still undecided.

**Version 1.1:** the data source moved from API Ninjas to Spoonacular. API Ninjas returned one recipe per request on the free tier, so a homepage and a search list were impossible without many requests. All three open questions were answered by calling the live API on 2026-11-15.

---

## Open Questions Summary

| ID | Question | Answer |
|---|---|---|
| OQ-3 | What is the request quota? | 50 points per day on this key, not requests. Cost per call is in section 10. |
| OQ-4 | How do you display one ingredient line? | Use the `original` string the API already formats, for example "2/3 cup butter". No stitching of name, amount and unit. |
| OQ-5 | Does the API allow requests from the browser (CORS)? | Yes. Tested from `http://localhost:5173`. |

**Defaults used in this version** (you confirmed none of these, so change them freely): 12 cards on the homepage, category chips and favorites are later features, and cards use the real photo the API returns.

---

## 1. Feature Overview

- **Description:** a browser-only app where you search for recipes by name, browse a homepage of live recipe cards, load more cards with a button, and open a details modal with ingredients and steps.
- **Purpose:** practice React and TypeScript on a second app after BookZilla v1, so the concepts stick.
- **Problem:** reading about React does not make you comfortable with it. Building does.
- **Learning rule `[REQUIRED]`:** you write the code yourself, with guidance. Do not copy a finished implementation.
- **Refactor rule `[REQUIRED]`:** start with everything in `App.tsx`. Refactor only when something hurts. Before each refactor, write the problem in one sentence. That sentence is what you should be able to explain.

## 2. Goals and Success Criteria

1. Practice components, props, `useState`, `useEffect`, events, forms, lists, conditional rendering, and typed code.
2. Practice debouncing by writing it by hand first, then compare it with a package.
3. Practice fetching data, handling loading and errors, and turning messy API data into your own TypeScript type.
4. Feel real problems (long files, duplicated code, wasted requests) and learn why refactoring exists.
5. **Success:** every item in section 16 is checked, and you can explain why each piece of code works.

## 3. Users and Permissions

One anonymous user. No login and no roles. Authentication, a backend, and a database are out of scope for v1.

## 4. User Stories

- **US-1:** As a user, I want to search recipes by name so I can find something to cook.
- **US-2:** As a user, I want results to appear while I type, without sending a request on every letter.
- **US-3:** As a user, I want to see recipes on the homepage before I search, so I get ideas.
- **US-4:** As a user, I want a "Show more" button so I can see another recipe whenever I want.
- **US-5:** As a user, I want to open a recipe's details to see its ingredients and steps.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | The page has a search box and a Search button. | Must |
| FR-2 | Typing triggers a search automatically 600 ms after the user stops typing, if the trimmed text has 3 or more characters (debounce, written by hand). | Must |
| FR-3 | Pressing Enter or clicking Search searches immediately, with no wait, if the trimmed text has 3 or more characters. | Must |
| FR-4 | A search shows loading, error, empty, and result states (section 8). | Must |
| FR-5 | A search result is shown as a recipe card with the recipe photo, title, and a Details button. Search results carry no other data. | Must |
| FR-6 | Before any search, the homepage loads 12 recipe cards with photos in one request, sorted by popularity. | Must |
| FR-7 | A "Show more" button below the homepage cards fetches the next 12 recipes in one request and adds them as cards. | Must |
| FR-8 | A search replaces the homepage cards with the search results. Clearing the search box brings the homepage cards back without new requests. | Must |
| FR-9 | Clicking Details fetches that recipe once and opens a modal with photo, title, servings, and numbered steps. Opening the same recipe again makes no request. | Must |
| FR-10 | The modal closes with a Close button or the Esc key. | Must |

## 6. Business Rules

| ID | Rule |
|---|---|
| BR-1 | No request is sent for text under 3 characters (after trimming), and none is sent for the same text as the last search. |
| BR-2 | Enter and the Search button skip the debounce wait but still follow BR-1. |
| BR-3 | A recipe's `id` is the numeric `id` from the API. Use it as the React `key` and in the details request. |
| BR-4 | A list never shows two cards with the same `id`. |
| BR-5 | When there are no more results, the "Show more" button is hidden. |
| BR-6 | If the homepage request fails, the homepage section is hidden and the search box still works. No error message is shown. |
| BR-7 | When two searches overlap, only the results of the latest search are shown (stale responses are ignored). |

## 7. Workflows

**A: Browse the homepage.**
1. The user opens the page.
2. The app makes one request for 12 recipes sorted by popularity.
3. The 12 cards appear together.

**B: Show more.**
1. The user clicks "Show more". The button is disabled while loading.
2. The app requests the next 12 recipes with `offset`.
3. The new cards are added at the end of the list.

**C: Search by typing.**
1. The user types "lentil soup".
2. The user pauses for 600 ms.
3. The app shows "Searching recipes…" and then a grid of matching recipes, replacing the homepage cards.

**D: Search by Enter.** The user types "pancakes" and presses Enter. The search starts immediately.

**E: Details.** The user clicks Details. The app requests that recipe's details (the first time only), the modal opens, and the user presses Esc to close it.

**Failure paths:**

- Search request fails: show the error message. The previous results are hidden.
- Homepage request fails: hide the homepage section, keep the search box working (BR-6).
- Details request fails: show the error message inside the modal.
- Quota used up: the call fails like any other request. A bad key returns 401; running out of daily points returns 402.

## 8. UI/UX Requirements

**Layout (top to bottom):** heading, search box and button, then either the search area or the homepage section.

```text
[ Search box ........................ ] [Search]

Popular picks
[ Card ]  [ Card ]  [ Card ]  [ Card ]
          [ Show more ]
```

**States and exact copy:**

| State | Behavior |
|---|---|
| Search loading | "Searching recipes…" and the Search button is disabled |
| Search error | "Something went wrong. Please try again." |
| Search empty | "No recipes found for “{query}”. Try a different word." |
| Query too short | No request. Hint under the box: "Type at least 3 characters." |
| Homepage loading | "Loading recipes…" until the response arrives |
| Show more loading | The button reads "Loading…" and is disabled |
| No more results | The "Show more" button is hidden |
| Details loading | "Loading recipe…" inside the modal |
| Recipe with no ingredients | "No ingredients listed." |
| Recipe with no steps | "No instructions listed." |

- **Images:** every card shows the photo the API returns, with the title as `alt` text. `[RECOMMENDED]`
- **Long titles:** limit to 2 lines on the card.
- **Responsive:** 1 column on mobile, 2 on tablet, 3 to 4 on desktop.
- **Accessibility:** the search input has a label. Icon-only buttons have `aria-label`s. The modal closes with Esc and returns focus to the Details button. The shadcn `Dialog` handles this. `[RECOMMENDED]`
- **shadcn components:** `Button`, `Input`, `Card`, `Dialog`. `[RECOMMENDED]`

## 9. API and Data Requirements

Base URL: `https://api.spoonacular.com`. The key is a query parameter (`apiKey`), not a header.

**Call 1: cards (homepage and search)**

| Item | Value |
|---|---|
| Endpoint | `GET /recipes/complexSearch` |
| Params | `query`, `number` (default 10, max 100), `sort=popularity`, `offset` |
| Response | An object: `{ results: RecipeSummary[], totalResults: number }` |
| Each result | `id`, `title`, `image`, `imageType` — nothing else |

Note the wrapper object. The old API returned a bare array; this one does not.

**Call 2: details (one recipe)**

| Item | Value |
|---|---|
| Endpoint | `GET /recipes/informationBulk?ids=715467` |
| Response | An array. Take `[0]` for a single recipe. |
| Each item | Everything a card has, plus the detail fields below |

**The types** (`src/types/recipe.ts`). Two types, because the two endpoints return different amounts of data:

| Type | Field | Type | Notes |
|---|---|---|---|
| `RecipeSummary` | `id` | number | Use it as the React `key` (BR-3) |
| | `title` | string | |
| | `image` | string | Already a full URL |
| `ApiRecipe` | | | Extends `RecipeSummary`, so it also satisfies card code |
| | `servings` | number | `8`, not `"8 servings"` |
| | `readyInMinutes` | number | |
| | `extendedIngredients` | array of objects | Each has `name`, `amount`, `unit`, `original` |
| | `analyzedInstructions` | array of groups | Each group has `steps: { number, step }[]` |

**What the API does not give you:**

- Search results never contain ingredients or steps. Not even with `addRecipeInformation=true`: that flag adds `servings` and, with `fillIngredients=true`, `extendedIngredients` — but still no steps.
- There is no flat `string[]` of steps. There is `instructions` (an HTML string) and `analyzedInstructions` (the structured version). The app uses `analyzedInstructions`.
- A step's text can swallow the next step ("… about 8 minutes.Step 2: Stir in…"). Render as-is; do not parse it.
- `analyzedInstructions` can be an empty array, and its groups can restart `number` at 1. Render with `<ol>` and the list index, not `number`.
- Ingredient names can repeat inside one recipe, so `name` is not a safe React key.
- No typo tolerance: "chiken soup" returns 0 results. `/recipes/autocomplete` gives suggestions for 0.1 points if you want that later.
- The old dish-name list is gone. The homepage is one request, not one request per dish.

## 10. Requests and Quota

| User action | Calls | Points |
|---|---|---|
| Open the homepage | 1 (returns 12 cards) | ~1 |
| Click "Show more" | 1 | ~1 |
| A debounced search | 1 per search that passes BR-1 | ~1 |
| Enter or Search button | 1 | ~1 |
| Open Details, first time for that recipe | 1 | ~0.75 |
| Open the same Details again | 0 (cached) | 0 |
| Clear the search box | 0 | 0 |

The key has **50 points per day**, so the unit is points, not requests. Measured on 2026-11-15: a plain search for 10 results cost about 1 point, and `informationBulk` for one recipe about 0.75.

Do not fetch details for every card up front. Ten recipes with `addRecipeInformation=true&fillIngredients=true` cost about 5 points for data you may never open. Fetch on click.

**Dev-mode note:** in development, React can run an effect twice on load. You may see two homepage requests once. This only happens in development. Notice it, and decide later how to prevent it.

## 11. Validation and Error Handling

| Case | Behavior |
|---|---|
| Text is empty or under 3 characters after trimming | No request, show "Type at least 3 characters." |
| Text is over 100 characters | Limit with `maxLength` on the input |
| Same text as the last search | No new request (BR-1) |
| Response is not OK (bad key, quota, bad request) | Search error state; homepage section hidden (BR-6) |
| Network failure | Same as above |
| Empty `results` array | Search empty state; homepage section hidden (BR-6) |
| Overlapping searches | Only the latest results are shown (BR-7) |
| Button clicked while loading | Ignored, because the button is disabled |

## 12. Security

- The API key goes in `.env` as `VITE_SPOONACULAR_KEY`. `.env` is added to `.gitignore` and never committed. `[REQUIRED]`
- **Be aware:** anything in a Vite frontend is visible to users in the browser. The key also travels as a query parameter, so it appears in the network tab and in any URL you share. That is acceptable for a free learning key you can rotate. In a later backend version, the server will hold the key.

## 13. Acceptance Criteria

| ID | Covers | Criterion |
|---|---|---|
| AC-1 | FR-2, BR-1 | **Given** I type "lentil soup" quickly and pause, **then** exactly one request is sent after about 600 ms. |
| AC-2 | FR-3 | **Given** I type "pancakes" and press Enter, **then** the search starts immediately. |
| AC-3 | BR-1 | **Given** I type only 2 characters or spaces, **then** no request is sent and I see "Type at least 3 characters." |
| AC-4 | FR-4 | **Given** a search is running, **then** I see "Searching recipes…" and the Search button is disabled. |
| AC-5 | FR-4 | **Given** a wrong API key, **when** I search, **then** I see the error message. |
| AC-6 | FR-4 | **Given** a search with no matches, **then** I see the empty message with my text. |
| AC-7 | BR-7 | **Given** two searches in quick succession, **then** the results shown belong to the latest one. |
| AC-8 | FR-5 | **Given** a result, **then** the card shows the recipe photo and title. |
| AC-9 | FR-6 | **Given** I open the page, **then** I see 12 recipe cards with photos, after a single request. |
| AC-10 | BR-6 | **Given** the homepage request fails, **then** the homepage section is hidden and no error message appears. |
| AC-11 | FR-7, BR-4, BR-5 | **Given** the homepage, **when** I click "Show more", **then** 12 more cards are added and no `id` appears twice. |
| AC-12 | FR-7 | **Given** "Show more" is loading, **then** the button is disabled. |
| AC-13 | FR-8 | **Given** I searched, **when** I clear the search box, **then** the homepage cards come back with no new requests. |
| AC-14 | FR-9, FR-10 | **Given** a card, **when** I click Details, **then** a modal shows the photo, servings, ingredients and numbered steps after one request, and reopening the same recipe makes no request. **When** I press Esc, **then** it closes. |
| AC-16 | Section 12 | **Given** the repository, **then** `.env` is ignored by Git. |

## 14. Build Steps

Each step leaves the app working. After each step, explain in your own words why the code works before moving on.

**Part A: Search and details (build this first).**

| Step | What you build | Concept |
|---|---|---|
| 1 | Call `/recipes/complexSearch` once by hand with the key. Look at the real JSON and check CORS. | Reading real data (OQ-5) |
| 2 | Write the `RecipeSummary` and `ApiRecipe` types | TypeScript interfaces |
| 3 | Show one hard-coded recipe card. This is a temporary scaffold that you delete in step 12. | JSX, typed data, props |
| 4 | Add the search input with its text in state | `useState`, controlled input |
| 5 | Search on Enter and on the button, with an immediate request | Forms, events, `fetch`, `async/await` |
| 6 | Add loading, error, and empty states | Conditional rendering |
| 7 | Show the result with `.map()` and a `key` | Lists, keys |
| 8 | Add the debounce by hand: two states (`input` and `query`), an effect with a timer and a cleanup | `useEffect`, cleanup |
| 9 | Add the stale-response guard (an `ignore` flag in the effect cleanup) | Race conditions |
| 10 | Open and close a modal (shadcn `Dialog`) and fill it with ingredients and steps. Use `original` for each ingredient line (OQ-4). | State, composition, nested data |
| 11 | Add the minimum length and no-repeat rules (BR-1) | Small helper logic |

**Part B: Homepage.**

| Step | What you build | Concept |
|---|---|---|
| 12 | Fetch 12 popular recipes on load in one call. Delete the hard-coded card. | `useEffect` on load, async code in an effect |
| 13 | Add the "Show more" button with `offset` | Adding to an array in state, loading state |
| 14 | Prevent duplicates by `id` and hide the button at the end (BR-4, BR-5) | Array methods, sets |
| 15 | Handle a failed or empty homepage response (BR-6) | Error state, hiding a section |
| 16 | Show the homepage again when the search box is cleared (FR-8) | Derived state, conditional rendering |

**Part C: Later steps (not needed for v1 to be complete).**

| Step | What you build | Concept |
|---|---|---|
| 18 | Cache the homepage cards in `localStorage` for the day to save quota | `localStorage`, expiry by date |
| 19 | Replace your debounce with a package and compare the two | Libraries vs hand-written code |

## 15. Refactor Guide

Do not do these in advance. Do each one only when you feel the problem.

| What hurts | The refactor | What you learn |
|---|---|---|
| `App.tsx` is long and the card markup is hard to find | Extract a `RecipeCard` component | Components, props |
| The modal JSX is long, or it needs data from the parent | Extract a `RecipeDetails` component | Parent-child communication |
| The same `fetch` code is written in search, on load, and in "Show more" | Move it into one function in a service file | Single responsibility, reuse |
| The API URL and key appear in several places | Move them to `.env` and one constant | Configuration |
| The debounce effect clutters the component | Extract a `useDebounce` hook | Custom hooks |
| The `Recipe` type is needed in several files | Move it to `types/recipe.ts` | Sharing types |
| Ingredient formatting makes the JSX messy | A small `formatIngredient` function | Pure functions |
| The homepage logic (list, loading, show more) is long | Extract a hook such as `useHomeRecipes` | Hooks that own a feature |

## 16. Definition of Done

- [ ] Search works by typing (debounced) and by Enter or the button.
- [ ] No request is sent for short or repeated text.
- [ ] Loading, error, empty, and too-short states are handled.
- [ ] Overlapping searches never show old results.
- [ ] The homepage shows live recipe cards from the API, not hard-coded recipes.
- [ ] "Show more" adds a new, different card each time.
- [ ] Failed homepage requests are skipped without an error message.
- [ ] The Details modal shows ingredients and steps and closes with Esc.
- [ ] All props and API data are typed, with no `any`.
- [ ] `.env` is not committed.
- [ ] You can explain the state, effects, cleanup, and `async/await` code you wrote.
- [ ] You can explain why each refactor you made was needed.

## 17. Dependencies and Assumptions

| ID | Assumption | Impact if wrong |
|---|---|---|
| AS-1 | A free key works from the browser (CORS allowed). | **Confirmed 2026-11-15.** The app can call the API directly. |
| AS-2 | The API `id` is stable and unique per recipe. | Two different recipes could share a React key. |
| AS-3 | Every search result has all four card fields. | A card would render a broken image or an empty title. |
| AS-5 | 50 points per day is enough for development (roughly 20 page loads plus a few modals per day). | Do step 18 earlier. |

## 18. Out of Scope

- Backend, database, and login
- Favorites, the Favorites page, and React Router (later features)
- Category chips and category filters (later feature)
- Premium features: ingredient search, servings rescaling, nutrition
- Search suggestions (the `autocomplete` endpoint)
- Recent searches and "most searched"
- Automated tests
- Publishing the app

**Possible later versions:** favorites with `localStorage` and a Favorites page (lifting state up and routing), category chips, recent searches, and a rebuild with a backend.
