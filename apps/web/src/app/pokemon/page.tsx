import { z } from "zod";
import { PokemonSchema } from "@pokebase/schemas";
import { PokemonTable } from "./pokemon-table";

const PokemonListSchema = z.object({
  pokemons: z.array(
    PokemonSchema.pick({ id: true, identifier: true, name: true, generation: true }),
  ),
  total: z.number(),
});

export default async function PokemonPage() {
  const res = await fetch(`${process.env.API_URL}/pokemon`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const { pokemons, total } = PokemonListSchema.parse(await res.json());

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pokemon</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total.toLocaleString()} 件</p>
      </div>

      <PokemonTable pokemons={pokemons} />
    </main>
  );
}
