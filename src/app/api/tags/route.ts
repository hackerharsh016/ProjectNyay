import { NextResponse } from "next/server";
import prisma from "../../../../src/lib/prisma";

export async function GET() {
  // To get distinct tags, we query cases and flatten the arrays.
  // Prisma doesn't have a distinct operator for scalar lists natively in all DBs
  // so we will query it and flatten in memory. Since tags are on cases, we only fetch PUBLIC cases.
  const cases = await prisma.case.findMany({
    where: { visibility: "PUBLIC" },
    select: { tags: true }
  });

  const allTags = new Set<string>();
  for (const c of cases) {
    for (const tag of c.tags) {
      allTags.add(tag);
    }
  }

  return NextResponse.json(Array.from(allTags).sort());
}
