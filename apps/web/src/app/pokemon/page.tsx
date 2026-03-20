import Link from "next/link";
import { z } from "zod";
import { PokemonSchema } from "@pokemon/schemas";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PokemonTable } from "./pokemon-table";

const PokemonListSchema = z.object({
  pokemons: z.array(
    PokemonSchema.pick({ id: true, identifier: true, name: true, generation: true }),
  ),
  total: z.number(),
});

const PAGE_SIZE = 50;

type Props = {
  searchParams: Promise<{ offset?: string }>;
};

export default async function PokemonPage({ searchParams }: Props) {
  const { offset: offsetStr } = await searchParams;
  const offset = Math.max(0, parseInt(offsetStr ?? "0", 10) || 0);

  const res = await fetch(`${getApiUrl()}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const { pokemons, total } = PokemonListSchema.parse(await res.json());

  const page = Math.floor(offset / PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const prevOffset = offset - PAGE_SIZE;
  const nextOffset = offset + PAGE_SIZE;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pokemon</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total.toLocaleString()} 件</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {page + 1} / {totalPages} ページ
        </p>
      </div>

      <PokemonTable pokemons={pokemons} />

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={offset === 0}
          render={offset > 0 ? <Link href={`/pokemon?offset=${prevOffset}`} /> : undefined}
        >
          前へ
        </Button>
        <span className="text-sm text-muted-foreground">
          {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} 件目
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={nextOffset >= total}
          render={nextOffset < total ? <Link href={`/pokemon?offset=${nextOffset}`} /> : undefined}
        >
          次へ
        </Button>
      </div>
    </main>
  );
}
