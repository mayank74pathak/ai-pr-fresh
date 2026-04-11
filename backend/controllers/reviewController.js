import axios from "axios";

export const reviewCode = async (req, res) => {
  try {
    console.log("Incoming:", req.body);

    const { code } = req.body;

    // ✅ Input validation
    if (!code) {
      return res.status(400).json({
        bugs: ["No code provided"],
        suggestions: [],
        explanation: "Please provide code to review",
      });
    }

    // ✅ Strong prompt
    const prompt = `
You are a strict code reviewer.

Analyze the code carefully.

Respond ONLY in valid JSON format:

{
  "bugs": ["list ALL bugs including syntax errors"],
  "suggestions": ["short improvements"],
  "explanation": "2-3 lines max"
}

Rules:
- ALWAYS report syntax errors if present
- NEVER say "no bugs" if code is invalid
- Return ONLY raw JSON
- No markdown or extra text
- Keep response short

Code:
${code}
`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 200,
        },
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
      },
    );

    const text = response.data.candidates[0].content.parts[0].text;

    console.log("Raw AI Response:", text);

    // ✅ Clean response
    let cleanedText = text.trim();

    // 🔥 Remove markdown + backticks
    cleanedText = cleanedText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/`/g, "")
      .trim();

    // 🔥 Extract JSON safely
    const match = cleanedText.match(/\{[\s\S]*\}/);

    if (match) {
      cleanedText = match[0];
    }

    console.log("Final Cleaned:", cleanedText);

    let parsed;

    try {
      parsed = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Parse failed:", cleanedText);

      parsed = {
        bugs: ["Parsing error: invalid AI response"],
        suggestions: [],
        explanation: cleanedText,
      };
    }

    // ✅ Send response to frontend
    res.json({
      bugs: parsed.bugs || [],
      suggestions: parsed.suggestions || [],
      explanation: parsed.explanation || "",
    });
  } catch (error) {
    console.error("Error:", error.message);

    res.status(500).json({
      bugs: ["Server error"],
      suggestions: [],
      explanation: "Error reviewing code",
    });
  }
};
