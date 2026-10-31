/**
 * Title normalization and guess matching.
 *
 * Kept free of path aliases and framework imports so it can be unit tested
 * and used on both the server and the client.
 */

/**
 * Reduce a show title to a comparable key: case-folded, accent-stripped,
 * punctuation-free, with leading articles removed and initialisms rejoined.
 *
 * `"Diff'rent Strokes"` -> `"diffrent strokes"`
 * `"M*A*S*H"`           -> `"mash"`
 * `"Magnum, P.I."`      -> `"magnum pi"`
 * `"The A-Team"`        -> `"team"`
 *
 * Articles are stripped repeatedly, which makes the function idempotent and
 * lets "A-Team" match "The A-Team" — a single pass would leave `"a team"` and
 * `"team"` as different keys. Runs of single letters are rejoined because
 * punctuation removal turns "M*A*S*H" into "m a s h", which nobody types.
 */
export function normalizeTitle(input: string): string {
  let key = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’‘]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    // "m a s h" -> "mash", "magnum p i" -> "magnum pi"
    .replace(/\b(?:[a-z0-9] )+[a-z0-9]\b/g, (run) => run.replace(/ /g, ""));

  for (;;) {
    const stripped = key.replace(/^(the|a|an) /, "");
    if (stripped === key || stripped === "") return key;
    key = stripped;
  }
}

/**
 * Nicknames and abbreviations players actually type. Keys are raw text (they
 * get normalized on lookup); values are the canonical show name.
 *
 * Only titles that normalization alone cannot reach belong here — "M*A*S*H",
 * "G.I. Joe" and "'Allo 'Allo!" already normalize to what people type.
 */
const ALIASES: Record<string, string> = {
  "tmnt": "Teenage Mutant Ninja Turtles",
  "ninja turtles": "Teenage Mutant Ninja Turtles",
  "turtles": "Teenage Mutant Ninja Turtles",
  "buck rogers": "Buck Rogers in the 25th Century",
  "poirot": "Agatha Christie's Poirot",
  "star trek tng": "Star Trek: The Next Generation",
  "tng": "Star Trek: The Next Generation",
  "next generation": "Star Trek: The Next Generation",
  "bsg": "Battlestar Galactica",
  "different strokes": "Diff'rent Strokes",
  "quincy": "Quincy, M.E.",
  "fry and laurie": "A Bit of Fry & Laurie",
  "mst3k": "Mystery Science Theater 3000",
  "mister belvedere": "Mr. Belvedere",
  "masters of the universe": "He-Man and the Masters of the Universe",
  "she ra": "She-Ra: Princess of Power",
  "jump street": "21 Jump Street",
  "cosmos": "Cosmos: A Personal Voyage",
  "winnie the pooh": "The New Adventures of Winnie the Pooh",
  "gummi bears": "Disney's Adventures of the Gummi Bears",
  "pink panther": "The All-New Pink Panther Show",
  "mario": "The Super Mario Bros. Super Show!",
  "super mario": "The Super Mario Bros. Super Show!",
  "rescue rangers": "Chip 'n Dale Rescue Rangers",
  "ghostbusters": "The Real Ghostbusters",
  "only fools": "Only Fools and Horses",
  "droids": "Star Wars: Droids",
  "laff a lympics": "Scooby's Laff-A Lympics",
  "mary tyler moore": "The Mary Tyler Moore Show",
  "muppets": "The Muppet Show",
  "hulk": "The Incredible Hulk",
  "magnum": "Magnum, P.I.",
  "wkrp": "WKRP in Cincinnati",
  "sledgehammer": "Sledge Hammer!",
  "doogie howser": "Doogie Howser, M.D.",
  "trapper john": "Trapper John, M.D.",
  "thomas the tank engine": "Thomas & Friends",
  "friday the 13th": "Friday the 13th: The Series",
  "world at war": "The World at War",
  "kolchak": "Kolchak: The Night Stalker",
  "night stalker": "Kolchak: The Night Stalker",
  "garfield": "Garfield and Friends",
  "charlie brown": "The Charlie Brown and Snoopy Show",
  "snoopy": "The Charlie Brown and Snoopy Show",
  "spiderman": "Spider-Man and His Amazing Friends",
  "spider man": "Spider-Man and His Amazing Friends",
  "13 ghosts": "The 13 Ghosts of Scooby-Doo",
  "captain caveman": "Captain Caveman and the Teen Angels",
  "six million dollar man": "The Six Million Dollar Man",
  "fall guy": "The Fall Guy",
  "incredible hulk": "The Incredible Hulk",
  "scooby doo": "Scooby-Doo, Where Are You!",
  "where are you": "Scooby-Doo, Where Are You!",
  "monty python": "Monty Python's Flying Circus",
  "flying circus": "Monty Python's Flying Circus",
  "hitchhikers guide": "The Hitchhiker's Guide to the Galaxy",
  "laugh in": "Rowan & Martin's Laugh-In",
  "sctv": "Second City Television",
  "benny hill": "The Benny Hill Show",
  "carol burnett": "The Carol Burnett Show",
  "jeannie": "I Dream of Jeannie",
  "hardy boys": "The Hardy Boys / Nancy Drew Mysteries",
  "nancy drew": "The Hardy Boys / Nancy Drew Mysteries",
  "fat albert": "Fat Albert and the Cosby Kids",
  "triffids": "The Day of the Triffids",
  "pufnstuf": "H.R. Pufnstuf",
  "likely lads": "Whatever Happened to the Likely Lads?",
  "marcus welby": "Marcus Welby, M.D.",
  "jackson 5": "The Jackson 5ive",
  "penelope pitstop": "The Perils of Penelope Pitstop",
  "dastardly and muttley": "Dastardly and Muttley in Their Flying Machines",
  "grape ape": "The Great Grape Ape Show",
  "hair bear bunch": "Help!... It's the Hair Bear Bunch!",
  "winds of war": "The Winds of War",
  "cell block h": "Prisoner",
  "prisoner cell block h": "Prisoner",
};

/** [alias, canonical title] pairs, for tests that check the table's targets. */
export const ALIAS_ENTRIES: ReadonlyArray<readonly [string, string]> = Object.entries(ALIASES);

const ALIAS_KEYS: Record<string, string> = Object.fromEntries(
  Object.entries(ALIASES).map(([k, v]) => [normalizeTitle(k), v]),
);

/**
 * The normalized title an alias points to, or undefined if the key isn't one.
 *
 * Callers must try an exact title first — see guessKey() in shows.ts. The show
 * library grows, and a title added later can collide with an older nickname:
 * "ghostbusters" meant The Real Ghostbusters until the 1986 Ghostbusters was
 * added, and an alias that outranked the real title would make that puzzle
 * unwinnable.
 */
export function aliasTarget(key: string): string | undefined {
  const alias = ALIAS_KEYS[key];
  return alias ? normalizeTitle(alias) : undefined;
}

/** The sentinel stored in guess history when a player skips a frame. */
export const SKIP = "__SKIP__";
