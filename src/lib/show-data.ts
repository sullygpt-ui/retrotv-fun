import showsJson from '../../scripts/shows.json';
import showsDetail from '../data/shows-detail.json';

export interface Show {
  name: string;
  tmdbId: number;
  slug: string;
}

export const allShows: Show[] = showsJson as Show[];

interface ShowDates {
  slug: string;
  first_air_date: string;
  last_air_date: string;
  genres: string[];
}

const DETAIL_BY_SLUG = new Map(
  (showsDetail as ShowDates[]).map((show) => [show.slug, show]),
);

/**
 * Decade and genre membership below is hand-curated for the original library.
 * Shows added since fall back to their TMDB data, so a new batch lands on the
 * decade and genre pages without anyone editing these lists.
 */
function airedInDecade(slug: string, from: number, to: number): boolean {
  const detail = DETAIL_BY_SLUG.get(slug);
  const start = Number(detail?.first_air_date?.slice(0, 4));
  if (!start) return false;
  const end = Number(detail?.last_air_date?.slice(0, 4)) || start;
  return start <= to && end >= from;
}

/** TMDB's genre names mapped onto the buckets this site browses by. */
const TMDB_GENRE_BUCKETS: Record<string, string[]> = {
  'Action & Adventure': ['action-adventure'],
  'Sci-Fi & Fantasy': ['sci-fi'],
  Animation: ['cartoons-animation'],
  Kids: ['cartoons-animation'],
  Comedy: ['comedy'],
  Drama: ['drama'],
  Crime: ['crime-detective'],
  Mystery: ['crime-detective'],
  Family: ['family'],
  Soap: ['soap-opera'],
};

function tmdbGenreBuckets(slug: string): string[] {
  const detail = DETAIL_BY_SLUG.get(slug);
  if (!detail) return [];
  return [...new Set(detail.genres.flatMap((g) => TMDB_GENRE_BUCKETS[g] ?? []))];
}

// Decade mappings based on original air dates
const seventiesOnly = new Set([
  'kung-fu', 'the-mary-tyler-moore-show', 'the-waltons', 'the-streets-of-san-francisco',
  'night-gallery', 'kolchak-the-night-stalker', 'the-world-at-war', 'planet-of-the-apes',
  'space-1999', 'the-persuaders', 'i-claudius', 'roots', 'good-times', 'sanford-and-son',
  'all-in-the-family', 'welcome-back-kotter', 'fawlty-towers', 'emergency', 'land-of-the-lost',
  'the-six-million-dollar-man', 'the-bionic-woman', 'kojak', 'starsky-and-hutch',
  'the-new-scooby-doo-movies', 'the-scooby-doodynomutt-hour', 'scoobys-laff-a-lympics',
  'captain-caveman-and-the-teen-angels', 'super-friends', 'spider-woman',
  'are-you-being-served', 'the-all-new-pink-panther-show', 'star-trek',
  'cosmos-a-personal-voyage', 'galactica-1980', 'eight-is-enough',
]);

const eightiesOnly = new Set([
  'the-a-team', 'knight-rider', 'cheers', 'family-ties', 'growing-pains',
  'whos-the-boss', 'silver-spoons', 'punky-brewster', 'small-wonder', 'webster',
  'perfect-strangers', 'full-house', 'alf', 'miami-vice', 'hill-street-blues',
  'cagney-and-lacey', 'night-court', 'newhart', 'the-cosby-show', 'macgyver',
  'airwolf', 'the-fall-guy', 'simon-and-simon', 'remington-steele',
  'scarecrow-and-mrs-king', 'quantum-leap', 'dynasty', 'falcon-crest',
  'the-wonder-years', 'married-with-children', 'the-golden-girls', 'murder-she-wrote',
  'matlock', 'in-the-heat-of-the-night', '21-jump-street', 'saved-by-the-bell',
  'doogie-howser-md', 'charles-in-charge', 'mr-belvedere', 'head-of-the-class',
  'designing-women', '227', 'hunter', 'moonlighting', 'la-law', 'st-elsewhere',
  'thundercats', 'he-man', 'gi-joe', 'transformers', 'the-simpsons',
  'star-trek-the-next-generation', 'tales-from-the-crypt', 'teenage-mutant-ninja-turtles',
  'ducktales', 'the-smurfs', 'chip-n-dale-rescue-rangers', 'agatha-christies-poirot',
  'blackadder', 'baywatch', 'police-squad', 'inspector-gadget', 'red-dwarf',
  'the-transformers', 'garfield-and-friends', 'roseanne', 'robotech', 'family-matters',
  'silverhawks', 'only-fools-and-horses', 'a-pup-named-scooby-doo',
  'the-real-ghostbusters', 'beauty-and-the-beast', 'the-new-adventures-of-winnie-the-pooh',
  'dungeons-dragons', 'allo-allo', 'disneys-adventures-of-the-gummi-bears',
  'spider-man-and-his-amazing-friends', 'the-twilight-zone', 'sherlock-holmes',
  'count-duckula', 'the-13-ghosts-of-scooby-doo', 'the-storyteller', 'friday-the-13th-the-series',
  'amazing-stories', 'eastenders', 'mystery-science-theater-3000', 'she-ra-princess-of-power',
  'highway-to-heaven', 'beetlejuice', 'automan', 'v', 'tour-of-duty', 'north-and-south',
  'sledge-hammer', 'yes-minister', 'pingu', 'the-new-scooby-and-scrappy-doo-show',
  'unsolved-mysteries', 'the-young-ones', 'the-charlie-brown-and-snoopy-show',
  'thomas-friends', 'bravestarr', 'inspector-morse', 'manimal',
  'yes-prime-minister', 'alien-nation', 'shaka-zulu', 'a-bit-of-fry-laurie',
  'tinker-tailor-soldier-spy', 'muppet-babies', 'blue-thunder', 'the-greatest-american-hero',
  'the-new-scooby-doo-mysteries', 'street-hawk', 'the-care-bears',
  'defenders-of-the-earth', 'voyagers', 'tales-from-the-darkside', 'star-wars-droids',
  'richie-rich', 'robin-of-sherwood', 'the-super-mario-bros-super-show',
  'spenser-for-hire', 'wiseguy', 'crime-story', 'riptide', 'hardcastle-and-mccormick',
  'hotel', 'mission-impossible', 'tj-hooker', 'seinfeld',
]);

const bothDecades = new Set([
  'happy-days', 'mash', 'magnum-pi', 'chips', 'the-dukes-of-hazzard',
  'threes-company', 'the-love-boat', 'fantasy-island', 'diffrent-strokes',
  'the-facts-of-life', 'the-jeffersons', 'laverne-and-shirley', 'mork-and-mindy',
  'taxi', 'charlies-angels', 'battlestar-galactica', 'the-muppet-show',
  'little-house-on-the-prairie', 'one-day-at-a-time', 'bj-and-the-bear',
  'fraggle-rock', 'trapper-john-md', 'barney-miller', 'wkrp-in-cincinnati',
  'columbo', 'the-rockford-files', 'the-incredible-hulk', 'wonder-woman',
  'hart-to-hart', 'dallas', 'knots-landing', 'quincy-me', 'scooby-doo-and-scrappy-doo',
  'buck-rogers-in-the-25th-century',
]);

export function getShowsByDecade(decade: '1970s' | '1980s'): Show[] {
  const curated = (show: Show) => {
    if (bothDecades.has(show.slug)) return true;
    return decade === '1970s' ? seventiesOnly.has(show.slug) : eightiesOnly.has(show.slug);
  };
  const isCurated = (show: Show) =>
    bothDecades.has(show.slug) || seventiesOnly.has(show.slug) || eightiesOnly.has(show.slug);

  return allShows
    .filter(show =>
      isCurated(show)
        ? curated(show)
        : decade === '1970s'
          ? airedInDecade(show.slug, 1970, 1979)
          : airedInDecade(show.slug, 1980, 1989),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Genre mappings
const genreMap: Record<string, Set<string>> = {
  'action-adventure': new Set([
    'the-a-team', 'knight-rider', 'magnum-pi', 'chips', 'the-dukes-of-hazzard',
    'miami-vice', 'starsky-and-hutch', 'charlies-angels', 'macgyver', 'airwolf',
    'the-fall-guy', 'simon-and-simon', 'remington-steele', 'scarecrow-and-mrs-king',
    'the-incredible-hulk', 'wonder-woman', 'the-six-million-dollar-man', 'the-bionic-woman',
    'hart-to-hart', 'hardcastle-and-mccormick', 'riptide', 'the-greatest-american-hero',
    'street-hawk', 'blue-thunder', 'automan', 'manimal', 'baywatch',
    'bj-and-the-bear', 'buck-rogers-in-the-25th-century', 'kung-fu',
    'the-persuaders', 'robin-of-sherwood', 'tour-of-duty', 'mission-impossible',
    'tj-hooker', 'spenser-for-hire', 'hunter', '21-jump-street', 'moonlighting',
  ]),
  'comedy': new Set([
    'happy-days', 'mash', 'threes-company', 'the-love-boat', 'diffrent-strokes',
    'the-facts-of-life', 'good-times', 'sanford-and-son', 'all-in-the-family',
    'laverne-and-shirley', 'welcome-back-kotter', 'mork-and-mindy', 'the-jeffersons',
    'taxi', 'cheers', 'family-ties', 'growing-pains', 'whos-the-boss', 'silver-spoons',
    'punky-brewster', 'small-wonder', 'webster', 'perfect-strangers', 'full-house',
    'alf', 'barney-miller', 'wkrp-in-cincinnati', 'night-court', 'newhart',
    'the-cosby-show', 'the-golden-girls', 'married-with-children', 'saved-by-the-bell',
    'charles-in-charge', 'mr-belvedere', 'head-of-the-class', 'designing-women',
    '227', 'roseanne', 'family-matters', 'seinfeld', 'fawlty-towers', 'blackadder',
    'police-squad', 'only-fools-and-horses', 'the-young-ones', 'allo-allo',
    'yes-minister', 'yes-prime-minister', 'a-bit-of-fry-laurie', 'sledge-hammer',
    'the-mary-tyler-moore-show', 'one-day-at-a-time', 'are-you-being-served',
    'mystery-science-theater-3000', 'the-wonder-years', 'doogie-howser-md',
  ]),
  'drama': new Set([
    'dallas', 'dynasty', 'falcon-crest', 'knots-landing', 'hill-street-blues',
    'la-law', 'st-elsewhere', 'the-waltons', 'little-house-on-the-prairie',
    'eight-is-enough', 'the-wonder-years', 'north-and-south', 'roots',
    'i-claudius', 'beauty-and-the-beast', 'highway-to-heaven', 'hotel',
    'trapper-john-md', 'eastenders', 'shaka-zulu', 'tinker-tailor-soldier-spy',
    'fantasy-island',
  ]),
  'sci-fi': new Set([
    'battlestar-galactica', 'galactica-1980', 'star-trek-the-next-generation',
    'quantum-leap', 'the-incredible-hulk', 'the-six-million-dollar-man',
    'the-bionic-woman', 'v', 'alien-nation', 'buck-rogers-in-the-25th-century',
    'space-1999', 'red-dwarf', 'automan', 'manimal', 'voyagers',
    'the-greatest-american-hero', 'wonder-woman', 'small-wonder',
    'star-trek', 'the-twilight-zone', 'amazing-stories', 'planet-of-the-apes',
    'land-of-the-lost', 'robotech',
  ]),
  'cartoons-animation': new Set([
    'thundercats', 'he-man', 'gi-joe', 'transformers', 'the-simpsons',
    'teenage-mutant-ninja-turtles', 'ducktales', 'the-smurfs',
    'chip-n-dale-rescue-rangers', 'inspector-gadget', 'the-transformers',
    'garfield-and-friends', 'silverhawks', 'scooby-doo-and-scrappy-doo',
    'a-pup-named-scooby-doo', 'the-real-ghostbusters', 'the-new-scooby-doo-movies',
    'the-new-adventures-of-winnie-the-pooh', 'dungeons-dragons',
    'disneys-adventures-of-the-gummi-bears', 'spider-man-and-his-amazing-friends',
    'count-duckula', 'the-13-ghosts-of-scooby-doo', 'she-ra-princess-of-power',
    'beetlejuice', 'the-all-new-pink-panther-show', 'the-scooby-doodynomutt-hour',
    'pingu', 'the-charlie-brown-and-snoopy-show', 'thomas-friends', 'bravestarr',
    'captain-caveman-and-the-teen-angels', 'super-friends', 'scoobys-laff-a-lympics',
    'muppet-babies', 'the-new-scooby-doo-mysteries', 'the-care-bears',
    'defenders-of-the-earth', 'star-wars-droids', 'richie-rich', 'spider-woman',
    'the-super-mario-bros-super-show', 'robotech', 'fraggle-rock',
    'the-muppet-show',
  ]),
  'crime-detective': new Set([
    'magnum-pi', 'columbo', 'the-rockford-files', 'kojak', 'starsky-and-hutch',
    'cagney-and-lacey', 'hill-street-blues', 'miami-vice', 'murder-she-wrote',
    'matlock', 'in-the-heat-of-the-night', 'hunter', 'moonlighting',
    'hart-to-hart', 'simon-and-simon', 'remington-steele', 'barney-miller',
    'quincy-me', 'the-streets-of-san-francisco', 'agatha-christies-poirot',
    'inspector-morse', 'sherlock-holmes', 'tj-hooker', 'police-squad',
    'spenser-for-hire', 'wiseguy', 'crime-story', 'riptide', '21-jump-street',
    'hardcastle-and-mccormick', 'night-court', 'unsolved-mysteries',
    'kolchak-the-night-stalker',
  ]),
  'family': new Set([
    'happy-days', 'diffrent-strokes', 'the-facts-of-life', 'the-waltons',
    'little-house-on-the-prairie', 'eight-is-enough', 'one-day-at-a-time',
    'family-ties', 'growing-pains', 'whos-the-boss', 'silver-spoons',
    'punky-brewster', 'webster', 'full-house', 'alf', 'the-cosby-show',
    'family-matters', 'saved-by-the-bell', 'charles-in-charge', 'mr-belvedere',
    'head-of-the-class', 'the-wonder-years', 'highway-to-heaven',
    'the-muppet-show', 'fraggle-rock', 'the-love-boat',
  ]),
  'soap-opera': new Set([
    'dallas', 'dynasty', 'falcon-crest', 'knots-landing', 'north-and-south',
    'eastenders',
  ]),
};

const CURATED_GENRE_SLUGS = new Set(
  Object.values(genreMap).flatMap(slugs => [...slugs]),
);

export function getShowsByGenre(genre: string): Show[] {
  const slugs = genreMap[genre];
  if (!slugs) return [];
  return allShows
    .filter(show =>
      CURATED_GENRE_SLUGS.has(show.slug)
        ? slugs.has(show.slug)
        : tmdbGenreBuckets(show.slug).includes(genre),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The browse pages a show's TMDB genres map to.
 *
 * TMDB names genres "Western", "War & Politics" and "Sci-Fi & Fantasy"; the
 * site browses by eight buckets, and slugifying the TMDB name instead produced
 * links to /shows/genre/western and /shows/genre/sci-fi-fantasy, which 404.
 * Genres with no bucket are dropped rather than linked into nothing.
 */
export function genreLinks(tmdbGenres: string[] | undefined): { slug: string; name: string }[] {
  const slugs = new Set((tmdbGenres ?? []).flatMap((genre) => TMDB_GENRE_BUCKETS[genre] ?? []));
  return genres.filter((genre) => slugs.has(genre.slug));
}

export const genres = [
  { slug: 'action-adventure', name: 'Action & Adventure' },
  { slug: 'comedy', name: 'Comedy' },
  { slug: 'drama', name: 'Drama' },
  { slug: 'sci-fi', name: 'Sci-Fi' },
  { slug: 'cartoons-animation', name: 'Cartoons & Animation' },
  { slug: 'crime-detective', name: 'Crime & Detective' },
  { slug: 'family', name: 'Family' },
  { slug: 'soap-opera', name: 'Soap Opera' },
];
