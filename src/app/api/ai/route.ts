// src/app/api/ai/route.ts
import { NextRequest } from "next/server";
import { openai } from "@/lib/ai";
import { toolSpecs, runToolCall, ToolCall } from "@/lib/tools";

export const runtime = "nodejs";

// Util centralizado: escreve evento SSE
function sseEvent(name: string, data: any) {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    messages = [],
    stream = true,
    verbosity = "low",
    reasoning_effort = "minimal",
    temperature = 0.2,
    directTool,
  } = body ?? {};

  // --- CAMINHO NOVO: chamada direta de tool ---
  if (directTool?.name && typeof directTool.name === "string") {
    let toolArgs = {};
    if (directTool.args && typeof directTool.args === "object") {
      toolArgs = directTool.args;
    }

    const call: ToolCall = {
      id: "direct-1",
      type: "function",
      function: {
        name: directTool.name,
        arguments: JSON.stringify(toolArgs),
      },
    };

    try {
      const result = await runToolCall(call);

      try {
        const parsed = JSON.parse(result.content);
        return Response.json(parsed, { status: 200 });
      } catch {
        return Response.json(result.content, { status: 200 });
      }
    } catch (err: any) {
      return Response.json(
        { error: true, message: err?.message ?? "Erro ao executar ferramenta" },
        { status: 500 }
      );
    }
  }

  // --- Fluxo padrão (sem streaming) ---
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: true, message: "messages vazias" },
      { status: 400 }
    );
  }

  if (!stream) {
    const final = await solveWithTools(messages, {
      temperature,
      verbosity,
      reasoning_effort,
    });
    return Response.json(final, { status: 200 });
  }

  // --- STREAMING via SSE ---
  const streamResp = new ReadableStream({
    start: async (controller) => {
      try {
        controller.enqueue(sseEvent("status", { stage: "start" }));

        const final = await solveWithTools(
          messages,
          { temperature, verbosity, reasoning_effort },
          controller
        );

        controller.enqueue(sseEvent("assistant.message", final));
        controller.enqueue(sseEvent("status", { stage: "done" }));
        controller.close();
      } catch (err: any) {
        controller.enqueue(
          sseEvent("error", { message: err?.message ?? "Erro inesperado" })
        );
        controller.close();
      }
    },
  });

  return new Response(streamResp, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// Loop de tool-calling com até 4 iterações
async function solveWithTools(
  messages: Array<{
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    name?: string;
    tool_call_id?: string;
  }>,
  opts: {
    temperature: number;
    verbosity: "low" | "medium" | "high";
    reasoning_effort: "minimal" | "medium" | "high";
  },
  controller?: ReadableStreamDefaultController
) {
  const { temperature, verbosity, reasoning_effort } = opts;
  const localMsgs = [...messages];

  for (let round = 0; round < 4; round++) {
    const resp = await openai.chat.completions.create({
      model: "gpt-5-chat-latest",
      temperature,
      messages: localMsgs as any,
      tools: toolSpecs as any,
      tool_choice: "auto",
      // @ts-ignore
      verbosity,
      // @ts-ignore
      reasoning_effort,
    });

    const choice = resp.choices[0];
    const msg = choice.message;

    if (msg?.tool_calls?.length) {
      const calls = msg.tool_calls as unknown as ToolCall[];

      if (controller) {
        controller.enqueue(
          sseEvent("assistant.tool_calls", {
            count: calls.length,
            calls: calls.map((c) => ({ name: c.function.name, id: c.id })),
          })
        );
      }

      localMsgs.push({
        role: "assistant",
        content: msg.content ?? "",
        ...msg,
      } as any);

      for (const c of calls) {
        if (controller) {
          controller.enqueue(
            sseEvent("tool.call", {
              id: c.id,
              name: c.function.name,
              args: JSON.parse(c.function.arguments || "{}"),
            })
          );
        }

        try {
          const result = await runToolCall(c);

          localMsgs.push({
            role: "tool",
            content: result.content,
            name: result.name,
            tool_call_id: result.tool_call_id,
          } as any);

          if (controller) {
            controller.enqueue(
              sseEvent("tool.result", {
                id: result.tool_call_id,
                name: result.name,
                content: JSON.parse(result.content),
              })
            );
          }
        } catch (err: any) {
          if (controller) {
            controller.enqueue(
              sseEvent("tool.error", {
                id: c.id,
                name: c.function.name,
                message: err?.message ?? "Erro ao executar tool",
              })
            );
          }
        }
      }
      continue; // volta para nova rodada
    }

    return { role: "assistant", content: msg?.content ?? "" };
  }

  return {
    role: "assistant",
    content:
      "Limite de iterações de ferramentas atingido. Verifique dependências (Tabela K / SINAPI).",
  };
}
