import openai from "@/core/clients/openai";
import { replicate } from "@/core/clients/replicate";
import { replacePromptToken } from "@/core/utils/predictions";
import { prompts } from "@/core/utils/prompts";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Shot from "@/models/Shot";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { prompt, seed, image } = body;

  const projectId = params.id;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({}, { status: 401 });
  }

  await dbConnect();

  const project = await Project.findOne({ _id: projectId, userId });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.credits < 1) {
    return NextResponse.json({ message: "No credit" }, { status: 400 });
  }

  const projectIdString = (project as any)._id?.toString() ?? String(project);

  const instruction = `${process.env.OPENAI_API_SEED_PROMPT}

${prompts.slice(0, 5).map(
  (style) => `${style.label}: ${style.prompt}

`
)}

Keyword: ${prompt}
`;

  const chatCompletion = await openai().chat.completions.create({
    messages: [{ role: "user", content: instruction }],
    model: "gpt-4-turbo",
    temperature: 0.5,
    max_tokens: 200,
  });

  let refinedPrompt = (chatCompletion as any).choices?.[0]?.message?.content?.trim() as string | undefined;

  // @ts-ignore - Mongoose toObject() types are too complex for TypeScript
  const projectData = project.toObject();
  const projectObj = { ...projectData, id: projectIdString };

  const prediction = await replicate.predictions.create({
    model: `${process.env.REPLICATE_USERNAME}/${projectIdString}`,
    version: project.modelVersionId!,
    input: {
      prompt: `${replacePromptToken(
        `${refinedPrompt}. This a portrait of ${project.instanceName} @me and not another person.`,
        projectObj as any
      )}`,
      negative_prompt:
        process.env.REPLICATE_NEGATIVE_PROMPT ||
        "cropped face, cover face, cover visage, mutated hands",
      ...(image && { image }),
      ...(seed && { seed }),
    },
  });

  const shot = await Shot.create({
      prompt,
      replicateId: prediction.id,
      status: "starting",
    projectId: project._id,
  });

  await Project.findByIdAndUpdate(project._id, {
      credits: project.credits - 1,
  });

  const shotData = (shot as any).toObject ? (shot as any).toObject() : shot;
  return NextResponse.json({ shot: { ...shotData, id: (shot as any)._id?.toString() ?? String(shot) } });
}
