import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function callGemini(prompt) {
  const chat = model.startChat({
    // You can add history here if you want persistent chat context
  });
  const result = await chat.sendMessage(prompt);
  const response = await result.response.text();
  return response;
}

export async function verifyClaim(claim) {
  const contextPrompt = `
You are an AI that helps verify factual claims using Wikidata. 
The user gave the following claim: "${claim}"

Step 1: Interpret the context.
Step 2: Generate a simple SPARQL query to check the claim.
Only return the query as your output.
`;

  let query = await callGemini(contextPrompt);
  query = query
    .replace(/```sparql/g, "")
    .replace(/```/g, "")
    .trim();
  //   console.log("Generated SPARQL Query:", query);

  // Wikidata Query Service
  const sparqlEndpoint = "https://query.wikidata.org/sparql";
  const url = `${sparqlEndpoint}?format=json&query=${encodeURIComponent(
    query
  )}`;
  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    data = await res.json();
  } catch (error) {
    console.error("Error fetching from Wikidata:", error);
    return {
      verified: false,
      confidence: 0,
      explanation: "Could not fetch data from Wikidata.",
      source: "Wikidata",
    };
  }

  const resultPrompt = `
We received the following Wikidata response (JSON):

${JSON.stringify(data.results.bindings.slice(0, 5), null, 2)}

Based on the original claim:
"${claim}"

Does the data verify the claim? Reply with:

- "verified" or "unverified"
- Confidence score from 0 to 100
- One-line explanation
Respond in JSON format like:
{
  "status": "verified",
  "confidence": 92,
  "explanation": "The data clearly confirms that X is Y."
}
`;

  const verdictRaw = await callGemini(resultPrompt);
  const cleanedVerdict = verdictRaw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let verdict;
  try {
    verdict = JSON.parse(cleanedVerdict);
  } catch (e) {
    console.error(
      "Error parsing Gemini verdict:",
      e,
      "\nGemini raw response:",
      verdictRaw
    );
    return {
      verified: false,
      confidence: 0,
      explanation: "Could not parse Gemini verdict.",
      source: "Wikidata",
    };
  }

  return {
    verified: verdict.status === "verified",
    confidence: verdict.confidence,
    explanation: verdict.explanation,
    source: "Wikidata",
  };
}
