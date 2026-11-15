export interface RecipeSummary {
  id: number;
  title: string;
  image: string;
}

export interface ApiRecipe extends RecipeSummary {
  servings: number;
  readyInMinutes: number;
  extendedIngredients: { name: string; amount: number; unit: string; original: string }[];
  analyzedInstructions: { steps: { number: number; step: string }[] }[];
}
