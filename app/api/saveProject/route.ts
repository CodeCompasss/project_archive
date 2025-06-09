import { NextResponse } from "next/server";
import { createProject } from "@/server-action/project";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createProject(data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Project saved successfully!", data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving project:", error);
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}
