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

    // ✅ Strong prompt (improved)
    const prompt = `
You are a strict code reviewer.

Return ONLY valid JSON. No extra text.

Format:
{
  "bugs": ["list ALL bugs including syntax errors"],
  "suggestions": ["short improvements"],
  "explanation": "2-3 lines max"
}

Rules:
- ALWAYS report syntax errors
- DO NOT repeat bugs
- DO NOT hallucinate
- DO NOT use markdown
- Keep output concise

Code:
${code}
`;

    // ✅ API call
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const raw = response.data.choices[0].message.content;
    console.log("Raw AI Response:", raw);

    // ✅ Clean response
    let cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/`/g, "")
      .trim();

    // ✅ Extract JSON safely (non-greedy)
    const match = cleaned.match(/\{[\s\S]*?\}/);

    let parsed;

    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch (err) {
        parsed = null;
      }
    }

    // ✅ Fallback if parsing fails
    if (!parsed || typeof parsed !== "object") {
      parsed = {
        bugs: ["AI parsing failed"],
        suggestions: ["Try again or reduce input size"],
        explanation: cleaned.slice(0, 200),
      };
    }

    // ✅ SANITIZE OUTPUT (VERY IMPORTANT)
    const bugs = Array.isArray(parsed.bugs)
      ? [...new Set(parsed.bugs)].slice(0, 10)
      : [];

    const suggestions = Array.isArray(parsed.suggestions)
      ? [...new Set(parsed.suggestions)].slice(0, 10)
      : [];

    const explanation =
      typeof parsed.explanation === "string"
        ? parsed.explanation.slice(0, 200)
        : "";

    // ✅ Final response
    res.json({
      bugs,
      suggestions,
      explanation,
    });
  } catch (error) {
    console.error("GROQ ERROR:", error.response?.data || error.message);

    res.json({
      bugs: ["AI service unavailable"],
      suggestions: ["Check code manually"],
      explanation: "Fallback response used",
    });
  }
};
