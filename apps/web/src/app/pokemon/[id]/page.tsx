import Link from "next/link";
import { z } from "zod";
import { PokemonSchema, FormSchema } from "@pokebase/schemas";
import { padId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Stats, Form } from "@pokebase/schemas";

const API_URL = process.env.API_URL || "http://localhost:8787";
const IMAGES_BASE_URL = process.env.IMAGES_BASE_URL || "https://images.pokebase.solclarus.me";

function getFormImageUrl(pokemonId: number, formId: string): string {
  const paddedId = padId(pokemonId);
  return formId === "default"
    ? `${IMAGES_BASE_URL}/normal/${paddedId}.png`
    : `${IMAGES_BASE_URL}/normal/${paddedId}-${formId}.png`;
}

const PokemonDetailSchema = PokemonSchema.extend({
  forms: z.array(FormSchema),
});

const CATEGORY_LABELS: Record<string, string> = {
  normal: "ノーマル",
  legendary: "伝説",
  mythical: "幻",
  "ultra-beast": "UB",
  paradox: "パラドックス",
};

const STAT_KEYS: (keyof Stats)[] = ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"];

const STAT_LABELS: Record<keyof Stats, string> = {
  hp: "HP",
  attack: "こうげき",
  defense: "ぼうぎょ",
  sp_attack: "とくこう",
  sp_defense: "とくぼう",
  speed: "すばやさ",
};

const STAT_COLORS: Record<keyof Stats, string> = {
  hp: "bg-red-400",
  attack: "bg-orange-400",
  defense: "bg-yellow-400",
  sp_attack: "bg-blue-400",
  sp_defense: "bg-green-400",
  speed: "bg-pink-400",
};

function TypeBadge({ type }: { type: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${IMAGES_BASE_URL}/types/${type}.png`}
      alt={type}
      width={32}
      height={14}
      className="object-contain"
    />
  );
}

function StatBar({ statKey, value }: { statKey: keyof Stats; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
        {STAT_LABELS[statKey]}
      </span>
      <span className="w-8 shrink-0 text-right font-mono text-sm font-medium">{value}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${STAT_COLORS[statKey]}`}
          style={{ width: `${Math.round((value / 255) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function FormCard({ form, pokemonId }: { form: Form; pokemonId: number }) {
  const total = Object.values(form.stats).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getFormImageUrl(pokemonId, form.id)}
            alt={form.name.en}
            width={64}
            height={64}
            className="object-contain"
          />
          <div>
            <p className="font-semibold">{form.name.ja}</p>
            <p className="text-sm text-muted-foreground">{form.name.en}</p>
          </div>
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

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PokemonDetailPage({ params }: Props) {
  const { id } = await params;

  const res = await fetch(`${API_URL}/pokemon/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const pokemon = PokemonDetailSchema.parse(await res.json());

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 pb-12 pt-8">
      <div>
        <Link
          href="/pokemon"
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

      <section>
        <h2 className="mb-3 text-lg font-semibold">フォーム</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pokemon.forms.map((form) => (
            <FormCard key={form.id} form={form} pokemonId={pokemon.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
