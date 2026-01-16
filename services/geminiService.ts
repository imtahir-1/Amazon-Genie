
import { GoogleGenAI, Type } from "@google/genai";
import { ListingImage, ProductAnalysis, GroundingSource, ImageType } from "../types";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async analyzeProduct(input: string, type: 'url' | 'asin' | 'image'): Promise<ProductAnalysis> {
    const ai = this.getAI();
    let prompt = "";
    let contents: any;
    
    const model = type === 'image' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const basePromptInstructions = `
      You are a world-class Amazon Listing Strategist. Your task is to extract deep product intelligence.
      
      Required JSON fields:
      - category: The exact Amazon category path.
      - useCase: Primary usage scenarios.
      - targetCustomer: Detailed buyer persona.
      - keyBenefits: List of 5 high-impact USPs.
      - materials: Specific materials/build quality.
      - dimensions: Size/weight/capacity.
      - colorPalette: Array of 4-5 hex codes.
      - brandTone: Emotional resonance.
      - competitorInsights: Market gaps.
      - suggestedAesthetics: Visual direction.
      - visualDescription: A precise 3-sentence physical description of the product for image generation consistency. Include shape, dominant color, texture, and logo placement.
      - extractedImageUrls: Direct static image URLs found on the web.
    `;

    if (type === 'image') {
      prompt = `Analyze this image: ${basePromptInstructions}`;
      contents = {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: input.split(',')[1] } },
          { text: prompt }
        ]
      };
    } else {
      prompt = type === 'url' 
        ? `Use Google Search to scrape this Amazon URL: ${input}. Find technical specs and official images. Generate this JSON: ${basePromptInstructions}`
        : `Use Google Search to research ASIN: ${input}. Extract spec sheet and images. Generate this JSON: ${basePromptInstructions}`;
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        tools: type !== 'image' ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            useCase: { type: Type.STRING },
            targetCustomer: { type: Type.STRING },
            keyBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            materials: { type: Type.STRING },
            dimensions: { type: Type.STRING },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
            brandTone: { type: Type.STRING },
            competitorInsights: { type: Type.STRING },
            suggestedAesthetics: { type: Type.STRING },
            visualDescription: { type: Type.STRING },
            extractedImageUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["category", "useCase", "targetCustomer", "keyBenefits", "materials", "dimensions", "colorPalette", "brandTone", "competitorInsights", "suggestedAesthetics", "visualDescription"],
        },
      },
    });

    const analysis: ProductAnalysis = JSON.parse(response.text || "{}");
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      analysis.groundingSources = response.candidates[0].groundingMetadata.groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({ title: c.web.title || 'Source', uri: c.web.uri }));
    }
    return analysis;
  }

  static async generateListingBriefs(analysis: ProductAnalysis): Promise<ListingImage[]> {
    const ai = this.getAI();
    const prompt = `Convert this analysis into a high-conversion 8-image Amazon stack.
    Product: ${analysis.category}. DNA: ${analysis.visualDescription}. Tone: ${analysis.brandTone}.
    
    Assets needed: 1 Main, 2 Lifestyle, 3 Infographic, 1 Comparison, 1 Brand Story.
    The visualPrompt MUST be highly descriptive, focusing on professional lighting, high CTR placement, and psychological triggers (trust, quality, ease of use).
    
    Return JSON array of 8 objects with: id (unique string), type, title, headline, subCopy, visualPrompt, creativeBrief.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              headline: { type: Type.STRING },
              subCopy: { type: Type.STRING },
              visualPrompt: { type: Type.STRING },
              creativeBrief: { type: Type.STRING },
            },
            required: ["id", "type", "title", "headline", "subCopy", "visualPrompt", "creativeBrief"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  }

  static async generateImage(imageObj: ListingImage, referenceBase64?: string, visualDescription?: string): Promise<string> {
    const ai = this.getAI();
    let contents: any;

    const model = 'gemini-2.5-flash-image';

    const baseInstructions = `
      PROFESSIONAL AMZ E-COMMERCE PHOTOGRAPHY. Commercial Studio Lighting. 8k resolution.
      PRODUCT CONSISTENCY IS MANDATORY: ${visualDescription}.
      COMPOSITION: High-contrast, vibrant, and sharp focus. Clean background.
      CTR TRIGGER: ${imageObj.creativeBrief}.
    `;
    
    const layoutInstructions = `Concept: ${imageObj.visualPrompt}.`;
    const textInstructions = `Layout must leave negative space for text: "${imageObj.headline} - ${imageObj.subCopy}".`;

    const fullPrompt = `${baseInstructions} ${layoutInstructions} ${textInstructions}`;

    if (referenceBase64 && referenceBase64.startsWith('data:')) {
      contents = {
        parts: [
          { inlineData: { data: referenceBase64.split(',')[1], mimeType: 'image/png' } },
          { text: `${fullPrompt} PRESERVE THE EXACT PRODUCT DETAILS, LOGO, AND FORM FROM THE ATTACHED IMAGE.` }
        ]
      };
    } else {
      contents = {
        parts: [{ text: fullPrompt }]
      };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: { 
        imageConfig: { 
          aspectRatio: "1:1",
        } 
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Image generation failed. Please try again.");
  }

  static async editImage(base64Data: string, editPrompt: string): Promise<string> {
    const ai = this.getAI();
    // Gemini 2.5 Flash Image is specialized for fast, iterative image editing (Nano Banana)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data.split(',')[1], mimeType: 'image/png' } },
          { text: `SYSTEM: You are an expert AI photo editor.
INSTRUCTIONS: Modify the provided image according to the user request while PRESERVING the core product's identity and shape.
USER REQUEST: "${editPrompt}".
CAPABILITIES: You can add filters, remove background elements, change lighting, or add new objects.
RESTRICTION: Do not hallucinate a different product. Maintain structural integrity of the main item.` }
        ]
      }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Magic edit failed.");
  }
}
