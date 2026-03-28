import Link from "next/link";
import { z } from "zod";
import { padId } from "@/lib/utils";
import { FormCard } from "@/components/form-card";

const GoPokemonListSchema = z.object({
  pokemons: z.array(
    z.object({
      pokemon_id: z.number(),
      identifier: z.string(),
      name: z.object({ ja: z.string(), en: z.string() }),
      generation: z.number(),
      forms: z.array(
        z.object({
          form_id: z.string(),
          form_name: z.object({ ja: z.string(), en: z.string() }),
          released_at: z.string().nullable(),
        }),
      ),
    }),
  ),
  total: z.number(),
});

async function fetchAllGoPokemons() {
  const first = await fetch(`${process.env.API_URL}/go/pokemon?limit=100&offset=0`, {
    cache: "no-store",
  });
  if (!first.ok) throw new Error(`API error: ${first.status}`);
  const firstPage = GoPokemonListSchema.parse(await first.json());

  if (firstPage.total <= 100) return firstPage.pokemons;

  const pageCount = Math.ceil((firstPage.total - 100) / 100);
  const rest = await Promise.all(
    Array.from({ length: pageCount }, (_, i) =>
      fetch(`${process.env.API_URL}/go/pokemon?limit=100&offset=${(i + 1) * 100}`, {
        cache: "no-store",
      })
        .then((r) => r.json())
        .then((d) => GoPokemonListSchema.parse(d).pokemons),
    ),
  );

  return [...firstPage.pokemons, ...rest.flat()];
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${parseInt(month)}月${parseInt(day)}日`;
}

export default async function GoHistoryPage() {
  const all = await fetchAllGoPokemons();

  // リリース済みフォームをフラット化して日付降順にソート
  const entries = all
    .flatMap((p) =>
      p.forms
        .filter((f) => f.released_at !== null)
        .map((f) => ({
          pokemon_id: p.pokemon_id,
          identifier: p.identifier,
          name: p.name,
          form_name: f.form_name,
          released_at: f.released_at as string,
          form_id: f.form_id,
        })),
    )
    .sort((a, b) => b.released_at.localeCompare(a.released_at));

  // 日付ごとにグループ化
  const byDate = new Map<string, typeof entries>();
  for (const entry of entries) {
    if (!byDate.has(entry.released_at)) byDate.set(entry.released_at, []);
    byDate.get(entry.released_at)!.push(entry);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <div className="mb-6">
        <Link
          href="/go/pokemon"
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← 一覧へ戻る
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Pokémon GO 実装履歴</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {entries.length.toLocaleString()} フォーム
        </p>
      </div>

      <div className="space-y-8">
        {Array.from(byDate.entries()).map(([date, items]) => (
          <section key={date}>
            <h2 className="mb-3 text-base font-semibold text-muted-foreground">
              {formatDate(date)}
            </h2>
            <div className="flex flex-wrap gap-3">
              {items.map((item) => (
                <FormCard
                  key={`${item.pokemon_id}-${item.form_id}`}
                  pokemonId={item.pokemon_id}
                  formId={item.form_id}
                  name={item.name}
                  href={`/pokemon/${item.pokemon_id}`}
                  size={64}
                  className="hover:bg-muted/50 transition-colors w-20 p-3 gap-1"
                  tooltip={
                    <div className="space-y-0.5">
                      <p className="font-medium">{item.form_name.ja}</p>
                      <p className="text-muted-foreground">#{padId(item.pokemon_id)}</p>
                    </div>
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
