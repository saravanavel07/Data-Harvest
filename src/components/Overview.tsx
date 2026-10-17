import React from "react";
import {
  UploadCloud,
  BotMessageSquare,
  Sparkles,
  TrendingUp,
  DollarSign,
  PieChart,
  Layers,
  ArrowRight,
  Database,
  FileCheck2,
  Table,
} from "lucide-react";
import { Dataset, AnalyticsKPIs } from "../types";
import { DataChart } from "./DataChart";

interface OverviewProps {
  activeDataset: Dataset | null;
  computedKPIs: AnalyticsKPIs | null;
  onNavigateTab: (tab: any) => void;
  onLoadSampleData: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  activeDataset,
  computedKPIs,
  onNavigateTab,
  onLoadSampleData,
  onSelectPrompt,
}) => {
  const suggestedPrompts = [
    "Summarize my dataset and key trends.",
    "Calculate total revenue, profit, and margin.",
    "Which products perform best by revenue?",
    "Compare sales performance across regions.",
    "Find missing values and data-quality issues.",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#174D32] via-[#103B29] to-[#0D2E20] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xs border border-[#72C84A]/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#72C84A]/20 text-[#A5E86A] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Data Analytics Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Good morning, let's explore your data.
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Upload a dataset, ask a question in natural language, and turn raw data into verified decisions with transparent mathematical calculations.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigateTab("upload")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#72C84A] text-[#103B29] text-xs font-semibold hover:bg-[#A5E86A] transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Dataset</span>
            </button>

            <button
              onClick={() => onNavigateTab("analyst")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FAFBF7]/10 hover:bg-[#FAFBF7]/20 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              <BotMessageSquare className="w-4 h-4 text-[#A5E86A]" />
              <span>Ask AI Analyst</span>
            </button>

            {!activeDataset && (
              <button
                onClick={onLoadSampleData}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#FAFBF7]/5 hover:bg-[#FAFBF7]/15 text-[#A5E86A] text-xs font-medium border border-[#72C84A]/30 transition-colors"
              >
                <Table className="w-4 h-4" />
                <span>Load Demo Sales Data (50 rows)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dataset State: If no dataset loaded, show clean onboarding */}
      {!activeDataset ? (
        <div className="bg-white border border-[#DCE6DA] rounded-2xl p-8 text-center max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#174D32] flex items-center justify-center mx-auto mb-4 border border-[#72C84A]/30">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#174D32]">No Active Dataset Loaded</h3>
          <p className="text-xs text-[#657267] mt-1.5 max-w-md mx-auto leading-relaxed">
            DataHarvest calculates verifiable business intelligence from your real spreadsheets and databases. Upload your CSV/Excel file or test immediately with our pre-packaged retail dataset.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => onNavigateTab("upload")}
              className="px-4 py-2 rounded-lg bg-[#174D32] text-white text-xs font-medium hover:bg-[#103B29] transition-colors"
            >
              Select CSV / Excel File
            </button>
            <button
              onClick={onLoadSampleData}
              className="px-4 py-2 rounded-lg bg-[#E8F5E9] text-[#174D32] text-xs font-semibold hover:bg-[#DCE6DA] transition-colors border border-[#72C84A]/40"
            >
              Load Demo Sales Data
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white border border-[#DCE6DA] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#657267]">
                <span>Total Revenue</span>
                <DollarSign className="w-4 h-4 text-[#26834A]" />
              </div>
              <div className="text-2xl font-bold text-[#103B29] tabular-nums mt-1 font-mono">
                ${computedKPIs?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-[#657267] mt-1 flex items-center gap-1">
                <span className="text-[#26834A] font-semibold">Σ (Qty × Price)</span>
                <span>· Verified</span>
              </div>
            </div>

            {/* Total Profit */}
            <div className="bg-white border border-[#DCE6DA] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#657267]">
                <span>Total Profit</span>
                <TrendingUp className="w-4 h-4 text-[#26834A]" />
              </div>
              <div className="text-2xl font-bold text-[#103B29] tabular-nums mt-1 font-mono">
                ${computedKPIs?.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-[#657267] mt-1 flex items-center gap-1">
                <span className="text-[#26834A] font-semibold">Revenue − Cost</span>
                <span>· Gross profit</span>
              </div>
            </div>

            {/* Profit Margin */}
            <div className="bg-white border border-[#DCE6DA] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#657267]">
                <span>Profit Margin</span>
                <PieChart className="w-4 h-4 text-[#72C84A]" />
              </div>
              <div className="text-2xl font-bold text-[#103B29] tabular-nums mt-1 font-mono">
                {computedKPIs?.profitMargin.toFixed(2)}%
              </div>
              <div className="text-[11px] text-[#657267] mt-1 flex items-center gap-1">
                <span className="text-[#26834A] font-semibold">(Profit / Revenue) × 100</span>
              </div>
            </div>

            {/* Active Records & Quality */}
            <div className="bg-white border border-[#DCE6DA] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#657267]">
                <span>Quality Score</span>
                <FileCheck2 className="w-4 h-4 text-[#26834A]" />
              </div>
              <div className="text-2xl font-bold text-[#103B29] tabular-nums mt-1 font-mono">
                {computedKPIs?.qualityScore || 98} / 100
              </div>
              <div className="text-[11px] text-[#657267] mt-1 flex items-center gap-1">
                <span className="text-[#26834A] font-semibold">
                  {activeDataset.rowCount} rows
                </span>
                <span>· {activeDataset.columnCount} columns</span>
              </div>
            </div>
          </div>

          {/* Interactive Visualizations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance Chart */}
            {computedKPIs && computedKPIs.categoryBreakdown.length > 0 && (
              <DataChart
                title="Revenue by Product Category"
                type="bar"
                xData={computedKPIs.categoryBreakdown.map((c) => c.category)}
                yData={computedKPIs.categoryBreakdown.map((c) => c.revenue)}
                xTitle="Product Category"
                yTitle="Total Revenue ($)"
              />
            )}

            {/* Monthly Trend Chart */}
            {computedKPIs && computedKPIs.monthlyTrends.length > 0 && (
              <DataChart
                title="Monthly Revenue Trajectory"
                type="line"
                xData={computedKPIs.monthlyTrends.map((m) => m.month)}
                yData={computedKPIs.monthlyTrends.map((m) => m.revenue)}
                xTitle="Month (2026)"
                yTitle="Revenue ($)"
              />
            )}
          </div>

          {/* Top Performers & Quick Questions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products Table */}
            <div className="lg:col-span-2 bg-white border border-[#DCE6DA] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE6DA]">
                <div>
                  <h3 className="text-sm font-semibold text-[#174D32]">
                    Top Revenue Generating Products
                  </h3>
                  <p className="text-xs text-[#657267] mt-0.5">
                    Calculated from actual line items in {activeDataset.name}
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab("explorer")}
                  className="text-xs text-[#26834A] hover:text-[#174D32] font-medium flex items-center gap-1"
                >
                  <span>View All in Explorer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#DCE6DA] text-[#657267]">
                      <th className="py-2 font-medium">Product</th>
                      <th className="py-2 text-right font-medium">Units Sold</th>
                      <th className="py-2 text-right font-medium">Revenue</th>
                      <th className="py-2 text-right font-medium">Gross Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE6DA]/50">
                    {computedKPIs?.topProducts.slice(0, 5).map((prod, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F8F1] transition-colors">
                        <td className="py-2.5 font-medium text-[#202820]">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#174D32] flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{prod.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-[#657267]">
                          {prod.quantity}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums font-semibold text-[#103B29]">
                          ${prod.revenue.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-[#26834A]">
                          ${prod.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Suggested Analytical Questions */}
            <div className="bg-white border border-[#DCE6DA] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#174D32] mb-3">
                  <BotMessageSquare className="w-4 h-4 text-[#72C84A]" />
                  <span>Suggested Analytical Inquiries</span>
                </div>
                <p className="text-xs text-[#657267] mb-3 leading-relaxed">
                  Click any question to launch an instant conversational analysis with verified metrics and charts:
                </p>

                <div className="space-y-2">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSelectPrompt(prompt);
                        onNavigateTab("analyst");
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-[#FAFBF7] hover:bg-[#E8F5E9] border border-[#DCE6DA] hover:border-[#72C84A]/60 text-xs text-[#202820] transition-colors flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#657267] group-hover:text-[#174D32] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCE6DA] flex items-center justify-between text-[11px] text-[#657267]">
                <span>Analysis Engine</span>
                <span className="font-semibold text-[#26834A]">Deterministic + Gemini 3.8</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
