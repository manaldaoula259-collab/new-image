import openai from "@/core/clients/openai";
import { prompts } from "@/core/utils/prompts";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { logger } from "@/core/utils/logger";
import Project from "@/models/Project";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({}, { status: 401 });
  }

  await dbConnect();

  let project = await Project.findOne({ _id: projectId, userId });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await request.json();
  const { keyword } = body;

  if (project.promptWizardCredits < 1) {
    return NextResponse.json(
      { success: false, message: "no_credit" },
      { status: 400 }
    );
  }

  try {
    const instruction = `${process.env.OPENAI_API_SEED_PROMPT}

${prompts.map(
  (style) => `${style.label}: ${style.prompt}

`
)}

Keyword: ${keyword}
`;

    const chatCompletion = await openai().chat.completions.create({
      messages: [{ role: "user", content: instruction }],
      model: "gpt-4",
      temperature: 0.5,
    });

    const prompt = chatCompletion.choices?.[0]?.message?.content?.trim();

    if (prompt) {
      // @ts-ignore - Mongoose findByIdAndUpdate types are too complex for TypeScript
      project = await Project.findByIdAndUpdate(
        project._id,
        {
          promptWizardCredits: project.promptWizardCredits - 1,
        },
        { new: true }
      );
    }

    return NextResponse.json({
      prompt,
      promptWizardCredits: project!.promptWizardCredits,
    });
  } catch (e) {
    logger.apiError(`/api/projects/${projectId}/prompter`, e, {
      projectId,
      keyword,
    });
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
