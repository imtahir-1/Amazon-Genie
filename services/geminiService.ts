
import { GoogleGenAI, Type } from "@google/genai";
import { ListingImage, ProductAnalysis, GroundingSource, ImageType } from "../types";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private static extractJson(text: string): any {
    try {
      return JSON.parse(text);
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e2) {
          console.error("JSON block extraction failed", text);
          throw new Error("Failed to parse AI response.");
        }
      }
      throw new Error("The AI response was not in a valid format.");
    }
  }

  static async analyzeProduct(input: { text?: string, image?: string }): Promise<ProductAnalysis> {
    const ai = this.getAI();
    const model = 'gemini-3-flash-preview';

    const basePromptInstructions = `
      You are a world-class Amazon Listing Strategist. Your goal is to combine technical data with visual aesthetics.
      
      TASK:
      ${input.text ? `1. Use Google Search to research this product link/ASIN: "${input.text}". Find technical specs, materials, and target audience.` : ''}
      ${input.image ? `2. Analyze the provided image to identify the physical design, branding, and color palette.` : ''}
      3. Cross-reference all data to create a high-conversion intelligence report.

      Return STRICTLY as a JSON object with:
      category (string), useCase (string), targetCustomer (string), keyBenefits (string array), 
      materials (string), dimensions (string), colorPalette (string array of hex codes), 
      brandTone (string), competitorInsights (string), suggestedAesthetics (string), 
      visualDescription (precise 3-sentence description), extractedImageUrls (string array).
    `;

    const parts: any[] = [{ text: basePromptInstructions }];
    
    if (input.image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: input.image.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        tools: input.text ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
      },
    });

    const analysis: ProductAnalysis = this.extractJson(response.text || "{}");
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      analysis.groundingSources = response.candidates[0].groundingMetadata.groundingChunks
        .filter((c: any) => c?.web)
        .map((c: any) => ({ 
          title: c.web.title || 'Source', 
          uri: c.web.uri 
        }));
    }
    
    analysis.keyBenefits = analysis.keyBenefits || [];
    analysis.colorPalette = analysis.colorPalette || [];
    analysis.extractedImageUrls = analysis.extractedImageUrls || [];
    
    return analysis;
  }

  static async generateListingBriefs(analysis: ProductAnalysis): Promise<ListingImage[]> {
    const ai = this.getAI();
    const prompt = `Convert this intelligence into an 8-image Amazon stack.
    Product: ${analysis.category}. DNA: ${analysis.visualDescription}.
    
    Assets needed: 1 Main, 2 Lifestyle, 3 Infographic, 1 Comparison, 1 Brand Story.
    Return JSON array: {id, type, title, headline, subCopy, visualPrompt, creativeBrief}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    return this.extractJson(response.text || "[]");
  }

  static async generateImage(imageObj: ListingImage, referenceBase64?: string, visualDescription?: string): Promise<string> {
    const ai = this.getAI();
    const model = 'gemini-2.5-flash-image';
    const fullPrompt = `
      PROFESSIONAL AMZ E-COMMERCE PHOTOGRAPHY. Commercial Studio Lighting. 
      PRODUCT DNA: ${visualDescription || 'Professional product shot'}.
      COMPOSITION: ${imageObj.visualPrompt}.
      HEADLINE TEXT AREA: Leave negative space for "${imageObj.headline}".
    `;

    const contents = referenceBase64 ? {
      parts: [
        { inlineData: { data: referenceBase64.split(',')[1], mimeType: 'image/png' } },
        { text: `${fullPrompt} PRESERVE THE EXACT PRODUCT DETAILS FROM THE ATTACHED IMAGE.` }
      ]
    } : { parts: [{ text: fullPrompt }] };

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: { imageConfig: { aspectRatio: "1:1" } },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image generation failed.");
  }

  static async editImage(base64Data: string, editPrompt: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data.split(',')[1], mimeType: 'image/png' } },
          { text: `Photo Edit: "${editPrompt}". Keep the product consistent.` }
        ]
      }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Magic edit failed.");
  }
}
