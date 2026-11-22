import { whatsappConfig } from "./config";

/**
 * Chat completions on Amazon Bedrock's OpenAI-compatible endpoint
 * (bedrock-mantle), authenticated with a Bedrock API key. Works with any
 * model Bedrock serves there; the bot uses a Qwen model by default.
 */

export type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type ToolDefinition = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

export type Completion = {
  message: Extract<ChatMessage, { role: "assistant" }>;
  finishReason: string;
};

const TIMEOUT_MS = 60_000;

async function post(body: unknown): Promise<Response> {
  const url = `https://bedrock-mantle.${whatsappConfig.awsRegion()}.api.aws/v1/chat/completions`;
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AWS_BEARER_TOKEN_BEDROCK ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

export async function chatCompletion(messages: ChatMessage[], tools: ToolDefinition[]): Promise<Completion> {
  const body = { model: whatsappConfig.model(), max_tokens: 2000, messages, tools };

  let res = await post(body);
  // One retry for rate limits and server errors.
  if (res.status === 429 || res.status >= 500) {
    await new Promise((r) => setTimeout(r, 2000));
    res = await post(body);
  }
  if (!res.ok) {
    throw new Error(`Bedrock ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { finish_reason?: string; message?: { content?: string | null; tool_calls?: ToolCall[] } }[];
  };
  const choice = data.choices?.[0];
  if (!choice?.message) throw new Error("Bedrock returned no message");

  const toolCalls = choice.message.tool_calls?.filter((t) => t?.function?.name);
  return {
    message: {
      role: "assistant",
      // Some Qwen builds wrap reasoning in <think> tags; customers should never see it.
      content: choice.message.content?.replace(/<think>[\s\S]*?<\/think>/g, "").trim() || null,
      ...(toolCalls?.length ? { tool_calls: toolCalls } : {}),
    },
    finishReason: choice.finish_reason ?? "stop",
  };
}
