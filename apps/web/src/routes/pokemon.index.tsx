import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getApiUrl } from "#/lib/api";
import { padId } from "#/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Button } from "#/components/ui/button";

const PokemonListItemSchema = z.object({
  id: z.number(),
  identifier: z.string(),
  name: z.object({ ja: z.string(), en: z.string() }),
  generation: z.number(),
});

const PokemonListSchema = z.object({
  pokemons: z.array(PokemonListItemSchema),
  total: z.number(),
});

const searchSchema = z.object({
  offset: z.number().int().nonnegative().catch(0),
});

const PAGE_SIZE = 50;

export const Route = createFileRoute("/pokemon/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ offset: search.offset }),
  loader: async ({ deps: { offset } }) => {
    const res = await fetch(`${getApiUrl()}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return PokemonListSchema.parse(await res.json());
  },
  component: PokemonPage,
});

const GENERATION_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  3: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  4: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  5: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  6: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  7: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  8: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  9: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
};

function PokemonPage() {
  const { pokemons, total } = Route.useLoaderData();
  const { offset } = Route.useSearch();
  const navigate = Route.useNavigate();

  const page = Math.floor(offset / PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goTo = (newOffset: number) =>
    navigate({ search: (prev) => ({ ...prev, offset: newOffset }) });

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

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead>名前（日本語）</TableHead>
              <TableHead>名前（英語）</TableHead>
              <TableHead className="w-24 text-center">世代</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pokemons.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => navigate({ to: "/pokemon/$id", params: { id: String(p.id) } })}
              >
                <TableCell className="text-center font-mono text-muted-foreground">
                  {padId(p.id)}
                </TableCell>
                <TableCell>{p.name.ja}</TableCell>
                <TableCell>{p.name.en}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${GENERATION_COLORS[p.generation] ?? ""}`}
                  >
                    Gen {p.generation}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={offset === 0}
          onClick={() => goTo(offset - PAGE_SIZE)}
        >
          前へ
        </Button>
        <span className="text-sm text-muted-foreground">
          {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} 件目
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={offset + PAGE_SIZE >= total}
          onClick={() => goTo(offset + PAGE_SIZE)}
        >
          次へ
        </Button>
      </div>
    </main>
  );
}
