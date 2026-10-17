import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronRight,
  Database,
  BarChart2,
  Info,
  Layers,
  Table as TableIcon,
  Download,
} from "lucide-react";
import { Dataset, AnalyticsKPIs, ChatMessage } from "../types";
import { RagService } from "../services/ragService";
import { SqlEngine } from "../services/sqlEngine";
import { DataChart } from "./DataChart";

interface AIAnalystProps {
  activeDataset: Dataset | null;
  computedKPIs: AnalyticsKPIs | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
  onNavigateUpload: () => void;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({
  activeDataset,
  computedKPIs,
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  onNavigateUpload,
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const starterPrompts = [
    "Summarize my dataset.",
    "Calculate total revenue and profit.",
    "Which products perform best?",
    "Compare sales by month.",
    "Find missing values and data-quality issues.",
    "Identify unusual trends.",
    "Generate a chart from my data.",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText("");
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = () => {
    const formatted = messages
      .map((m) => `### ${m.role === "user" ? "USER" : "DATAHARVEST AI"}\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([formatted], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataharvest_analysis_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-6xl mx-auto bg-white border border-[#DCE6DA] rounded-2xl shadow-xs overflow-hidden">
      {/* Top Header of Chat */}
      <div className="px-5 py-3.5 border-b border-[#DCE6DA] bg-[#FAFBF7] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] text-[#174D32] flex items-center justify-center border border-[#72C84A]/30">
            <Bot className="w-5 h-5 text-[#26834A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#103B29]">AI Data Analyst</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#E8F5E9] text-[#174D32] font-semibold">
                Gemini 3.8 + Verified Math
              </span>
            </div>
            <p className="text-[11px] text-[#657267]">
              {activeDataset
                ? `Analyzing '${activeDataset.name}' (${activeDataset.rowCount} rows)`
                : "No dataset active — General analytics & SQL assist mode"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleExportChat}
                className="px-2.5 py-1.5 rounded-md text-xs text-[#657267] hover:text-[#174D32] hover:bg-[#E8F5E9] transition-colors flex items-center gap-1.5 border border-[#DCE6DA]"
                title="Export conversation as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Analysis</span>
              </button>

              <button
                onClick={onClearChat}
                className="p-1.5 rounded-md text-xs text-[#657267] hover:text-[#C43D3D] hover:bg-[#C43D3D]/10 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#26834A] flex items-center justify-center mb-3 border border-[#72C84A]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#103B29]">
              How can I assist your data decisions today?
            </h3>
            <p className="text-xs text-[#657267] mt-1.5 leading-relaxed">
              Ask natural language questions about your business metrics, profit margins, anomalies, or SQL queries. Every calculation is verified against the underlying dataset records.
            </p>

            {/* Quick Starter Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-6">
              {starterPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(prompt)}
                  className="p-2.5 rounded-xl bg-[#FAFBF7] hover:bg-[#E8F5E9] border border-[#DCE6DA] hover:border-[#72C84A]/50 text-xs text-[#202820] text-left transition-all group flex items-center justify-between"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <span className="text-[#657267] group-hover:text-[#174D32] text-xs font-bold">
                    →
                  </span>
                </button>
              ))}
            </div>

            {!activeDataset && (
              <div className="mt-6 p-3 rounded-lg bg-[#FAFBF7] border border-[#DCE6DA] text-xs text-[#657267]">
                <span>Tip: </span>
                <button
                  onClick={onNavigateUpload}
                  className="text-[#174D32] font-semibold underline hover:text-[#26834A]"
                >
                  Upload your own CSV/XLSX
                </button>{" "}
                or use our demo dataset for comprehensive KPI tests.
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-[#174D32] text-[#A5E86A] flex items-center justify-center shrink-0 border border-[#72C84A]/40 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#174D32] text-white rounded-tr-xs"
                    : "bg-[#FAFBF7] text-[#202820] border border-[#DCE6DA] rounded-tl-xs shadow-xs"
                }`}
              >
                {/* Message Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* KPI Badges if present */}
                {msg.computedKPIs && msg.computedKPIs.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-[#DCE6DA]">
                    {msg.computedKPIs.map((kpi, kIdx) => (
                      <div
                        key={kIdx}
                        className="bg-white p-2.5 rounded-lg border border-[#DCE6DA] shadow-xs"
                      >
                        <div className="text-[10px] text-[#657267] truncate">{kpi.label}</div>
                        <div className="text-sm font-bold text-[#103B29] font-mono tabular-nums mt-0.5">
                          {kpi.value}
                        </div>
                        {kpi.formula && (
                          <div className="text-[9px] text-[#26834A] truncate font-mono mt-0.5">
                            {kpi.formula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Plotly Chart if suggested */}
                {msg.chartConfig && (
                  <div className="mt-4">
                    <DataChart
                      title={msg.chartConfig.title}
                      type={msg.chartConfig.type}
                      xData={msg.chartConfig.x}
                      yData={msg.chartConfig.y}
                      height={260}
                    />
                  </div>
                )}

                {/* Expandable SQL & Verification Details */}
                {msg.sqlDetails && (
                  <div className="mt-4 border border-[#DCE6DA] rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => toggleSection(msg.id + "_sql")}
                      className="w-full px-3 py-2 bg-[#F4F8F1] flex items-center justify-between text-xs font-semibold text-[#174D32] hover:bg-[#E8F5E9] transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#26834A]" />
                        <span>SQL & Execution Logic</span>
                      </div>
                      {expandedSections[msg.id + "_sql"] ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedSections[msg.id + "_sql"] && (
                      <div className="p-3 bg-[#0D2E20] text-[#A5E86A] font-mono text-xs overflow-x-auto">
                        <pre>{msg.sqlDetails.sql}</pre>
                        <p className="text-[11px] text-slate-300 font-sans mt-2 pt-2 border-t border-[#174D32]">
                          {msg.sqlDetails.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Grounded RAG Citations */}
                {msg.ragCitations && msg.ragCitations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#DCE6DA] text-xs">
                    <div className="text-[11px] font-semibold text-[#174D32] mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#72C84A]" />
                      <span>Knowledge Base Citations:</span>
                    </div>
                    <div className="space-y-1.5">
                      {msg.ragCitations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2 rounded bg-white border border-[#DCE6DA] text-[11px]"
                        >
                          <div className="flex items-center justify-between font-medium text-[#103B29]">
                            <span>{cite.title}</span>
                            <span className="text-[10px] text-[#26834A] font-mono">
                              {(cite.relevance * 100).toFixed(0)}% relevance
                            </span>
                          </div>
                          <div className="text-[#657267] mt-0.5 line-clamp-2">
                            "{cite.snippet}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Footer: Latency, Token Usage, Copy Action */}
                {msg.role === "assistant" && (
                  <div className="mt-3 pt-2.5 border-t border-[#DCE6DA]/60 flex flex-wrap items-center justify-between text-[10px] text-[#657267] gap-2">
                    <div className="flex items-center gap-3">
                      <span>Model: {msg.model || "gemini-3.8-flash"}</span>
                      {msg.latencyMs && <span>Latency: {msg.latencyMs}ms</span>}
                      {msg.tokenUsage && (
                        <span>
                          Tokens: {msg.tokenUsage.totalTokens} (est. ${msg.tokenUsage.estimatedCostUsd})
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 hover:text-[#174D32] rounded flex items-center gap-1 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#26834A]" />
                          <span className="text-[#26834A]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-[#202820] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-[#657267]">
            <div className="w-8 h-8 rounded-xl bg-[#174D32] text-[#A5E86A] flex items-center justify-center shrink-0 border border-[#72C84A]/40">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-[#FAFBF7] border border-[#DCE6DA] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#72C84A] animate-ping" />
              <span>Analyzing dataset and verifying mathematical calculations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 border-t border-[#DCE6DA] bg-[#FAFBF7]">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your data... (Shift+Enter for newline)"
              className="w-full resize-none p-3 text-xs sm:text-sm bg-white border border-[#DCE6DA] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#72C84A] focus:border-[#72C84A] text-[#202820] placeholder-[#657267] transition-all shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              inputText.trim() && !isLoading
                ? "bg-[#174D32] text-[#A5E86A] hover:bg-[#103B29] shadow-xs cursor-pointer"
                : "bg-[#E8F5E9] text-[#657267] cursor-not-allowed opacity-60"
            }`}
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-[#657267] mt-2 px-1">
          <span>Enter to send · Shift+Enter for newline</span>
          <span className="text-[10px]">Deterministic calculations · Non-hallucinatory</span>
        </div>
      </div>
    </div>
  );
};
