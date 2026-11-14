# Product Requirements Document: Recipe App v1

| Field | Value |
|---|---|
| Version | 1.0 (Draft) |
| Date | 2026-11-14 |
| Project | Recipe App (React + TypeScript fundamentals, modeled on BookZilla v1) |
| Stack | Vite, React, TypeScript (TSX), Tailwind CSS, shadcn/ui, React Router (later), API Ninjas Recipe API |
| Status | Draft |

**Tags:** `[REQUIRED]` must be built as written. `[RECOMMENDED]` is a suggestion. `[ASSUMPTION]` is believed true but not confirmed. `[OPEN QUESTION]` is still undecided.

---

## Open Questions Summary

| ID | Question | Why it matters | Suggested default |
|---|---|---|---|
| OQ-1 | Does your free API key return the `nutrition` object? | Calories (step 16) depend on it. | Check the real JSON in step 1. If missing, hide the calorie badge and skip step 16. |
| OQ-2 | Is `nutrition.calories` the total for the whole recipe or per serving? | Decides whether to divide by servings. | Assume it is the whole-recipe total. Verify by roughly adding up the ingredients of one recipe. `[ASSUMPTION]` |
| OQ-3 | What is your monthly request quota? | Each homepage load costs requests. | Check the API Ninjas dashboard before step 12. |
| OQ-4 | How will you display one ingredient line? (names look like "Onion; chopped" and the unit is sometimes the word "unit") | The modal depends on it. | Decide in step 10 and write the rule down before coding it. |
| OQ-5 | Does the API allow requests from the browser (CORS)? | If not, the app cannot call it directly. | Test in step 1. If it fails, stop and re-plan. |

**Defaults used in this version** (you confirmed none of these, so change them freely): 4 cards on the homepage, category chips and favorites are later features, calories are a late step, and cards use a placeholder icon instead of a photo.

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
- **US-6 (later):** As a user, I want to see calories per serving so I can compare recipes.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | The page has a search box and a Search button. | Must |
| FR-2 | Typing triggers a search automatically 600 ms after the user stops typing, if the trimmed text has 3 or more characters (debounce, written by hand). | Must |
| FR-3 | Pressing Enter or clicking Search searches immediately, with no wait, if the trimmed text has 3 or more characters. | Must |
| FR-4 | A search shows loading, error, empty, and result states (section 8). | Must |
| FR-5 | A result is shown as a recipe card with a placeholder icon, title, servings, and ingredient count (for example "13 ingredients"), plus a Details button. | Must |
| FR-6 | Before any search, the homepage loads 4 recipe cards from the API. The dish names come from a list of about 30 names in the code. | Must |
| FR-7 | A "Show more" button below the homepage cards fetches one more recipe, from a dish name not used yet, and adds it as a card. | Must |
| FR-8 | A search replaces the homepage cards with the search result. Clearing the search box brings the homepage cards back without new requests. | Must |
| FR-9 | Clicking Details opens a modal with title, servings, ingredients, and numbered instructions. It makes no extra request. | Must |
| FR-10 | The modal closes with a Close button or the Esc key. | Must |
| FR-11 | A calorie badge ("~N kcal / serving") appears on the card and in the modal when the data is available. Built last. | Could |

## 6. Business Rules

| ID | Rule |
|---|---|
| BR-1 | No request is sent for text under 3 characters (after trimming), and none is sent for the same text as the last search. |
| BR-2 | Enter and the Search button skip the debounce wait but still follow BR-1. |
| BR-3 | A recipe's `id` is its title in lowercase, trimmed, with spaces replaced by `-`. Use it as the React `key`. `[ASSUMPTION]` titles are unique enough. |
| BR-4 | The homepage never shows two cards with the same `id`. |
| BR-5 | A dish name is not reused during one visit (page load). When all names are used, the "Show more" button is hidden. |
| BR-6 | If a homepage request fails or returns an empty array, that card is skipped silently. No error message is shown for homepage cards. |
| BR-7 | If all 4 initial homepage requests fail or return nothing, the homepage cards section is hidden and the search box still works. |
| BR-8 | When two searches overlap, only the results of the latest search are shown (stale responses are ignored). |
| BR-9 | Calories per serving (later) = `nutrition.calories` divided by the number of servings, rounded to a whole number, shown only if OQ-1 and OQ-2 are resolved. |
| BR-10 | The number of servings is the first whole number in the `servings` text. If there is none, the calorie badge is hidden. |
| BR-11 | A missing `nutrition` field is not an error. The badge is simply hidden. |

## 7. Workflows

**A: Browse the homepage.**
1. The user opens the page.
2. The app picks 4 dish names at random from the list and requests each one.
3. Cards appear as the results arrive.

**B: Show more.**
1. The user clicks "Show more". The button is disabled while loading.
2. The app picks an unused dish name and requests it.
3. A new card is added at the end of the list.

**C: Search by typing.**
1. The user types "lentil soup".
2. The user pauses for 600 ms.
3. The app shows "Searching recipes…" and then the result card, replacing the homepage cards.

**D: Search by Enter.** The user types "pancakes" and presses Enter. The search starts immediately.

**E: Details.** The user clicks Details, the modal opens, and the user presses Esc to close it.

**Failure paths:**

- Search request fails: show the error message. The previous results are hidden.
- Homepage request fails: skip that card silently (BR-6).
- Quota used up: search shows the error message. The homepage cards that fail are skipped.

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
| Homepage loading | Show "Loading recipes…" until the first card arrives |
| Show more loading | The button reads "Loading…" and is disabled |
| No more names | The "Show more" button is hidden |
| Recipe with no ingredients | "No ingredients listed." |
| Recipe with no steps | "No instructions listed." |

- **Images:** the API has no photos, so every card uses a placeholder block with an icon. `[RECOMMENDED]`
- **Long titles:** limit to 2 lines on the card.
- **Responsive:** 1 column on mobile, 2 on tablet, 3 to 4 on desktop.
- **Accessibility:** the search input has a label. Icon-only buttons have `aria-label`s. The modal closes with Esc and returns focus to the Details button. The shadcn `Dialog` handles this. `[RECOMMENDED]`
- **shadcn components:** `Button`, `Input`, `Card`, `Dialog`. `[RECOMMENDED]`

## 9. API and Data Requirements

**Request**

| Item | Value |
|---|---|
| Endpoint | `GET https://api.api-ninjas.com/v3/recipe?title=lentil%20soup` |
| Header | `X-Api-Key: <your key>` |
| Response | A JSON array of recipe objects |

**Free-plan limits (from the API Ninjas docs; confirm on your dashboard):**

- One recipe is returned per request.
- `limit`, `offset`, ingredient search, and servings rescaling are premium-only.
- Full nutrition data is described as a premium feature (OQ-1).
- Requests are denied when the monthly quota is used up. You are not charged extra.
- Commercial use is not allowed on the free tier. Keep this a private learning project and do not publish it.

**The `Recipe` type.** You write it yourself in code, after looking at the real JSON:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Built by you from the title (BR-3). The API has no IDs. |
| `title` | string | |
| `servings` | string | Text like "6 servings", not a number |
| `ingredients` | array of objects | Each has `name` (string), `quantity` (number), `unit` (string) |
| `instructions` | array of strings | One string per step |
| `nutrition` | optional object | Contains `calories` and more. Make it optional. |

**Messy data to expect:**

- Ingredient names contain extra notes, like "Onion; chopped".
- The unit is sometimes the literal word "unit".
- Quantities can be decimals.
- A search can return an empty array.

**The dish-name list:** about 30 plain dish names in your code (for example "lentil soup", "pancakes", "chicken curry"). These are search words only. All recipe data comes live from the API.

## 10. Requests and Quota

| User action | Requests |
|---|---|
| Open the homepage | 4 |
| Click "Show more" | 1 |
| A debounced search | 1 per search that passes BR-1 |
| Enter or Search button | 1 |
| Open Details | 0 |
| Clear the search box | 0 |

Every page load costs 4 requests, so refreshing a lot will use your quota. That is accepted in v1. A later improvement is in section 14, step 18.

**Dev-mode note:** in development, React can run an effect twice on load. You may see 8 homepage requests once. This only happens in development. Notice it, and decide later how to prevent it.

## 11. Validation and Error Handling

| Case | Behavior |
|---|---|
| Text is empty or under 3 characters after trimming | No request, show "Type at least 3 characters." |
| Text is over 100 characters | Limit with `maxLength` on the input |
| Same text as the last search | No new request (BR-1) |
| Response is not OK (bad key, quota, bad request) | Search error state; homepage card skipped |
| Network failure | Same as above |
| Empty array | Search empty state; homepage card skipped |
| Overlapping searches | Only the latest results are shown (BR-8) |
| Button clicked while loading | Ignored, because the button is disabled |

## 12. Security

- The API key goes in `.env` as `VITE_API_NINJAS_KEY`. `.env` is added to `.gitignore` and never committed. `[REQUIRED]`
- **Be aware:** anything in a Vite frontend is visible to users in the browser. That is acceptable for a free learning key. In a later backend version, the server will hold the key.

## 13. Acceptance Criteria

| ID | Covers | Criterion |
|---|---|---|
| AC-1 | FR-2, BR-1 | **Given** I type "lentil soup" quickly and pause, **then** exactly one request is sent after about 600 ms. |
| AC-2 | FR-3 | **Given** I type "pancakes" and press Enter, **then** the search starts immediately. |
| AC-3 | BR-1 | **Given** I type only 2 characters or spaces, **then** no request is sent and I see "Type at least 3 characters." |
| AC-4 | FR-4 | **Given** a search is running, **then** I see "Searching recipes…" and the Search button is disabled. |
| AC-5 | FR-4 | **Given** a wrong API key, **when** I search, **then** I see the error message. |
| AC-6 | FR-4 | **Given** a search with no matches, **then** I see the empty message with my text. |
| AC-7 | BR-8 | **Given** two searches in quick succession, **then** the results shown belong to the latest one. |
| AC-8 | FR-5 | **Given** a result, **then** the card shows the title, servings, and ingredient count. |
| AC-9 | FR-6 | **Given** I open the page, **then** I see up to 4 recipe cards without searching. |
| AC-10 | BR-6, BR-7 | **Given** one homepage request fails, **then** the other cards still show and no error message appears. |
| AC-11 | FR-7, BR-4, BR-5 | **Given** the homepage, **when** I click "Show more", **then** one new card with a different recipe is added. |
| AC-12 | FR-7 | **Given** "Show more" is loading, **then** the button is disabled. |
| AC-13 | FR-8 | **Given** I searched, **when** I clear the search box, **then** the homepage cards come back with no new requests. |
| AC-14 | FR-9, FR-10 | **Given** a card, **when** I click Details, **then** a modal shows ingredients and numbered steps. **When** I press Esc, **then** it closes. |
| AC-15 | FR-11, BR-9, BR-10, BR-11 | **Given** a recipe with `nutrition` and a parsable servings text, **then** "~N kcal / serving" shows on the card and in the modal. If either is missing, the badge is hidden and nothing breaks. |
| AC-16 | Section 12 | **Given** the repository, **then** `.env` is ignored by Git. |

## 14. Build Steps

Each step leaves the app working. After each step, explain in your own words why the code works before moving on.

**Part A: Search and details (build this first).**

| Step | What you build | Concept |
|---|---|---|
| 1 | Try the live demo on the API Ninjas recipe page, then get a key and call the API once. Look at the real JSON. Check CORS and whether `nutrition` is present. | Reading real data (OQ-1, OQ-5) |
| 2 | Write the `Recipe` type | TypeScript interfaces |
| 3 | Show one hard-coded recipe card. This is a temporary scaffold that you delete in step 12. | JSX, typed data, props |
| 4 | Add the search input with its text in state | `useState`, controlled input |
| 5 | Search on Enter and on the button, with an immediate request | Forms, events, `fetch`, `async/await` |
| 6 | Add loading, error, and empty states | Conditional rendering |
| 7 | Show the result with `.map()` and a `key` | Lists, keys |
| 8 | Add the debounce by hand: two states (`input` and `query`), an effect with a timer and a cleanup | `useEffect`, cleanup |
| 9 | Add the stale-response guard (an `ignore` flag in the effect cleanup) | Race conditions |
| 10 | Open and close a modal (shadcn `Dialog`) and fill it with ingredients and steps. Decide OQ-4. | State, composition, nested data |
| 11 | Add the minimum length and no-repeat rules (BR-1) | Small helper logic |

**Part B: Homepage.**

| Step | What you build | Concept |
|---|---|---|
| 12 | Write the dish-name list and fetch 4 recipes on load. Delete the hard-coded card. | `useEffect` on load, `Promise.all` |
| 13 | Add the "Show more" button | Adding to an array in state, loading state |
| 14 | Prevent duplicates (BR-4, BR-5) | Array methods, sets |
| 15 | Skip failed or empty requests (BR-6, BR-7) | `Promise.allSettled` |
| 16 | Show the homepage again when the search box is cleared (FR-8) | Derived state, conditional rendering |

**Part C: Later steps (not needed for v1 to be complete).**

| Step | What you build | Concept |
|---|---|---|
| 17 | The calorie badge, per serving, hidden when data is missing | Optional fields, parsing text |
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
| AS-1 | A free key works from the browser (CORS allowed). | The app cannot call the API directly. Re-plan (OQ-5). |
| AS-2 | Recipe titles are unique enough to use as ids. | Two different recipes could be treated as one. |
| AS-3 | A free key returns one recipe per request. | The homepage needs more or fewer requests. |
| AS-4 | `nutrition.calories` is a whole-recipe total (OQ-2). | Per-serving calories would be wrong. |
| AS-5 | The monthly quota is enough for 4 requests per page load during development. | Do step 18 earlier. |

## 18. Out of Scope

- Backend, database, and login
- Favorites, the Favorites page, and React Router (later features)
- Category chips and category filters (later feature)
- Recipe photos
- The separate Nutrition API
- Premium features: `limit`, `offset`, ingredient search, servings rescaling, nutrition filters
- Recent searches and "most searched"
- Automated tests
- Publishing the app

**Possible later versions:** favorites with `localStorage` and a Favorites page (lifting state up and routing), category chips, recent searches, another API with photos, and a rebuild with a backend.
