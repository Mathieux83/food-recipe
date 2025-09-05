// src/app/api/test-translation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { freeTranslationService } from "@/lib/translation";

export async function POST(request: NextRequest) {
  try {
    const { text, fromLang = "fr", toLang = "en" } = await request.json();
    
    const result = await freeTranslationService.translate(text, fromLang, toLang);
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Translation failed" 
      },
      { status: 500 }
    );
  }
}
