import type { RecipeSummary } from "../types/recipe";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";

interface RecipeCardProps {
  recipe: RecipeSummary;
  onDetails: () => void;
}

export function RecipeCard({ recipe, onDetails }: RecipeCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm">
      <img
        src={recipe.image}
        alt={recipe.title}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover"
      />
      <CardContent className="px-4 pt-4">
        <CardTitle className="line-clamp-2 min-h-14 text-lg">{recipe.title}</CardTitle>
      </CardContent>
      <CardFooter className="px-4 pt-0 pb-4">
        <Button variant="outline" className="w-full" onClick={onDetails}>
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}
