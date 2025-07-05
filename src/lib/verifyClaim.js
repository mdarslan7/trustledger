import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function callGemini(prompt) {
  const chat = model.startChat({
    // add history later
  });
  const result = await chat.sendMessage(prompt);
  const response = await result.response.text();
  return response;
}

export async function verifyClaim(claim) {
  // extract structured components from the claim
  const extractionPrompt = `
Analyze this claim and extract its key components for Wikidata verification:

CLAIM: "${claim}"

Extract the following in JSON format:
{
  "subject": "the main entity being described",
  "property": "the relationship or property being claimed",
  "object": "the target entity or value",
  "query_direction": "which entity should be queried (subject or object)",
  "reasoning": "brief explanation of your analysis",
  "wikidata_property": "Wikidata property code (e.g., P36 for capital)",
  "subject_entity": "Wikidata Q-ID if known (e.g., Q312 for Apple)",
  "object_entity": "Wikidata Q-ID if known (e.g., Q19837 for Steve Jobs)"
}

GUIDANCE:
- For "X is the capital of Y" → query Y (the country) to check its capital
- For "X was born in Y" → query X (the person) to check birthplace  
- For "X founded/created Y" → query Y (the company) to check its founder
- For "X died in Y" → query X to check place of death

COMMON WIKIDATA ENTITIES:
- Apple Inc: Q312
- Microsoft: Q2283  
- Google: Q95
- Steve Jobs: Q19837
- Bill Gates: Q5284
- Albert Einstein: Q937
- Japan: Q17
- India: Q668
- Germany: Q183
- USA: Q30
- France: Q142
- UK: Q145
- Tokyo: Q1490
- New Delhi: Q987
- Paris: Q90
- Berlin: Q64
- London: Q84

COMMON PROPERTIES:
- P36 = capital
- P112 = founded by/founder
- P19 = place of birth
- P20 = place of death
- P17 = country
- P27 = country of citizenship
- P106 = occupation

EXAMPLES:
Claim: "Tokyo is the capital of Japan"
{
  "subject": "Tokyo",
  "property": "capital of",
  "object": "Japan", 
  "query_direction": "object",
  "reasoning": "We should query Japan to check if its capital is Tokyo",
  "wikidata_property": "P36",
  "subject_entity": "Q1490",
  "object_entity": "Q17"
}

Claim: "Steve Jobs founded Apple"
{
  "subject": "Steve Jobs",
  "property": "founded",
  "object": "Apple",
  "query_direction": "object", 
  "reasoning": "We should query Apple to check who founded it",
  "wikidata_property": "P112",
  "subject_entity": "Q19837",
  "object_entity": "Q312"
}

Respond with ONLY the JSON, no other text:
`;

  let extractionRaw = await callGemini(extractionPrompt);
  extractionRaw = extractionRaw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let extraction;
  try {
    extraction = JSON.parse(extractionRaw);
    console.log("Claim extraction:", extraction);
  } catch (e) {
    console.error(
      "Error parsing claim extraction:",
      e,
      "\nRaw response:",
      extractionRaw
    );
    return {
      verified: false,
      confidence: 0,
      explanation: "Could not parse claim structure.",
      source: "Wikidata",
    };
  }

  // SPARQL query 
  const queryPrompt = `
Generate a simple Wikidata SPARQL query to verify this claim:

CLAIM: "${claim}"

EXTRACTED COMPONENTS:
- Subject: ${extraction.subject}
- Property: ${extraction.property}  
- Object: ${extraction.object}
- Query Direction: ${extraction.query_direction}
- Property Code: ${extraction.wikidata_property || "unknown"}

INSTRUCTIONS:
1. Generate a simple SELECT query that finds the relationship
2. Use the format: SELECT ?value ?valueLabel WHERE { ... }
3. Query the entity from "query_direction" field
4. Include SERVICE wikibase:label for readable results
5. Do NOT use FILTER statements - let the results speak for themselves

EXAMPLES:

For "Tokyo is the capital of Japan":
SELECT ?capital ?capitalLabel WHERE {
  wd:Q17 wdt:P36 ?capital .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}

For "Steve Jobs founded Apple":
SELECT ?founder ?founderLabel WHERE {
  wd:Q312 wdt:P112 ?founder .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}

For "Einstein was born in Germany":
SELECT ?birthplace ?birthplaceLabel WHERE {
  wd:Q937 wdt:P19 ?birthplace .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}

COMMON ENTITIES (use these if you recognize them):
- Japan: wd:Q17
- Germany: wd:Q183  
- Apple Inc: wd:Q312
- Steve Jobs: wd:Q19837
- Einstein: wd:Q937
- India: wd:Q668
- New Delhi: wd:Q987
- USA: wd:Q30
- France: wd:Q142
- Tokyo: wd:Q1490

COMMON PROPERTIES:
- P36 = capital
- P112 = founded by
- P19 = place of birth
- P20 = place of death
- P17 = country

Generate ONLY the SPARQL query, no explanatory text:
`;

  let query = await callGemini(queryPrompt);
  query = query
    .replace(/```sparql/g, "")
    .replace(/```/g, "")
    .trim();
  console.log("Generated SPARQL Query:", query);

  // wikidata Query Service
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
    console.log("Wikidata response:", data);
    console.log("Number of results:", data.results.bindings.length);
  } catch (error) {
    console.error("Error fetching from Wikidata:", error);
    return {
      verified: false,
      confidence: 0,
      explanation: "Could not fetch data from Wikidata.",
      source: "Wikidata",
    };
  }

  const results = data.results.bindings;
  if (results.length === 0) {
    console.log("No results found in Wikidata for query:", query);
    return {
      verified: false,
      confidence: 15,
      explanation:
        "No supporting evidence found in Wikidata database for this claim. This could mean the claim is false or the entities are not well-documented in Wikidata.",
      source: "Wikidata",
    };
  }

  // log some sample results for debugging
  console.log("Sample Wikidata results:", results.slice(0, 3));

  const resultPrompt = `
You are verifying the claim: "${claim}"

We extracted these components:
- Subject: ${extraction.subject}
- Property: ${extraction.property}
- Object: ${extraction.object}

We received the following evidence from Wikidata:

${JSON.stringify(results.slice(0, 5), null, 2)}

TASK: Analyze if this evidence supports or contradicts the original claim.

GUIDELINES:
- Look for direct matches between the claim and the evidence
- Consider partial matches and semantic equivalence
- Be conservative: if evidence is unclear, lean towards lower confidence
- Higher confidence (80-95) only for clear, direct matches
- Medium confidence (50-75) for reasonable but not perfect matches  
- Lower confidence (10-40) for weak or contradictory evidence

Respond in JSON format:
{
  "status": "verified" or "unverified",
  "confidence": [0-100 integer],
  "explanation": "Brief explanation based on the evidence analysis"
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
