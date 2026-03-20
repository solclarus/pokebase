import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { getApiUrl } from "#/lib/api";
import { padId } from "#/lib/utils";
import { Badge } from "#/components/ui/badge";

// Schemas
const StatsSchema = z.object({
  hp: z.number(),
  attack: z.number(),
  defense: z.number(),
  sp_attack: z.number(),
  sp_defense: z.number(),
  speed: z.number(),
});

const FormSchema = z.object({
  id: z.string(),
  order: z.number(),
  name: z.object({ ja: z.string(), en: z.string() }),
  form_type: z.enum(["normal", "mega", "gigantamax"]),
  region: z.string(),
  types: z.array(z.string()),
  stats: StatsSchema,
  ability_ids: z.array(z.number()),
  hidden_ability_id: z.number().optional(),
});

const PokemonDetailSchema = z.object({
  id: z.number(),
  identifier: z.string(),
  name: z.object({ ja: z.string(), en: z.string() }),
  generation: z.number(),
  category: z.enum(["normal", "legendary", "mythical", "ultra-beast", "paradox"]),
  forms: z.array(FormSchema),
  availability: z.array(
    z.object({
      game_id: z.string(),
      availability_type: z.enum(["wild", "trade", "event", "transfer", "gift", "breed"]),
      notes: z.string().optional(),
    }),
  ),
});

type Form = z.infer<typeof FormSchema>;

export const Route = createFileRoute("/pokemon/$id")({
  loader: async ({ params: { id } }) => {
    const res = await fetch(`${getApiUrl()}/pokemon/${id}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return PokemonDetailSchema.parse(await res.json());
  },
  component: PokemonDetailPage,
});

// Constants
const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  fire: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  water: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  grass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  electric: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  ice: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  fighting: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  poison: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  ground: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  flying: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  psychic: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  bug: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  rock: "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300",
  ghost: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  dragon: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  dark: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  steel: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  fairy: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const CATEGORY_LABELS: Record<string, string> = {
  normal: "ノーマル",
  legendary: "伝説",
  mythical: "幻",
  "ultra-beast": "UB",
  paradox: "パラドックス",
};

const STAT_KEYS = ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"] as const;

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "こうげき",
  defense: "ぼうぎょ",
  sp_attack: "とくこう",
  sp_defense: "とくぼう",
  speed: "すばやさ",
};

const STAT_COLORS: Record<string, string> = {
  hp: "bg-red-400",
  attack: "bg-orange-400",
  defense: "bg-yellow-400",
  sp_attack: "bg-blue-400",
  sp_defense: "bg-green-400",
  speed: "bg-pink-400",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  wild: "野生",
  trade: "トレード",
  event: "イベント",
  transfer: "転送",
  gift: "贈り物",
  breed: "育て屋",
};

// Sub-components
function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? "bg-gray-100 text-gray-700"}`}
    >
      {type}
    </span>
  );
}

function StatBar({ statKey, value }: { statKey: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
        {STAT_LABELS[statKey] ?? statKey}
      </span>
      <span className="w-8 shrink-0 text-right font-mono text-sm font-medium">{value}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${STAT_COLORS[statKey] ?? "bg-gray-400"}`}
          style={{ width: `${Math.round((value / 255) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function FormCard({ form }: { form: Form }) {
  const total = Object.values(form.stats).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{form.name.ja}</p>
          <p className="text-sm text-muted-foreground">{form.name.en}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {form.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {STAT_KEYS.map((key) => (
          <StatBar key={key} statKey={key} value={form.stats[key]} />
        ))}
        <div className="flex items-center gap-3 border-t pt-2">
          <span className="w-16 text-right text-xs text-muted-foreground">合計</span>
          <span className="w-8 text-right font-mono text-sm font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
}

// Page
function PokemonDetailPage() {
  const pokemon = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 pb-12 pt-8">
      {/* Header */}
      <div>
        <Link
          to="/pokemon"
          search={{ offset: 0 }}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← 一覧へ戻る
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold">{pokemon.name.ja}</h1>
              <span className="text-xl text-muted-foreground">{pokemon.name.en}</span>
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">#{padId(pokemon.id)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline">Gen {pokemon.generation}</Badge>
            <Badge variant="secondary">
              {CATEGORY_LABELS[pokemon.category] ?? pokemon.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Forms */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">フォーム</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pokemon.forms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      </section>

      {/* Availability */}
      {pokemon.availability.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">出現ゲーム</h2>
          <div className="divide-y rounded-xl border bg-card">
            {pokemon.availability.map((entry) => (
              <div key={entry.game_id} className="flex items-center justify-between px-4 py-3">
                <span className="font-mono text-sm">{entry.game_id}</span>
                <div className="flex items-center gap-3">
                  {entry.notes && (
                    <span className="text-sm text-muted-foreground">{entry.notes}</span>
                  )}
                  <Badge variant="outline">
                    {AVAILABILITY_LABELS[entry.availability_type] ?? entry.availability_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
