export const SHOW_LIST: string[] = [
  "Happy Days", "M*A*S*H", "The A-Team", "Knight Rider", "Magnum, P.I.",
  "CHiPs", "The Dukes of Hazzard", "Three's Company", "The Love Boat",
  "Fantasy Island", "Diff'rent Strokes", "The Facts of Life", "Good Times",
  "Sanford and Son", "All in the Family", "Laverne & Shirley",
  "Welcome Back, Kotter", "Mork & Mindy", "The Jeffersons", "Taxi",
  "Cheers", "Family Ties", "Growing Pains", "Who's the Boss?",
  "Silver Spoons", "Punky Brewster", "Small Wonder", "Webster",
  "Perfect Strangers", "Full House", "ALF", "Miami Vice",
  "Hill Street Blues", "Cagney & Lacey", "Starsky & Hutch", "Kojak",
  "Columbo", "The Rockford Files", "Barney Miller", "WKRP in Cincinnati",
  "Night Court", "Newhart", "The Cosby Show", "Seinfeld",
  "MacGyver", "Airwolf", "The Fall Guy", "Simon & Simon",
  "Remington Steele", "Scarecrow and Mrs. King", "Quantum Leap",
  "Dallas", "Dynasty", "Falcon Crest", "Knots Landing",
  "The Wonder Years", "Married... with Children", "The Golden Girls",
  "Murder, She Wrote", "Matlock", "In the Heat of the Night",
  "21 Jump Street", "Saved by the Bell", "Doogie Howser, M.D.",
  "Charles in Charge", "Mr. Belvedere", "Head of the Class",
  "The Hogan Family", "Designing Women", "227", "Amen",
  "Hunter", "T.J. Hooker", "Hart to Hart", "Vegas",
  "Magnum Force", "BJ and the Bear", "The Incredible Hulk",
  "Wonder Woman", "The Six Million Dollar Man", "The Bionic Woman",
  "Charlie's Angels", "Battlestar Galactica", "Buck Rogers",
  "Land of the Lost", "The Muppet Show", "Fraggle Rock",
  "ThunderCats", "He-Man", "G.I. Joe", "Transformers",
  "Riptide", "Hardcastle and McCormick", "Spenser: For Hire",
  "Jake and the Fatman", "Wiseguy", "Crime Story",
  "St. Elsewhere", "L.A. Law", "thirtysomething",
  "Moonlighting", "Hotel", "Trapper John, M.D.",
  "CHIPS", "Emergency!", "The Waltons", "Little House on the Prairie",
  "Eight is Enough", "One Day at a Time"
].sort();

export function searchShows(query: string): string[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return SHOW_LIST.filter((s) => s.toLowerCase().includes(lower)).slice(0, 8);
}
