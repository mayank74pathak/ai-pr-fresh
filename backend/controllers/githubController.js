import axios from "axios";

export const handleWebhook = async (req, res) => {
  console.log("Webhook received");

  const event = req.headers["x-github-event"];

  // ✅ Only handle PR events
  if (event !== "pull_request") {
    return res.sendStatus(200);
  }

  const action = req.body.action;

  // ✅ Only trigger on new PR or updates
  if (action !== "opened" && action !== "synchronize") {
    return res.sendStatus(200);
  }

  try {
    const pr = req.body.pull_request;

    console.log("PR URL:", pr.url);
    console.log("Comments URL:", pr.comments_url);

    // ✅ Fetch changed files
    const filesRes = await axios.get(pr.url + "/files", {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    console.log("Files fetched ✅");

    let code = "";

    filesRes.data.forEach((file) => {
      // ✅ Only process JS files (avoid noise like .pem, config, etc.)
      if (!file.filename.endsWith(".js")) return;

      if (!file.patch) return;

      // 🔥 CLEAN PATCH (IMPORTANT)
      const cleanPatch = file.patch
        .split("\n")
        .filter(
          (line) =>
            line.startsWith("+") && // only added lines
            !line.startsWith("+++") && // skip metadata
            !line.includes("import axios"), // optional: remove noise
        )
        .map((line) => line.substring(1)) // remove '+'
        .join("\n");

      if (cleanPatch.trim().length === 0) return;

      code += `\n\nFile: ${file.filename}\n${cleanPatch}`;
    });

    // ❌ If no valid code found
    if (!code.trim()) {
      console.log("No valid code to review");
      return res.sendStatus(200);
    }

    // 🔥 Limit size (avoid token overflow)
    code = code.slice(0, 4000);

    // ✅ Call AI reviewer (same server)
    const aiRes = await axios.post("http://localhost:5001/api/review", {
      code,
    });

    const { bugs = [], suggestions = [], explanation = "" } = aiRes.data;

    // ✅ Build clean comment
    const comment = `
## 🤖 AI Code Review

### 🐞 Bugs
${bugs.length ? bugs.map((b) => `- ${b}`).join("\n") : "No major bugs found ✅"}

### 💡 Suggestions
${suggestions.length ? suggestions.map((s) => `- ${s}`).join("\n") : "No suggestions"}

### 📘 Summary
${explanation || "Code looks fine"}
`;

    // ✅ Post comment on PR
    await axios.post(
      pr.comments_url,
      { body: comment },
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      },
    );

    console.log("Comment posted ✅");

    res.sendStatus(200);
  } catch (err) {
    console.error("STATUS:", err.response?.status);
    console.error("DATA:", err.response?.data);
    console.error("MESSAGE:", err.message);

    res.sendStatus(500);
  }
};
