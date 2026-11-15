import type { ApiRecipe, RecipeSummary } from "../types/recipe";

const BASE_URL = "https://api.spoonacular.com";
const KEY = import.meta.env.VITE_SPOONACULAR_KEY;

export interface RecipePage {
  results: RecipeSummary[];
  totalResults: number;
}

async function get<T>(path: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${BASE_URL}${path}${separator}apiKey=${KEY}`);

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
}

export function searchRecipes(query: string) {
  return get<RecipePage>(
    `/recipes/complexSearch?query=${encodeURIComponent(query)}&number=12`
  );
}

export function popularRecipes(offset: number) {
  return get<RecipePage>(`/recipes/complexSearch?sort=popularity&number=12&offset=${offset}`);
}

export async function recipeDetails(id: number) {
  const [recipe] = await get<ApiRecipe[]>(`/recipes/informationBulk?ids=${id}`);

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  return recipe;
}
