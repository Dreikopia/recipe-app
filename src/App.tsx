import { useEffect, useState, type FormEvent } from "react";
import type { ApiRecipe, RecipeSummary } from "./types/recipe";
import { popularRecipes, recipeDetails, searchRecipes } from "./lib/spoonacular";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { RecipeCard } from "./components/recipe-card";
import { RecipeDialog } from "./components/recipe-dialog";

const App = () => {

  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<RecipeSummary[]>([]);
  const [resultQuery, setResultQuery] = useState("");
  const [errorQuery, setErrorQuery] = useState("");

  const [home, setHome] = useState<RecipeSummary[]>([]);
  const [homeTotal, setHomeTotal] = useState(0);
  const [homeStatus, setHomeStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [moreLoading, setMoreLoading] = useState(false);

  const [openId, setOpenId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, ApiRecipe>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [detailsError, setDetailsError] = useState(false);

  const trimmed = input.trim();
  const searching = query !== "" && query !== resultQuery && query !== errorQuery;
  const failed = query !== "" && query === errorQuery;
  const empty = query !== "" && query === resultQuery && results.length === 0;
  const showHome = query === "";

  useEffect(() => {
    let ignored = false;

    popularRecipes(0)
      .then((page) => {
        if (ignored) return;
        setHome(page.results);
        setHomeTotal(page.totalResults);
        setHomeStatus("ready");
      })
      .catch(() => {
        if (!ignored) setHomeStatus("failed");
      });

    return () => {
      ignored = true;
    };
  }, []);

  useEffect(() => {
    const next = input.trim();
    if (next.length < 3) return;

    const timer = setTimeout(() => setQuery(next), 600);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!query) return;

    let ignored = false;

    searchRecipes(query)
      .then((page) => {
        if (ignored) return;
        setResults(page.results);
        setResultQuery(query);
      })
      .catch(() => {
        if (!ignored) setErrorQuery(query);
      });

    return () => {
      ignored = true;
    };
  }, [query]);

  function changeInput(value: string) {
    setInput(value);
    if (value.trim().length < 3) setQuery("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmed.length >= 3) setQuery(trimmed);
  }

  function showMore() {
    setMoreLoading(true);

    popularRecipes(home.length)
      .then((page) => {
        setHome((current) => {
          const seen = new Set(current.map((recipe) => recipe.id));
          return [...current, ...page.results.filter((recipe) => !seen.has(recipe.id))];
        });
        setHomeTotal(page.totalResults);
      })
      .catch(() => {
        // BR-6: homepage failures stay silent
      })
      .finally(() => setMoreLoading(false));
  }

  function openDetails(id: number) {
    setOpenId(id);
    setDetailsError(false);

    if (details[id]) return;

    setLoadingId(id);

    recipeDetails(id)
      .then((recipe) => {
        setDetails((current) => ({ ...current, [id]: recipe }));
      })
      .catch(() => setDetailsError(true))
      .finally(() => setLoadingId((current) => (current === id ? null : current)));
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Recipe App</h1>
        <p className="text-sm text-muted-foreground">Simple, live recipes for everyday cooking</p>
      </header>

      <form onSubmit={submit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(event) => changeInput(event.target.value)}
          aria-label="Search recipes"
          placeholder="Search recipes"
          maxLength={100}
          className="h-11 flex-1 text-base"
        />
        <Button type="submit" className="h-11 px-4" disabled={trimmed.length < 3}>
          Search
        </Button>
      </form>

      {trimmed.length > 0 && trimmed.length < 3 && (
        <p className="mt-1 text-xs text-muted-foreground">Type at least 3 characters.</p>
      )}

      <div className="mt-6">
        {searching && <p className="text-sm text-muted-foreground">Searching recipes…</p>}
        {failed && (
          <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
        )}
        {empty && !failed && (
          <p className="text-sm text-muted-foreground">
            No recipes found for “{query}”. Try a different word.
          </p>
        )}

        {showHome ? (
          homeStatus === "loading" ? (
            <p className="text-sm text-muted-foreground">Loading recipes…</p>
          ) : homeStatus === "ready" ? (
            <>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">Popular picks</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {home.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onDetails={() => openDetails(recipe.id)}
                  />
                ))}
              </div>
              {home.length < homeTotal && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" onClick={showMore} disabled={moreLoading}>
                    {moreLoading ? "Loading…" : "Show more"}
                  </Button>
                </div>
              )}
            </>
          ) : null
        ) : (
          !failed && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onDetails={() => openDetails(recipe.id)}
                />
              ))}
            </div>
          )
        )}
      </div>

      <RecipeDialog
        open={openId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenId(null);
            setDetailsError(false);
          }
        }}
        recipe={openId === null ? null : (details[openId] ?? null)}
        loading={openId !== null && loadingId === openId}
        error={detailsError}
      />
    </main>
  );
};

export default App;
