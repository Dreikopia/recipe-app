import type { RecipeSummary } from "../types/recipe";

const BASE_URL = "https://api.spoonacular.com";
const KEY = import.meta.env.VITE_SPOONACULAR_KEY;

export async function searchRecipes(query: string): Promise<RecipeSummary[]> {
  const response = await fetch(
    `${BASE_URL}/recipes/complexSearch?query=${encodeURIComponent(query)}&number=10&apiKey=${KEY}`
  );

  if (!response.ok) {
    throw new Error("Request failed");
  }

  const data: { results: RecipeSummary[] } = await response.json();
  return data.results;
}
