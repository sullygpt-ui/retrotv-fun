import { NextResponse } from "next/server";
import { getPuzzle, isValidPuzzleDate } from "@/lib/rotation";

/**
 * Reveals the answer for a puzzle the player has finished.
 *
 * The page payload only carries a hash of the answer, so the end screen asks
 * for the title here. Future dates are refused, which is what keeps tomorrow's
 * puzzle out of reach.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  if (!isValidPuzzleDate(date)) {
    return NextResponse.json({ error: "No such puzzle" }, { status: 404 });
  }

  const puzzle = getPuzzle(date);
  if (!puzzle) {
    return NextResponse.json({ error: "No such puzzle" }, { status: 404 });
  }

  return NextResponse.json(
    { showName: puzzle.showName, showSlug: puzzle.showSlug },
    // Past answers never change; today's stops being servable at UTC midnight.
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } },
  );
}
