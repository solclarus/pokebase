import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function padId(id: number): string {
  return id.toString().padStart(4, "0");
}

export function getFormImageUrl(pokemonId: number, formId: string): string {
  const paddedId = padId(pokemonId);
  return formId === "default"
    ? `${process.env.IMAGES_BASE_URL}/normal/${paddedId}.png`
    : `${process.env.IMAGES_BASE_URL}/normal/${paddedId}-${formId}.png`;
}
