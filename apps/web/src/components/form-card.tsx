import Link from "next/link";
import { PokemonImage } from "./pokemon-image";
import { cn, getFormImageUrl } from "@/lib/utils";

type Props = {
  pokemonId: number;
  formId: string;
  name: { ja: string; en: string };
  href?: string;
  size?: number;
  className?: string;
  tooltip?: React.ReactNode;
  children?: React.ReactNode;
};

export function FormCard({
  pokemonId,
  formId,
  name,
  href,
  size = 80,
  className,
  tooltip,
  children,
}: Props) {
  const baseClass = cn(
    "relative flex flex-col items-center gap-2 rounded-xl border bg-card p-4",
    tooltip && "group",
    className,
  );

  const content = (
    <>
      {tooltip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md group-hover:block">
          {tooltip}
        </div>
      )}
      <PokemonImage
        src={getFormImageUrl(pokemonId, formId)}
        alt={name.en}
        width={size}
        height={size}
        className="object-contain"
      />
      {!tooltip && (
        <div className="text-center">
          <p className="text-sm font-semibold">{name.ja}</p>
        </div>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
