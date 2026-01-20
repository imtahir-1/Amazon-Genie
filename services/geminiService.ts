
import { GoogleGenAI, Type } from "@google/genai";
import { ListingImage, ProductAnalysis, GroundingSource, ImageType } from "../types";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Resilient JSON extraction that handles markdown blocks, 
   * grounding noise, and unexpected text wraps.
   */
  private static extractJson(text: string): any {
    if (!text) return null;
    
    // Attempt 1: Standard trim and clean
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // Attempt 2: Boundary searching (finding the largest valid JSON block)
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      const firstBracket = cleaned.indexOf('[');
      const lastBracket = cleaned.lastIndexOf(']');

      let start = -1;
      let end = -1;

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = lastBrace;
      } else if (firstBracket !== -1) {
        start = firstBracket;
        end = lastBracket;
      }

      if (start !== -1 && end !== -1 && end > start) {
        try {
          const block = cleaned.substring(start, end + 1);
          return JSON.parse(block);
        } catch (innerError) {
          console.error("Critical JSON parse failure:", innerError);
        }
      }
      
      throw new Error("The AI response was not in a valid format. Please try again.");
    }
  }

  /**
   * Two-Phase Analysis: 
   * 1. Research raw data with Google Search.
   * 2. Structure that data into the ProductAnalysis schema.
   */
  static async analyzeProduct(input: { text?: string, image?: string }): Promise<ProductAnalysis> {
    const ai = this.getAI();
    const modelName = 'gemini-3-flash-preview';
    
    let researchContext = "";
    let groundingSources: GroundingSource[] = [];

    // PHASE 1: Research (Only if text input provided)
    if (input.text) {
      const researchResponse = await ai.models.generateContent({
        model: modelName,
        contents: `Research this Amazon product or category: "${input.text}". 
                  Find technical specs, competitor weaknesses, and typical customer complaints. 
                  Provide a detailed summary.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      researchContext = researchResponse.text || "";
      
      if (researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        groundingSources = researchResponse.candidates[0].groundingMetadata.groundingChunks
          .filter((c: any) => c?.web)
          .map((c: any) => ({ 
            title: c.web.title || 'Source', 
            uri: c.web.uri 
          }));
      }
    }

    // PHASE 2: Structuring
    const prompt = `
      You are an Amazon Listing Strategist. Convert the following research and product image into a structured analysis.
      
      RESEARCH DATA: ${researchContext || "No web data provided."}
      ${input.image ? "IMAGE ATTACHED: Use the visual details of the product image for the 'visualDescription'." : ""}
      
      Return a JSON object exactly matching this schema:
      {
        "category": "String",
        "useCase": "String",
        "targetCustomer": "String",
        "keyBenefits": ["String", "String", "String", "String", "String"],
        "materials": "String",
        "dimensions": "String",
        "colorPalette": ["#HexCode", "#HexCode"],
        "brandTone": "String",
        "competitorInsights": "String",
        "suggestedAesthetics": "String",
        "visualDescription": "Detailed 3-sentence description of the physical product.",
        "extractedImageUrls": []
      }
    `;

    const parts: any[] = [{ text: prompt }];
    if (input.image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: input.image.split(',')[1]
        }
      });
    }

    const structureResponse = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
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
          required: ["category", "useCase", "targetCustomer", "keyBenefits", "brandTone", "visualDescription"],
        }
      }
    });

    const analysis = this.extractJson(structureResponse.text || "{}") as ProductAnalysis;
    analysis.groundingSources = groundingSources;
    
    return analysis;
  }

  static async generateListingBriefs(analysis: ProductAnalysis): Promise<ListingImage[]> {
    const ai = this.getAI();
    const prompt = `Based on this product analysis, design an 8-image Amazon visual strategy.
    
    Category: ${analysis.category}
    Brand DNA: ${analysis.visualDescription}
    Tone: ${analysis.brandTone}
    
    Produce 8 assets: 1 Main, 2 Lifestyle, 3 Infographics, 1 Comparison, 1 Brand Story.
    Return a JSON array of objects: {id, type, title, headline, subCopy, visualPrompt, creativeBrief}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
            required: ["id", "type", "title", "headline", "subCopy", "visualPrompt", "creativeBrief"]
          }
        }
      },
    });

    const result = this.extractJson(response.text || "[]");
    return Array.isArray(result) ? result : [];
  }

  static async generateImage(imageObj: ListingImage, referenceBase64?: string, visualDescription?: string): Promise<string> {
    const ai = this.getAI();
    const model = 'gemini-2.5-flash-image';
    const fullPrompt = `
      COMMERCIAL STUDIO PHOTOGRAPHY. 
      PRODUCT: ${visualDescription || 'Professional retail product'}.
      SCENE: ${imageObj.visualPrompt}.
      BRIEF: ${imageObj.creativeBrief}.
      COMPOSITION: Centered, 8k resolution, leave space for text overlay "${imageObj.headline}".
    `;

    const contents = referenceBase64 ? {
      parts: [
        { inlineData: { data: referenceBase64.split(',')[1], mimeType: 'image/png' } },
        { text: `${fullPrompt} THE PRODUCT IN THE GENERATED IMAGE MUST BE IDENTICAL IN SHAPE, COLOR, AND LOGO TO THIS REFERENCE IMAGE.` }
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
    throw new Error("Image generation engine failed to return a visual.");
  }

  static async editImage(base64Data: string, editPrompt: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data.split(',')[1], mimeType: 'image/png' } },
          { text: `Smart Edit: ${editPrompt}. Maintain the integrity of the product while changing the environment or style.` }
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
