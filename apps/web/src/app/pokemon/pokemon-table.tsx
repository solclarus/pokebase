"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Pokemon } from "@pokebase/schemas";
import { padId } from "@/lib/utils";

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

type PokemonListItem = Pick<Pokemon, "id" | "identifier" | "name" | "generation">;

export function PokemonTable({ pokemons }: { pokemons: PokemonListItem[] }) {
  const router = useRouter();

  return (
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
              onClick={() => router.push(`/pokemon/${p.id}`)}
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
  );
}
