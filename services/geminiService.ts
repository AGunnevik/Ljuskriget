import { GoogleGenAI } from "@google/genai";

// Initialize the API client safely (keeping structure for potential future use)
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

const GLAMOX_QUOTES = [
  "Alltså… hur gör Fagerhult för att alltid se så där ljusstarka ut?",
  "Vi är inte bittra, vi är bara… eh… professionellt imponerade. Okej då, lite avundsjuka.",
  "Kan någon berätta för Fagerhult att vi också vill ha deras hemliga recept på perfekt ljus?",
  "Vi säger inte att Fagerhult är våra förebilder… men våra designers har dem som skärmsläckare."
];

export const generateVillainTaunt = async (score: number): Promise<string> => {
  // Client request: Use specific jealous/admiring quotes instead of AI generation.
  // We simulate an async delay to keep the UI transition smooth.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const quote = GLAMOX_QUOTES[Math.floor(Math.random() * GLAMOX_QUOTES.length)];
      resolve(quote);
    }, 600);
  });
};