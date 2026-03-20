/**
 * Add missing forms to core/forms/ and go/forms/ using PokeAPI.
 * Each entry specifies: pokemon_id, form_id, and PokeAPI identifier.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dirname, "../data");
const CORE_FORMS_DIR = join(DATA_DIR, "core/forms");
const GO_FORMS_DIR = join(DATA_DIR, "go/forms");

function padId(id: number): string {
  return id.toString().padStart(4, "0");
}

type FormEntry = {
  pokemon_id: number;
  form_id: string;
  pokeapi_id: string; // PokeAPI pokemon identifier
};

// Forms to add: [pokemon_id, form_id, pokeapi_identifier]
const FORMS_TO_ADD: FormEntry[] = [
  // Alolan forms
  { pokemon_id: 19,  form_id: "alola",        pokeapi_id: "rattata-alola" },
  { pokemon_id: 20,  form_id: "alola",        pokeapi_id: "raticate-alola" },
  { pokemon_id: 50,  form_id: "alola",        pokeapi_id: "diglett-alola" },
  { pokemon_id: 51,  form_id: "alola",        pokeapi_id: "dugtrio-alola" },

  // Paldean Tauros
  { pokemon_id: 128, form_id: "paldea-combat", pokeapi_id: "tauros-paldea-combat-breed" },
  { pokemon_id: 128, form_id: "paldea-blaze",  pokeapi_id: "tauros-paldea-blaze-breed" },
  { pokemon_id: 128, form_id: "paldea-aqua",   pokeapi_id: "tauros-paldea-aqua-breed" },

  // Burmy (different types)
  { pokemon_id: 412, form_id: "plant", pokeapi_id: "burmy-plant" },
  { pokemon_id: 412, form_id: "sandy", pokeapi_id: "burmy-sandy" },
  { pokemon_id: 412, form_id: "trash", pokeapi_id: "burmy-trash" },

  // Cherrim
  { pokemon_id: 421, form_id: "overcast",  pokeapi_id: "cherrim-overcast" },
  { pokemon_id: 421, form_id: "sunshine",  pokeapi_id: "cherrim-sunshine" },

  // Shellos / Gastrodon
  { pokemon_id: 422, form_id: "east", pokeapi_id: "shellos-east" },
  { pokemon_id: 422, form_id: "west", pokeapi_id: "shellos-west" },
  { pokemon_id: 423, form_id: "east", pokeapi_id: "gastrodon-east" },
  { pokemon_id: 423, form_id: "west", pokeapi_id: "gastrodon-west" },

  // Deerling / Sawsbuck seasons
  { pokemon_id: 585, form_id: "spring", pokeapi_id: "deerling-spring" },
  { pokemon_id: 585, form_id: "summer", pokeapi_id: "deerling-summer" },
  { pokemon_id: 585, form_id: "autumn", pokeapi_id: "deerling-autumn" },
  { pokemon_id: 585, form_id: "winter", pokeapi_id: "deerling-winter" },
  { pokemon_id: 586, form_id: "spring", pokeapi_id: "sawsbuck-spring" },
  { pokemon_id: 586, form_id: "summer", pokeapi_id: "sawsbuck-summer" },
  { pokemon_id: 586, form_id: "autumn", pokeapi_id: "sawsbuck-autumn" },
  { pokemon_id: 586, form_id: "winter", pokeapi_id: "sawsbuck-winter" },

  // Genesect drives
  { pokemon_id: 649, form_id: "douse", pokeapi_id: "genesect-douse" },
  { pokemon_id: 649, form_id: "shock", pokeapi_id: "genesect-shock" },
  { pokemon_id: 649, form_id: "burn",  pokeapi_id: "genesect-burn" },
  { pokemon_id: 649, form_id: "chill", pokeapi_id: "genesect-chill" },

  // Vivillon patterns (all same stats/types)
  { pokemon_id: 666, form_id: "icy-snow",    pokeapi_id: "vivillon-icy-snow" },
  { pokemon_id: 666, form_id: "polar",        pokeapi_id: "vivillon-polar" },
  { pokemon_id: 666, form_id: "tundra",       pokeapi_id: "vivillon-tundra" },
  { pokemon_id: 666, form_id: "continental",  pokeapi_id: "vivillon-continental" },
  { pokemon_id: 666, form_id: "garden",       pokeapi_id: "vivillon-garden" },
  { pokemon_id: 666, form_id: "elegant",      pokeapi_id: "vivillon-elegant" },
  { pokemon_id: 666, form_id: "meadow",       pokeapi_id: "vivillon-meadow" },
  { pokemon_id: 666, form_id: "modern",       pokeapi_id: "vivillon-modern" },
  { pokemon_id: 666, form_id: "marine",       pokeapi_id: "vivillon-marine" },
  { pokemon_id: 666, form_id: "archipelago",  pokeapi_id: "vivillon-archipelago" },
  { pokemon_id: 666, form_id: "high-plains",  pokeapi_id: "vivillon-high-plains" },
  { pokemon_id: 666, form_id: "sandstorm",    pokeapi_id: "vivillon-sandstorm" },
  { pokemon_id: 666, form_id: "river",        pokeapi_id: "vivillon-river" },
  { pokemon_id: 666, form_id: "monsoon",      pokeapi_id: "vivillon-monsoon" },
  { pokemon_id: 666, form_id: "savanna",      pokeapi_id: "vivillon-savanna" },
  { pokemon_id: 666, form_id: "sun",          pokeapi_id: "vivillon-sun" },
  { pokemon_id: 666, form_id: "ocean",        pokeapi_id: "vivillon-ocean" },
  { pokemon_id: 666, form_id: "jungle",       pokeapi_id: "vivillon-jungle" },
  { pokemon_id: 666, form_id: "fancy",        pokeapi_id: "vivillon-fancy" },
  { pokemon_id: 666, form_id: "poke-ball",    pokeapi_id: "vivillon-poke-ball" },

  // Flabébé / Floette / Florges colors
  { pokemon_id: 669, form_id: "red",    pokeapi_id: "flabebe-red" },
  { pokemon_id: 669, form_id: "yellow", pokeapi_id: "flabebe-yellow" },
  { pokemon_id: 669, form_id: "orange", pokeapi_id: "flabebe-orange" },
  { pokemon_id: 669, form_id: "blue",   pokeapi_id: "flabebe-blue" },
  { pokemon_id: 669, form_id: "white",  pokeapi_id: "flabebe-white" },
  { pokemon_id: 670, form_id: "red",    pokeapi_id: "floette-red" },
  { pokemon_id: 670, form_id: "yellow", pokeapi_id: "floette-yellow" },
  { pokemon_id: 670, form_id: "orange", pokeapi_id: "floette-orange" },
  { pokemon_id: 670, form_id: "blue",   pokeapi_id: "floette-blue" },
  { pokemon_id: 670, form_id: "white",  pokeapi_id: "floette-white" },
  { pokemon_id: 671, form_id: "red",    pokeapi_id: "florges-red" },
  { pokemon_id: 671, form_id: "yellow", pokeapi_id: "florges-yellow" },
  { pokemon_id: 671, form_id: "orange", pokeapi_id: "florges-orange" },
  { pokemon_id: 671, form_id: "blue",   pokeapi_id: "florges-blue" },
  { pokemon_id: 671, form_id: "white",  pokeapi_id: "florges-white" },

  // Furfrou styles
  { pokemon_id: 676, form_id: "heart",     pokeapi_id: "furfrou-heart" },
  { pokemon_id: 676, form_id: "star",      pokeapi_id: "furfrou-star" },
  { pokemon_id: 676, form_id: "diamond",   pokeapi_id: "furfrou-diamond" },
  { pokemon_id: 676, form_id: "debutante", pokeapi_id: "furfrou-debutante" },
  { pokemon_id: 676, form_id: "matron",    pokeapi_id: "furfrou-matron" },
  { pokemon_id: 676, form_id: "dandy",     pokeapi_id: "furfrou-dandy" },
  { pokemon_id: 676, form_id: "la-reine",  pokeapi_id: "furfrou-la-reine" },
  { pokemon_id: 676, form_id: "kabuki",    pokeapi_id: "furfrou-kabuki" },
  { pokemon_id: 676, form_id: "pharaoh",   pokeapi_id: "furfrou-pharaoh" },
  { pokemon_id: 676, form_id: "natural",   pokeapi_id: "furfrou-natural" },

  // Xerneas active
  { pokemon_id: 716, form_id: "active", pokeapi_id: "xerneas-active" },

  // Sinistea / Polteageist antique
  { pokemon_id: 854, form_id: "antique", pokeapi_id: "sinistea-antique" },
  { pokemon_id: 855, form_id: "antique", pokeapi_id: "polteageist-antique" },

  // Okidogi / Sinistcha
  { pokemon_id: 1012, form_id: "counterfeit", pokeapi_id: "okidogi-counterfeit" },
  { pokemon_id: 1012, form_id: "artisan",     pokeapi_id: "okidogi-artisan" },
  { pokemon_id: 1013, form_id: "unremarkable", pokeapi_id: "sinistcha-unremarkable" },
  { pokemon_id: 1013, form_id: "masterpiece", pokeapi_id: "sinistcha-masterpiece" },
];

type PokeApiPokemon = {
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  types: Array<{ type: { name: string } }>;
  abilities: Array<{ ability: { name: string; url: string }; is_hidden: boolean }>;
};

type PokeApiAbility = {
  id: number;
};

async function fetchPokeApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokeAPI error ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

async function getAbilityId(url: string): Promise<number> {
  const data = await fetchPokeApi<PokeApiAbility>(url);
  return data.id;
}

function statName(name: string): string {
  const map: Record<string, string> = {
    hp: "hp",
    attack: "attack",
    defense: "defense",
    "special-attack": "sp_attack",
    "special-defense": "sp_defense",
    speed: "speed",
  };
  return map[name] ?? name;
}

async function main() {
  // Group by pokemon_id
  const byPokemon = new Map<number, FormEntry[]>();
  for (const entry of FORMS_TO_ADD) {
    const list = byPokemon.get(entry.pokemon_id) ?? [];
    list.push(entry);
    byPokemon.set(entry.pokemon_id, list);
  }

  let coreUpdated = 0;
  let goUpdated = 0;
  const errors: string[] = [];

  for (const [pokemonId, entries] of byPokemon) {
    const coreFormsPath = join(CORE_FORMS_DIR, `${padId(pokemonId)}.json`);
    const goFormsPath = join(GO_FORMS_DIR, `${padId(pokemonId)}.json`);

    const coreData = JSON.parse(await readFile(coreFormsPath, "utf-8"));
    const goData = JSON.parse(await readFile(goFormsPath, "utf-8"));

    // Use existing default form as template for name/order
    const defaultForm = coreData.forms[0];

    for (const entry of entries) {
      // Skip if already exists
      if (coreData.forms.find((f: { id: string }) => f.id === entry.form_id)) {
        console.log(`  SKIP ${padId(pokemonId)} ${entry.form_id} (already exists)`);
        continue;
      }

      process.stdout.write(`  Fetching ${entry.pokeapi_id}...`);

      try {
        // Try PokeAPI; fall back to base form if 404 (cosmetic forms share stats/types)
        let types: string[] = defaultForm.types;
        let stats: Record<string, number> = defaultForm.stats;
        let abilityIds: number[] = defaultForm.ability_ids;
        let hiddenAbilityId: number | undefined = defaultForm.hidden_ability_id;
        let source = "base-copy";

        try {
          const poke = await fetchPokeApi<PokeApiPokemon>(
            `https://pokeapi.co/api/v2/pokemon/${entry.pokeapi_id}/`
          );
          stats = {};
          for (const s of poke.stats) {
            stats[statName(s.stat.name)] = s.base_stat;
          }
          types = poke.types.map((t) => t.type.name);
          const normalAbilities = poke.abilities.filter((a) => !a.is_hidden);
          const hidden = poke.abilities.find((a) => a.is_hidden);
          abilityIds = await Promise.all(normalAbilities.map((a) => getAbilityId(a.ability.url)));
          hiddenAbilityId = hidden ? await getAbilityId(hidden.ability.url) : undefined;
          source = "pokeapi";
        } catch {
          // cosmetic form: copy from base form
        }

        // Add to core/forms
        const newCoreForm: Record<string, unknown> = {
          id: entry.form_id,
          order: coreData.forms.length,
          name: defaultForm.name, // placeholder, same as base
          form_type: defaultForm.form_type,
          region: defaultForm.region,
          types,
          stats,
          ability_ids: abilityIds,
        };
        if (hiddenAbilityId !== undefined) {
          newCoreForm.hidden_ability_id = hiddenAbilityId;
        }
        coreData.forms.push(newCoreForm);

        // Add to go/forms
        goData.forms.push({
          form_id: entry.form_id,
          base_attack: null,
          base_defense: null,
          base_stamina: null,
          fast_move_ids: [],
          charged_move_ids: [],
          elite_fast_move_ids: [],
          elite_charged_move_ids: [],
          released_at: null,
          shiny_released_at: null,
        });

        console.log(` ✓ [${source}] (${types.join("/")})`);
      } catch (e) {
        console.log(` ✗ ${e}`);
        errors.push(`${entry.pokeapi_id}: ${e}`);
      }
    }

    await writeFile(coreFormsPath, JSON.stringify(coreData, null, 2) + "\n");
    await writeFile(goFormsPath, JSON.stringify(goData, null, 2) + "\n");
    coreUpdated++;
    goUpdated++;
  }

  console.log(`\n✓ Updated ${coreUpdated} core/forms files, ${goUpdated} go/forms files`);
  if (errors.length > 0) {
    console.log(`\n⚠ Errors (${errors.length}):`);
    errors.forEach((e) => console.log(" ", e));
  }
}

main();
