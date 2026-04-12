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

Return ONLY valid JSON. No explanation outside JSON.

Format:
{
  "bugs": ["list ALL bugs including syntax errors"],
  "suggestions": ["short improvements"],
  "explanation": "2-3 lines max"
}

Rules:
- ALWAYS report syntax errors
- DO NOT add extra text
- DO NOT use markdown

Code:
${code}
`;

    // ✅ Groq API call (FINAL FIX)
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const text = response.data.choices[0].message.content;

    console.log("Raw AI Response:", text);

    // ✅ Clean response
    let cleanedText = text.trim();

    cleanedText = cleanedText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/`/g, "")
      .trim();

    // ✅ Extract JSON safely
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

    // ✅ Final response
    res.json({
      bugs: parsed.bugs || [],
      suggestions: parsed.suggestions || [],
      explanation: parsed.explanation || "",
    });
  } catch (error) {
    console.error("GROQ ERROR:", error.response?.data || error.message);

    // ✅ fallback (important)
    res.json({
      bugs: ["AI service unavailable"],
      suggestions: ["Check code manually"],
      explanation: "Fallback response used",
    });
  }
};
