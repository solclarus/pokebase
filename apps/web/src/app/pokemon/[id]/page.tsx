import Link from "next/link";
import { z } from "zod";
import { PokemonSchema, FormSchema } from "@pokebase/schemas";
import { padId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Form } from "@pokebase/schemas";

function getFormImageUrl(pokemonId: number, formId: string): string {
  const paddedId = padId(pokemonId);
  return formId === "default"
    ? `${process.env.IMAGES_BASE_URL}/normal/${paddedId}.png`
    : `${process.env.IMAGES_BASE_URL}/normal/${paddedId}-${formId}.png`;
}

const PokemonDetailSchema = PokemonSchema.extend({
  forms: z.array(FormSchema),
});

function TypeBadge({ type }: { type: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${process.env.IMAGES_BASE_URL}/types/${type}.png`}
      alt={type}
      width={32}
      height={14}
      className="object-contain"
    />
  );
}

function FormCard({ form, pokemonId }: { form: Form; pokemonId: number }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getFormImageUrl(pokemonId, form.id)}
        alt={form.name.en}
        width={80}
        height={80}
        className="object-contain"
      />
      <div className="text-center">
        <p className="text-sm font-semibold">{form.name.ja}</p>
        <p className="text-xs text-muted-foreground">{form.name.en}</p>
      </div>
      <div className="flex gap-1">
        {form.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </div>
  );
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PokemonDetailPage({ params }: Props) {
  const { id } = await params;

  const res = await fetch(`${process.env.API_URL}/pokemon/${id}`, { cache: "no-store" });
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
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">フォーム</h2>
        <div className="flex flex-wrap gap-3">
          {pokemon.forms.map((form) => (
            <FormCard key={form.id} form={form} pokemonId={pokemon.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
