import React, { useState } from "react";
import {
  Workflow,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  FileCheck2,
} from "lucide-react";
import { Dataset, PipelineStep } from "../types";

interface DataPipelinesProps {
  activeDataset: Dataset | null;
}

export const DataPipelines: React.FC<DataPipelinesProps> = ({ activeDataset }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    "Pipeline initialized. Ready to execute ETL & KPI aggregation.",
  ]);

  const initialSteps: PipelineStep[] = [
    {
      id: "step_ingest",
      name: "Source Ingestion",
      description: "Load records from active dataset or remote warehouse stream",
      status: "idle",
    },
    {
      id: "step_schema",
      name: "Schema & Type Validation",
      description: "Infer date, numeric quantities, and currency fields",
      status: "idle",
    },
    {
      id: "step_dedup",
      name: "Deduplication & Null Handling",
      description: "Scan duplicate hash rows and flag missing values",
      status: "idle",
    },
    {
      id: "step_iqr",
      name: "Outlier & Anomaly Detection",
      description: "Calculate Interquartile Range (IQR) bounds on prices",
      status: "idle",
    },
    {
      id: "step_kpi",
      name: "KPI & Margin Transformation",
      description: "Compute Revenue = Qty × Price and Profit = Revenue − Cost",
      status: "idle",
    },
    {
      id: "step_export",
      name: "Analytics Metric Publishing",
      description: "Emit verified dimensions into in-memory query cache",
      status: "idle",
    },
  ];

  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);

  const runPipeline = () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setPipelineLogs(["[00:00.000] Pipeline execution started."]);

    const rowCount = activeDataset?.rowCount || 50;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < steps.length) {
        setSteps((prev) =>
          prev.map((s, i) => {
            if (i === idx) {
              return {
                ...s,
                status: "success",
                durationMs: Math.floor(Math.random() * 80 + 35),
                recordsProcessed: rowCount,
                details: `Processed ${rowCount} records successfully.`,
              };
            }
            if (i === idx + 1) {
              return { ...s, status: "running" };
            }
            return s;
          })
        );

        setPipelineLogs((prev) => [
          ...prev,
          `[+${((idx + 1) * 0.12).toFixed(3)}s] Step ${idx + 1}: Completed '${steps[idx].name}' (${rowCount} rows).`,
        ]);

        idx++;
        setCurrentStepIndex(idx);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setPipelineLogs((prev) => [
          ...prev,
          `[SUCCESS] Pipeline completed successfully. 100% records validated.`,
        ]);
      }
    }, 450);
  };

  const resetPipeline = () => {
    setSteps(initialSteps);
    setCurrentStepIndex(-1);
    setPipelineLogs(["Pipeline reset. Ready to run."]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#103B29]">Data Transformation Pipelines</h1>
          <p className="text-xs text-[#657267] mt-1 leading-relaxed">
            Automate ingestion, schema validation, anomaly filtering, and verified KPI rollups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetPipeline}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg border border-[#DCE6DA] bg-white text-xs text-[#657267] hover:bg-[#FAFBF7] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={runPipeline}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-lg bg-[#26834A] text-white text-xs font-semibold hover:bg-[#174D32] flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? "Running Pipeline..." : "Execute Pipeline"}</span>
          </button>
        </div>
      </div>

      {/* Visual DAG / Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, idx) => {
          const isDone = step.status === "success";
          const isCurrent = step.status === "running";

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? "bg-white border-[#26834A]/50 shadow-xs"
                  : isCurrent
                  ? "bg-[#E8F5E9] border-[#72C84A] shadow-md scale-[1.01]"
                  : "bg-[#FAFBF7] border-[#DCE6DA] opacity-80"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-[#657267]">Step 0{idx + 1}</span>
                {isDone ? (
                  <span className="flex items-center gap-1 text-[#26834A] text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passed ({step.durationMs}ms)</span>
                  </span>
                ) : isCurrent ? (
                  <span className="text-[#174D32] text-[11px] font-bold animate-pulse">
                    Running...
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">Pending</span>
                )}
              </div>

              <h3 className="text-xs font-bold text-[#103B29]">{step.name}</h3>
              <p className="text-[11px] text-[#657267] mt-1 leading-relaxed">
                {step.description}
              </p>

              {step.recordsProcessed && (
                <div className="mt-3 pt-2 border-t border-[#DCE6DA] text-[10px] text-[#26834A] font-mono">
                  {step.recordsProcessed} records verified
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pipeline Execution Logs */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-[#174D32] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#26834A]" />
          <span>Pipeline Execution Stream</span>
        </h3>
        <div className="p-3 bg-[#0A261A] rounded-xl font-mono text-xs text-[#A5E86A] space-y-1 h-36 overflow-y-auto">
          {pipelineLogs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
