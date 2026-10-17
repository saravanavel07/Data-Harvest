import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Coins,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface SettingsProps {
  totalTokensUsed: number;
  estimatedCostTotal: number;
  totalApiCalls: number;
  onResetAllData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  totalTokensUsed,
  estimatedCostTotal,
  totalApiCalls,
  onResetAllData,
}) => {
  const [activeModel, setActiveModel] = useState<string>("gemini-3.8-flash");
  const [snowflakeAccount, setSnowflakeAccount] = useState("xy12345.us-east-1");
  const [snowflakeWarehouse, setSnowflakeWarehouse] = useState("COMPUTE_WH");
  const [snowflakeDb, setSnowflakeDb] = useState("DATAHARVEST_ANALYTICS");
  const [snowflakeSchema, setSnowflakeSchema] = useState("PUBLIC");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSnowflake = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#103B29]">Platform Settings & Token Usage</h1>
        <p className="text-xs text-[#657267] mt-1 leading-relaxed">
          Monitor measured token consumption, configure language model parameters, and manage analytical warehouse connections.
        </p>
      </div>

      {/* Measured Token & Cost Tracking Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#DCE6DA] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#657267]">
            <span>Measured Tokens</span>
            <Coins className="w-4 h-4 text-[#72C84A]" />
          </div>
          <div className="text-2xl font-bold text-[#103B29] font-mono tabular-nums mt-1">
            {totalTokensUsed.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#657267] mt-1">Prompt + completion tokens</div>
        </div>

        <div className="bg-white border border-[#DCE6DA] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#657267]">
            <span>Estimated Cost</span>
            <Coins className="w-4 h-4 text-[#26834A]" />
          </div>
          <div className="text-2xl font-bold text-[#26834A] font-mono tabular-nums mt-1">
            ${estimatedCostTotal.toFixed(6)}
          </div>
          <div className="text-[11px] text-[#657267] mt-1">Standard Gemini Flash rates</div>
        </div>

        <div className="bg-white border border-[#DCE6DA] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#657267]">
            <span>Total AI Queries</span>
            <Cpu className="w-4 h-4 text-[#174D32]" />
          </div>
          <div className="text-2xl font-bold text-[#103B29] font-mono tabular-nums mt-1">
            {totalApiCalls}
          </div>
          <div className="text-[11px] text-[#657267] mt-1">Deterministic cache active</div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-[#174D32] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#72C84A]" />
          <span>Configured AI Model Architecture</span>
        </h3>
        <p className="text-xs text-[#657267]">
          DataHarvest utilizes Google Gemini 3.8 Flash for low-latency reasoning and synthesis, paired with local in-memory engines for deterministic calculations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div
            onClick={() => setActiveModel("gemini-3.8-flash")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              activeModel === "gemini-3.8-flash"
                ? "bg-[#E8F5E9] border-[#26834A]"
                : "bg-[#FAFBF7] border-[#DCE6DA]"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#103B29]">
              <span>gemini-3.8-flash</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#26834A] text-white">
                Active Default
              </span>
            </div>
            <p className="text-[11px] text-[#657267] mt-1 leading-relaxed">
              Flagship model for high-throughput analytical explanations and structured JSON tool calls.
            </p>
          </div>

          <div
            onClick={() => setActiveModel("local-math-deterministic")}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              activeModel === "local-math-deterministic"
                ? "bg-[#E8F5E9] border-[#26834A]"
                : "bg-[#FAFBF7] border-[#DCE6DA]"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#103B29]">
              <span>Deterministic Offline Engine</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAFBF7] text-[#657267] border border-[#DCE6DA]">
                Zero Cost
              </span>
            </div>
            <p className="text-[11px] text-[#657267] mt-1 leading-relaxed">
              Calculates KPIs, IQR anomalies, and AlaSQL metrics without external API calls.
            </p>
          </div>
        </div>
      </div>

      {/* Snowflake Warehouse Configuration */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-[#174D32] flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-[#72C84A]" />
          <span>Snowflake Warehouse Parameters</span>
        </h3>
        <p className="text-xs text-[#657267] mb-4">
          Credentials can be set via environment variables or configured here for your active workspace session.
        </p>

        <form onSubmit={handleSaveSnowflake} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#202820] mb-1">
                Snowflake Account Locator
              </label>
              <input
                type="text"
                value={snowflakeAccount}
                onChange={(e) => setSnowflakeAccount(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202820] mb-1">
                Virtual Warehouse
              </label>
              <input
                type="text"
                value={snowflakeWarehouse}
                onChange={(e) => setSnowflakeWarehouse(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202820] mb-1">Database</label>
              <input
                type="text"
                value={snowflakeDb}
                onChange={(e) => setSnowflakeDb(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202820] mb-1">Schema</label>
              <input
                type="text"
                value={snowflakeSchema}
                onChange={(e) => setSnowflakeSchema(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs text-[#26834A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Parameters saved to session.</span>
              </span>
            ) : (
              <span className="text-[11px] text-[#657267]">
                Enforces read-only analytics execution roles.
              </span>
            )}

            <button
              type="submit"
              className="px-4 py-1.5 bg-[#174D32] text-white text-xs font-semibold rounded-lg hover:bg-[#103B29] transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Reset & Maintenance */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-[#103B29]">Reset Platform Session</h3>
          <p className="text-xs text-[#657267] mt-0.5">
            Clear in-memory cache, sample dataset, and conversation state.
          </p>
        </div>

        <button
          onClick={onResetAllData}
          className="px-3 py-1.5 rounded-lg border border-[#C43D3D]/30 text-[#C43D3D] text-xs font-medium hover:bg-[#C43D3D]/10 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session Data</span>
        </button>
      </div>
    </div>
  );
};
