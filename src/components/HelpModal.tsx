import React from "react";
import { X, BookOpen, ShieldCheck, Calculator, Sparkles, Database } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#DCE6DA] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE6DA] mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#26834A]" />
            <h2 className="text-base font-bold text-[#103B29]">DataHarvest Documentation & Standards</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#657267] hover:text-[#202820] hover:bg-[#F4F8F1] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs text-[#202820] leading-relaxed">
          {/* Formula Integrity */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#174D32] mb-1.5">
              <Calculator className="w-4 h-4 text-[#72C84A]" />
              <span>1. Mathematical Formula Integrity</span>
            </div>
            <p className="text-[#657267] mb-2">
              DataHarvest never estimates or synthesizes calculations in an LLM mental sandbox. All formulas are executed deterministically in Python/TypeScript over verified data points:
            </p>
            <div className="p-3 bg-[#FAFBF7] border border-[#DCE6DA] rounded-xl font-mono text-[11px] space-y-1 text-[#103B29]">
              <div>• Total Revenue = ∑ (Quantity × Unit_Price)</div>
              <div>• Total Cost = ∑ (Quantity × Unit_Cost)</div>
              <div>• Gross Profit = Total Revenue − Total Cost</div>
              <div>• Profit Margin (%) = (Gross Profit / Total Revenue) × 100</div>
              <div>• Outlier Bounds = [Q1 − 1.5 × IQR, Q3 + 1.5 × IQR]</div>
            </div>
          </div>

          {/* RAG Retrieval */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#174D32] mb-1.5">
              <Sparkles className="w-4 h-4 text-[#72C84A]" />
              <span>2. RAG Knowledge Grounding</span>
            </div>
            <p className="text-[#657267]">
              When users ask domain-specific questions (such as GAAP accounting principles, ASC 606 revenue recognition, or Snowflake optimization guidelines), DataHarvest retrieves verified chunks from the Knowledge Base and supplies them as ground truth to eliminate hallucinations.
            </p>
          </div>

          {/* SQL Security */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#174D32] mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#26834A]" />
              <span>3. Analytical SQL Security Guardrails</span>
            </div>
            <p className="text-[#657267]">
              SQL execution is strictly restricted to read-only queries (SELECT and WITH CTE expressions). Any destructive commands (DROP, DELETE, TRUNCATE, ALTER, INSERT, UPDATE) or multi-statement injections are blocked prior to evaluation.
            </p>
          </div>

          {/* Token & Cost Transparency */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#174D32] mb-1.5">
              <Database className="w-4 h-4 text-[#72C84A]" />
              <span>4. Token Optimization & Measurement</span>
            </div>
            <p className="text-[#657267]">
              Context sizes are bounded: large tables are summarized into concise statistical distributions and column schemas before sending to language models, minimizing token consumption and API latency.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-[#DCE6DA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#174D32] text-white text-xs font-semibold rounded-lg hover:bg-[#103B29]"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
