
import { GoogleGenAI, Type } from "@google/genai";
import { RentalSession } from "../types";

const apiKey = process.env.API_KEY || '';
// Initialize with object parameter as per guidelines
const ai = new GoogleGenAI({ apiKey });

export const generateBusinessInsight = async (rentals: RentalSession[]) => {
  if (!apiKey) return "AI Insights unavailable: Missing API Key.";

  try {
    const today = new Date().toISOString().split('T')[0];
    const todaysRentals = rentals.filter(r => r.startTime.startsWith(today));
    const totalRevenue = todaysRentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    
    const prompt = `
      You are a business analyst for a PlayStation Rental shop.
      Here is the data for today:
      - Date: ${today}
      - Total Rentals Count: ${todaysRentals.length}
      - Total Revenue: ${totalRevenue}
      
      Provide a brief, 2-sentence encouraging summary and one actionable tip to increase revenue for tomorrow based on general gaming trends.
    `;

    // Use gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insights at this time.";
  }
};

export const suggestGameDescription = async (gameName: string): Promise<string> => {
  if (!apiKey) return "Description unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, exciting, 1-sentence marketing tagline for the video game "${gameName}" to attract customers to play it.`,
    });
    return response.text || "No description available.";
  } catch (error) {
    return "Cool game description loading...";
  }
};

export const analyzeCustomerHabits = async (history: RentalSession[]) => {
    if (!apiKey || history.length === 0) return null;

    try {
        const dataSummary = history.slice(0, 20).map(h => ({
            day: new Date(h.startTime).toLocaleDateString(),
            duration: h.endTime ? (new Date(h.endTime).getTime() - new Date(h.startTime).getTime()) / 60000 : 0,
            items: h.items.length
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze these rental sessions: ${JSON.stringify(dataSummary)}. 
            Return a JSON object with a "summary" string and a "peakHours" string.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        peakHours: { type: Type.STRING }
                    }
                }
            }
        });
        
        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error(e);
        return null;
    }
}
