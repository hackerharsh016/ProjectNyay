import { NextResponse } from "next/server";
import { CategoryService } from "../../../../../modules/category/category.service";
import { requireRole } from "../../../../../middlewares/requireRole";
import { updateCategorySchema } from "../../../../../modules/category/category.validators";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await CategoryService.getById(id);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export const PUT = requireRole("role:ADMIN", async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateCategorySchema.parse(body);
    const category = await CategoryService.update(id, data);
    return NextResponse.json(category);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});

export const DELETE = requireRole("role:ADMIN", async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    await CategoryService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
