import axios from "axios";

export const handleWebhook = async (req, res) => {
  console.log("Webhook received");

  const event = req.headers["x-github-event"];

  if (event !== "pull_request") {
    return res.sendStatus(200);
  }

  const action = req.body.action;

  if (action !== "opened" && action !== "synchronize") {
    return res.sendStatus(200);
  }

  try {
    const pr = req.body.pull_request;
    console.log("PR URL:", pr.url); // ← ADD
    console.log("Comments URL:", pr.comments_url); // ← ADD

    // ✅ Get changed files
    const files = await axios.get(pr.url + "/files", {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });
    console.log("Files fetched ✅");
    let code = "";

    files.data.forEach((file) => {
      if (file.patch) {
        code += `\n\nFile: ${file.filename}\n${file.patch}`;
      }
    });

    // 🔥 Limit size (important)
    code = code.slice(0, 5000);

    // ✅ Call your AI reviewer
    const aiRes = await axios.post("http://localhost:5001/api/review", {
      code,
    });

    const { bugs, suggestions, explanation } = aiRes.data;

    const comment = `
## 🤖 AI Code Review

### 🐞 Bugs
${bugs.map((b) => `- ${b}`).join("\n")}

### 💡 Suggestions
${suggestions.map((s) => `- ${s}`).join("\n")}

### 📘 Summary
${explanation}
`;

    // ✅ Post comment on PR
    await axios.post(
      pr.comments_url,
      { body: comment },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      },
    );

    console.log("Comment posted ✅");

    res.sendStatus(200);
  } catch (err) {
    console.error("Error:", err.message);
    res.sendStatus(500);
  }
};
