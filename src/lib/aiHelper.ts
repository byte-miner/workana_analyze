import OpenAI from "openai";
import {
  coreFacts,
  feeStructure,
  countryRankings,
  competitors,
  skillEqualization,
  registeredCountries,
  uniqueRegisteredCountryNames,
} from "@/data/workanaData";
import {
  activePlatformCountryCount,
  platformRegionCounts,
  activePlatformCountries,
} from "@/data/workanaActiveCountries";
import { fetchWorkanaHelpContext, findLocalAnswer } from "./workanaHelp";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildResearchContext(): string {
  const regCountries = uniqueRegisteredCountryNames(registeredCountries);
  const topCountries = countryRankings.slice(0, 10);
  const primaryMarkets = activePlatformCountries
    .filter((c) => c.tier === "primary")
    .map((c) => c.country)
    .join(", ");
  const majorMarkets = activePlatformCountries
    .filter((c) => c.tier === "major")
    .slice(0, 12)
    .map((c) => c.country)
    .join(", ");

  return `
PLATFORM RESEARCH (internal market data):
- Founded: ${coreFacts.founded} in ${coreFacts.foundedIn}
- User base: ${coreFacts.userBase.freelancers}, ${coreFacts.userBase.monthlyProjects}
- Mission: ${coreFacts.mission}

FEE STRUCTURE:
- Clients: ${feeStructure.clients.summary}
- Freelancers: ${feeStructure.freelancers.tiers.map((t) => `${t.rate} on ${t.range}`).join("; ")}

TOP COUNTRIES BY TRAFFIC:
${topCountries.map((c) => `${c.rank}. ${c.country} — ${c.shareLabel} (${c.role})`).join("\n")}

SKILL EQUALIZATION: ${skillEqualization.summary}

COMPETITORS:
${competitors.map((c) => `${c.name}: ${c.focus} | Fees: ${c.fees}`).join("\n")}

REGISTERED COUNTRIES (${regCountries.length}): ${regCountries.join(", ")}

ACTIVE PLATFORM COUNTRIES (${activePlatformCountryCount}):
Regions: ${platformRegionCounts.map((r) => `${r.region}: ${r.count}`).join(", ")}
Primary: ${primaryMarkets}
Major: ${majorMarkets}
`.trim();
}

function trimHistory(history: ChatMessage[]): ChatMessage[] {
  const firstUser = history.findIndex((m) => m.role === "user");
  const relevant = firstUser >= 0 ? history.slice(firstUser) : history;
  return relevant.slice(-4);
}

function buildSystemPrompt(helpContext: string, researchContext: string): string {
  return `You are a friendly, knowledgeable Workana guide.

Answer using the help center content and platform research below. Be concise: 2–3 short paragraphs max. Use bullets only for fees or steps. Never invent policies or URLs.

HELP CENTER:
${helpContext}

RESEARCH:
${researchContext}`;
}

export async function generateAiHelperReply(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<{ reply: string; sources: string[] }> {
  const local = findLocalAnswer(userMessage);
  if (local) return local;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Add it to your .env.local file.");
  }

  const [helpContext, researchContext] = await Promise.all([
    fetchWorkanaHelpContext(userMessage),
    Promise.resolve(buildResearchContext()),
  ]);

  const sources = extractSources(helpContext);
  const openai = new OpenAI({ apiKey });
  const recentHistory = trimHistory(history);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 450,
    messages: [
      { role: "system", content: buildSystemPrompt(helpContext, researchContext) },
      ...recentHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ],
  });

  const reply =
    response.choices[0]?.message?.content?.trim() ||
    "Sorry, I couldn't put together an answer right now. Could you try rephrasing your question?";

  return { reply, sources };
}

export async function* streamAiHelperReply(
  userMessage: string,
  history: ChatMessage[] = []
): AsyncGenerator<{ type: "token"; text: string } | { type: "done"; sources: string[] }> {
  const local = findLocalAnswer(userMessage);
  if (local) {
    yield { type: "token", text: local.reply };
    yield { type: "done", sources: local.sources };
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Add it to your .env.local file.");
  }

  const [helpContext, researchContext] = await Promise.all([
    fetchWorkanaHelpContext(userMessage),
    Promise.resolve(buildResearchContext()),
  ]);

  const sources = extractSources(helpContext);
  const openai = new OpenAI({ apiKey });
  const recentHistory = trimHistory(history);

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 450,
    stream: true,
    messages: [
      { role: "system", content: buildSystemPrompt(helpContext, researchContext) },
      ...recentHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield { type: "token", text };
  }

  yield { type: "done", sources };
}

function extractSources(helpContext: string): string[] {
  const sourceMatches = helpContext.match(/Source: (https:\/\/[^\n]+)/g) || [];
  return [...new Set(sourceMatches.map((s) => s.replace("Source: ", "")))];
}
