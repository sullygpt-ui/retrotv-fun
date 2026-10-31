/** The only puzzle fields that are safe to send to the browser. */
export interface PublicPuzzle {
  /** Sequential day number since launch; also the localStorage save key. */
  number: number;
  /** UTC date this puzzle belongs to, as YYYY-MM-DD. */
  date: string;
  frames: string[];
  /** sha256 of the normalized answer, so the client can check without knowing it. */
  answerHash: string;
}

/** What `/api/reveal/[date]` returns once a game is over. */
export interface PuzzleAnswer {
  showName: string;
  showSlug: string;
}
