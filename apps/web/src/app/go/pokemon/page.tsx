import Link from "next/link";
import { z } from "zod";
import { GoPokemonTable } from "./go-pokemon-table";

const GoFormSchema = z.object({
  form_id: z.string(),
  image_url: z.string(),
  released_at: z.string().nullable(),
});

const GoPokemonListSchema = z.object({
  pokemons: z.array(
    z.object({
      pokemon_id: z.number(),
      identifier: z.string(),
      name: z.object({ ja: z.string(), en: z.string() }),
      generation: z.number(),
      forms: z.array(GoFormSchema),
    }),
  ),
  total: z.number(),
});

export default async function GoPokemonPage() {
  const res = await fetch(`${process.env.API_URL}/go/pokemon?limit=100`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const { pokemons, total } = GoPokemonListSchema.parse(await res.json());

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pokémon GO</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total.toLocaleString()} 件</p>
        </div>
        <Link
          href="/go/pokemon/history"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          実装履歴 →
        </Link>
      </div>

      <GoPokemonTable pokemons={pokemons} />
    </main>
  );
}
