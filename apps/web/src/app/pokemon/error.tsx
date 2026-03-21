"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PokemonError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">データの取得に失敗しました</p>
        <Button variant="outline" size="sm" onClick={reset}>
          再試行
        </Button>
      </div>
    </main>
  );
}
