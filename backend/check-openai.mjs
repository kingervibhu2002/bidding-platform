import { readFile } from "node:fs/promises";

async function loadEnvFile() {
  try {
    const contents = await readFile(new URL("../.env", import.meta.url), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
      if (!match || match[1] in process.env) continue;

      let value = (match[2] ?? "").trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, "");
      }
      process.env[match[1]] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

await loadEnvFile();

const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) {
  console.error("OPENAI_API_KEY is missing. Set it in the environment or in the project .env file.");
  process.exit(1);
}

const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
let response;
try {
  response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: "Reply with exactly: OpenAI connection works.",
      max_output_tokens: 40,
    }),
  });
} catch (error) {
  console.error(`Could not reach the OpenAI API: ${error.message}`);
  process.exit(1);
}

const payload = await response.json().catch(() => ({}));
if (!response.ok) {
  const message = payload.error?.message || `HTTP ${response.status}`;
  console.error(`OpenAI API request failed (${response.status}): ${message}`);
  process.exit(1);
}

const answer = payload.output
  ?.flatMap((item) => item.content ?? [])
  .filter((item) => item.type === "output_text")
  .map((item) => item.text)
  .join("\n")
  .trim();

if (!answer) {
  console.error("OpenAI returned a successful response without text output.");
  process.exit(1);
}

console.log(`OpenAI API responded successfully (model: ${payload.model ?? model}).`);
console.log(`Answer: ${answer}`);
