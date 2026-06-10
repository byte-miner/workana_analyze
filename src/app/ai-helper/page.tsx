"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import { SiteLayout } from "@/components/SiteLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WorkanaBotAvatar } from "@/components/WorkanaBotAvatar";
import { aiHelperQuestions } from "@/data/workanaData";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
}

export default function AiHelperPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hey there! 👋 I'm your Workana guide. Ask me about fees, payments, projects, countries, or anything from the official help center — I'll pull the latest info and explain it in plain language.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setLoading(true);
    setInput("");

    const userMsg: Message = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();

    const history = [...messages, userMsg]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    try {
      const res = await fetch("/api/ai-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history, stream: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";
      let sources: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6)) as
            | { type: "token"; text: string }
            | { type: "done"; sources: string[] }
            | { type: "error"; message: string };

          if (payload.type === "error") throw new Error(payload.message);
          if (payload.type === "token") {
            reply += payload.text;
            const next = reply;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", text: next, sources };
              return copy;
            });
            scrollToBottom();
          }
          if (payload.type === "done") {
            sources = payload.sources;
          }
        }
      }

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          text: reply || "Sorry, I couldn't put together an answer right now.",
          sources,
        };
        return copy;
      });
      scrollToBottom();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          text: "Hmm, I hit a snag fetching that answer. Double-check that OPENAI_API_KEY is set in .env.local and try again.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <Breadcrumbs items={[{ label: "AI Helper" }]} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <WorkanaBotAvatar size={48} />
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #7246E5, #BEA5FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI Helper
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Powered by OpenAI · answers sourced from help.workana.com
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: { xs: 420, sm: 520 },
          border: 1,
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            bgcolor: "grey.50",
          }}
        >
          {messages.map((msg, i) => {
            const isStreamingPlaceholder =
              loading && i === messages.length - 1 && msg.role === "assistant" && !msg.text;

            return (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: 1,
              }}
            >
              {msg.role === "assistant" && <WorkanaBotAvatar />}
              <Box sx={{ maxWidth: "85%" }}>
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: msg.role === "user" ? "primary.main" : "background.paper",
                    color: msg.role === "user" ? "primary.contrastText" : "text.primary",
                    border: msg.role === "assistant" ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  {isStreamingPlaceholder ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {msg.text}
                    </Typography>
                  )}
                </Paper>
              </Box>
              {msg.role === "user" && (
                <PersonIcon sx={{ color: "primary.main", mt: 0.5, fontSize: 20 }} />
              )}
            </Box>
            );
          })}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            sx={{ display: "flex", gap: 1 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about Workana fees, payments, projects…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
                "&.Mui-disabled": { bgcolor: "grey.300" },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" color="primary.dark" gutterBottom>
          Suggested questions
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {aiHelperQuestions.map((item) => (
            <Chip
              key={item.question}
              label={item.question}
              variant="outlined"
              size="small"
              clickable
              disabled={loading}
              onClick={() => sendMessage(item.question)}
              sx={{
                maxWidth: "100%",
                height: "auto",
                "& .MuiChip-label": { whiteSpace: "normal", py: 0.75 },
              }}
            />
          ))}
        </Box>
      </Box>
    </SiteLayout>
  );
}
