import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { ParticleBackground } from "./components/ParticleBackground";
import { Overview } from "./components/Overview";
import { AIAnalyst } from "./components/AIAnalyst";
import { DataExplorer } from "./components/DataExplorer";
import { UploadData } from "./components/UploadData";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { DataPipelines } from "./components/DataPipelines";
import { SqlSnowflake } from "./components/SqlSnowflake";
import { QueryHistory } from "./components/QueryHistory";
import { Settings } from "./components/Settings";
import { HelpModal } from "./components/HelpModal";
import { AnalyticsEngine } from "./services/analyticsEngine";
import { RagService } from "./services/ragService";
import { DEMO_SALES_CSV } from "./sampleData";
import { Dataset, AnalyticsKPIs, ChatMessage, QueryHistoryItem } from "./types";

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState("Enterprise Analytics Lab");

  // Dataset State
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [computedKPIs, setComputedKPIs] = useState<AnalyticsKPIs | null>(null);

  // Conversation State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Token Tracking State
  const [totalTokensUsed, setTotalTokensUsed] = useState<number>(0);
  const [estimatedCostTotal, setEstimatedCostTotal] = useState<number>(0);
  const [totalApiCalls, setTotalApiCalls] = useState<number>(0);

  // SQL Query History
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);

  // Auto-load demo dataset on initial start for instant delight
  useEffect(() => {
    try {
      const demoDs = AnalyticsEngine.parseCSV(DEMO_SALES_CSV, "sales_demo.csv", DEMO_SALES_CSV.length);
      setActiveDataset(demoDs);
      const kpis = AnalyticsEngine.computeKPIs(demoDs);
      setComputedKPIs(kpis);
    } catch (e) {
      console.warn("Demo load fallback:", e);
    }
  }, []);

  const handleDatasetLoaded = (dataset: Dataset) => {
    setActiveDataset(dataset);
    const kpis = AnalyticsEngine.computeKPIs(dataset);
    setComputedKPIs(kpis);
  };

  const handleLoadSampleData = () => {
    const demoDs = AnalyticsEngine.parseCSV(DEMO_SALES_CSV, "sales_demo.csv", DEMO_SALES_CSV.length);
    setActiveDataset(demoDs);
    const kpis = AnalyticsEngine.computeKPIs(demoDs);
    setComputedKPIs(kpis);
    setCurrentTab("overview");
  };

  const handleResetAllData = () => {
    setActiveDataset(null);
    setComputedKPIs(null);
    setMessages([]);
    setQueryHistory([]);
    setTotalTokensUsed(0);
    setEstimatedCostTotal(0);
    setTotalApiCalls(0);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 1. Calculate or gather verified analytical context
      const datasetSummary = activeDataset
        ? {
            name: activeDataset.name,
            rowCount: activeDataset.rowCount,
            columns: activeDataset.columns,
          }
        : null;

      // 2. Query RAG Knowledge Base for grounded evidence
      const ragResults = RagService.search(text, 2);

      // 3. Post to backend Gemini chat endpoint
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-4),
          datasetSummary,
          computedMetrics: computedKPIs,
          ragEvidence: ragResults,
        }),
      });

      const data = await res.json();

      // Check if we should append interactive charts or KPI badges based on user inquiry
      let chartConfig: any = undefined;
      let kpisForMessage: any = undefined;
      const qLow = text.toLowerCase();

      if (computedKPIs) {
        if (qLow.includes("category") || qLow.includes("chart") || qLow.includes("product") || qLow.includes("revenue")) {
          if (computedKPIs.categoryBreakdown.length > 0) {
            chartConfig = {
              type: "bar",
              title: "Category Revenue Breakdown",
              x: computedKPIs.categoryBreakdown.map((c) => c.category),
              y: computedKPIs.categoryBreakdown.map((c) => c.revenue),
            };
          }
        } else if (qLow.includes("month") || qLow.includes("trend") || qLow.includes("trajectory")) {
          if (computedKPIs.monthlyTrends.length > 0) {
            chartConfig = {
              type: "line",
              title: "Monthly Revenue Progression",
              x: computedKPIs.monthlyTrends.map((m) => m.month),
              y: computedKPIs.monthlyTrends.map((m) => m.revenue),
            };
          }
        }

        if (qLow.includes("revenue") || qLow.includes("profit") || qLow.includes("margin") || qLow.includes("kpi")) {
          kpisForMessage = [
            {
              label: "Total Revenue",
              value: `$${computedKPIs.totalRevenue.toLocaleString()}`,
              formula: "∑(Qty × Price)",
            },
            {
              label: "Total Profit",
              value: `$${computedKPIs.totalProfit.toLocaleString()}`,
              formula: "Revenue − Cost",
            },
            {
              label: "Profit Margin",
              value: `${computedKPIs.profitMargin.toFixed(2)}%`,
              formula: "(Profit / Rev) × 100",
            },
            {
              label: "Quality Score",
              value: `${computedKPIs.qualityScore}/100`,
              formula: "Completeness & Unique",
            },
          ];
        }
      }

      // Track token usage
      if (data.tokenUsage) {
        setTotalTokensUsed((prev) => prev + (data.tokenUsage.totalTokens || 0));
        setEstimatedCostTotal((prev) => prev + (data.tokenUsage.estimatedCostUsd || 0));
        setTotalApiCalls((prev) => prev + 1);
      }

      const assistantMsg: ChatMessage = {
        id: "msg_" + (Date.now() + 1),
        role: "assistant",
        content: data.answer || "Analysis ready.",
        timestamp: new Date().toLocaleTimeString(),
        model: data.model,
        latencyMs: data.latencyMs,
        tokenUsage: data.tokenUsage,
        computedKPIs: kpisForMessage,
        chartConfig,
        ragCitations: ragResults.map((r) => ({
          title: r.title,
          relevance: r.score,
          snippet: r.content.slice(0, 180),
        })),
        sqlDetails: qLow.includes("sql")
          ? {
              sql: "SELECT Category, SUM(Quantity * Unit_Price) AS Revenue FROM active_dataset GROUP BY Category;",
              explanation: "Aggregates line-item revenue by product category.",
            }
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      // Fallback message
      const fallbackMsg: ChatMessage = {
        id: "msg_" + (Date.now() + 1),
        role: "assistant",
        content: `Analysis performed using verified local data engine:\n\n${
          computedKPIs
            ? `Total Revenue: $${computedKPIs.totalRevenue.toLocaleString()} | Profit: $${computedKPIs.totalProfit.toLocaleString()} | Profit Margin: ${computedKPIs.profitMargin.toFixed(2)}%`
            : "No active dataset loaded. Please upload a dataset to begin."
        }`,
        timestamp: new Date().toLocaleTimeString(),
        model: "DataHarvest Deterministic Engine",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQueryFromHistory = (sql: string) => {
    setCurrentTab("sql");
  };

  return (
    <div className="min-h-screen bg-[#FAFBF7] text-[#202820] flex">
      {/* Background Particle Network */}
      <ParticleBackground />

      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        activeDatasetName={activeDataset?.name}
        rowCount={activeDataset?.rowCount}
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 z-10 relative">
        <TopNav
          currentTab={currentTab}
          activeDataset={activeDataset}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onQuickSearch={(query) => {
            if (query.trim().length > 3) {
              setCurrentTab("analyst");
            }
          }}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === "overview" && (
            <Overview
              activeDataset={activeDataset}
              computedKPIs={computedKPIs}
              onNavigateTab={setCurrentTab}
              onLoadSampleData={handleLoadSampleData}
              onSelectPrompt={(prompt) => {
                handleSendMessage(prompt);
              }}
            />
          )}

          {currentTab === "analyst" && (
            <AIAnalyst
              activeDataset={activeDataset}
              computedKPIs={computedKPIs}
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearChat={() => setMessages([])}
              isLoading={isLoading}
              onNavigateUpload={() => setCurrentTab("upload")}
            />
          )}

          {currentTab === "explorer" && (
            <DataExplorer
              activeDataset={activeDataset}
              onNavigateUpload={() => setCurrentTab("upload")}
            />
          )}

          {currentTab === "upload" && (
            <UploadData
              onDatasetLoaded={handleDatasetLoaded}
              onLoadSampleData={handleLoadSampleData}
              currentDataset={activeDataset}
              onNavigateAnalyst={() => setCurrentTab("analyst")}
            />
          )}

          {currentTab === "knowledge" && <KnowledgeBase />}

          {currentTab === "pipelines" && <DataPipelines activeDataset={activeDataset} />}

          {currentTab === "sql" && (
            <SqlSnowflake
              activeDataset={activeDataset}
              onQueryExecuted={(item) => setQueryHistory((prev) => [item, ...prev])}
            />
          )}

          {currentTab === "history" && (
            <QueryHistory
              history={queryHistory}
              onSelectQuery={handleSelectQueryFromHistory}
              onClearHistory={() => setQueryHistory([])}
            />
          )}

          {currentTab === "settings" && (
            <Settings
              totalTokensUsed={totalTokensUsed}
              estimatedCostTotal={estimatedCostTotal}
              totalApiCalls={totalApiCalls}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
export default App;
