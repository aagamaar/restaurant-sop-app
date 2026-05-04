import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the uploaded file into raw text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from PDF. It might be a scanned image.",
        },
        { status: 400 },
      );
    }

    // Ask Gemini to extract tasks
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are converting a restaurant Standard Operating Procedure document into a structured checklist of executable tasks.

Output a JSON array of tasks. Each task must have:
- title: a short, action-oriented instruction (max 15 words)
- frequency: one of "daily_opening", "daily_closing", "during_shift", "weekly", "monthly", "as_needed"
- section: one of "kitchen", "floor", "cleaning", "safety", "inventory", "staff", "other"
- order_index: integer for display order (start from 1)

Rules:
- Each task must be a single, checkable action (not a paragraph or general policy)
- Skip headers, definitions, and general statements  
- Prefer specific over generic ("Check walk-in cooler temperature is below 4°C" not "Maintain food safety")
- Keep specific numbers, times, or temperatures from the original
- Return ONLY valid JSON array, no markdown, no commentary, no code fences

DOCUMENT TEXT:
${pdfText.slice(0, 15000)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up the response — sometimes Gemini wraps JSON in code fences
    const cleanedText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let tasks;
    try {
      tasks = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", cleanedText);
      return NextResponse.json(
        { error: "AI response was not valid JSON. Try again." },
        { status: 500 },
      );
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: "No tasks could be extracted from this PDF." },
        { status: 400 },
      );
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
