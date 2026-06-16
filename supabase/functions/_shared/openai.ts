type OpenAiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callOpenAiJson<T>(messages: OpenAiMessage[]): Promise<T> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY saknas i edge function secrets.");
  }

  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI text request failed: ${errorText}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("OpenAI returnerade inget giltigt svar.");
  }

  return JSON.parse(content) as T;
}

export async function generateCoverImage(prompt: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY saknas i edge function secrets.");
  }

  const model = Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-2";

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1536x1024",
      quality: "medium",
      n: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI image request failed: ${errorText}`);
  }

  const payload = await response.json();
  const imageBase64 = payload.data?.[0]?.b64_json;

  if (!imageBase64 || typeof imageBase64 !== "string") {
    throw new Error("OpenAI returnerade ingen bild.");
  }

  const binary = Uint8Array.from(atob(imageBase64), (char) => char.charCodeAt(0));

  return {
    bytes: binary,
    contentType: "image/png",
    extension: "png",
  };
}
