import { NextResponse } from "next/server";
import { CategoryService } from "../../../../modules/category/category.service";
import { requireRole } from "../../../../middlewares/requireRole";
import { createCategorySchema } from "../../../../modules/category/category.validators";

export async function GET() {
  const categories = await CategoryService.list();
  return NextResponse.json(categories);
}

export const POST = requireRole("role:ADMIN", async (req: Request) => {
  try {
    const body = await req.json();
    const data = createCategorySchema.parse(body);
    const category = await CategoryService.create(data);
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
