import { defineTool } from "eve/tools";
import fs from "node:fs";
import path from "node:path";

/**
 * Image understanding via a local Ollama vision model.
 *
 * Calls the Ollama `/api/chat` endpoint with the configured image model
 * (default `gemma4:31b-cloud`) and returns the model's description.
 *
 * Accepts either a local file path or a base64 data URL.
 */
export default defineTool({
  description:
    "Analyze an image using the local Ollama vision model. Provide a local file path or a base64 data URL.",
  inputSchema: {
    additionalProperties: false,
    properties: {
      image: {
        description:
          "Absolute local file path to an image, or a base64 data URL (data:image/...;base64,...).",
        type: "string",
      },
      prompt: {
        default: "Describe this image in detail.",
        description: "What to ask the vision model about the image.",
        type: "string",
      },
    },
    required: ["image"],
    type: "object",
  },
  async execute(input: { image: string; prompt: string }) {
    const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    const model = process.env.OLLAMA_IMAGE_MODEL ?? "gemma4:31b-cloud";
    const apiKey = process.env.OLLAMA_API_KEY;

    let imageBase64: string;
    if (input.image.startsWith("data:")) {
      const commaIndex = input.image.indexOf(",");
      imageBase64 =
        commaIndex === -1 ? input.image : input.image.slice(commaIndex + 1);
    } else {
      const filePath = path.resolve(input.image);
      if (!fs.existsSync(filePath)) {
        return { error: `Image file not found: ${filePath}` };
      }
      imageBase64 = fs.readFileSync(filePath).toString("base64");
    }

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (apiKey) {
      headers.authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: input.prompt,
            images: [imageBase64],
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        error: `Ollama vision request failed: ${response.status} ${response.statusText}${body ? ` — ${body}` : ""}`,
      };
    }

    const data = (await response.json()) as {
      message?: { content?: string };
    };

    return {
      model,
      description: data.message?.content ?? "",
    };
  },
});
