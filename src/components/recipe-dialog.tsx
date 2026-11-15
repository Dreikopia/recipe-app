import type { ApiRecipe } from "../types/recipe";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

interface RecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: ApiRecipe | null;
  loading: boolean;
  error: boolean;
}

export function RecipeDialog({ open, onOpenChange, recipe, loading, error }: RecipeDialogProps) {
  const steps = recipe?.analyzedInstructions.flatMap((group) => group.steps) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <div className="pr-8">
          <DialogTitle className="text-xl">
            {recipe?.title ?? "Recipe details"}
          </DialogTitle>
          <DialogDescription>
            {recipe
              ? `${recipe.servings} servings · ${recipe.readyInMinutes} minutes`
              : "Recipe from Spoonacular"}
          </DialogDescription>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading recipe…</p>}
        {error && (
          <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
        )}

        {recipe && (
          <>
            <img
              src={recipe.image}
              alt={recipe.title}
              className="aspect-video w-full rounded-xl object-cover"
            />

            <section>
              <h4 className="text-sm font-semibold">Ingredients</h4>
              {recipe.extendedIngredients.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No ingredients listed.</p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {recipe.extendedIngredients.map((ingredient, index) => (
                    <li key={index}>{ingredient.original}</li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="text-sm font-semibold">Instructions</h4>
              {steps.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No instructions listed.</p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed">{step.step}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
