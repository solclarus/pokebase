import { Link } from "@tanstack/react-router";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 px-4 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 py-3">
        <Link
          to="/pokemon"
          search={{ offset: 0 }}
          className="text-sm font-bold text-foreground no-underline"
        >
          Pokemon Dashboard
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            to="/pokemon"
            search={{ offset: 0 }}
            className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
            activeProps={{ className: "active" }}
          >
            Pokemon
          </Link>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
