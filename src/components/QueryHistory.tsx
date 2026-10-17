import React from "react";
import { History, Play, CheckCircle2, AlertCircle, Copy, Database, Trash2 } from "lucide-react";
import { QueryHistoryItem } from "../types";

interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onSelectQuery: (sql: string) => void;
  onClearHistory: () => void;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  history,
  onSelectQuery,
  onClearHistory,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#103B29]">Analytical Query History</h1>
          <p className="text-xs text-[#657267] mt-1 leading-relaxed">
            Audit log of analytical queries executed across in-memory AlaSQL and Snowflake sessions.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-lg border border-[#DCE6DA] bg-white text-xs text-[#C43D3D] hover:bg-[#C43D3D]/10 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-[#DCE6DA] rounded-2xl p-10 text-center shadow-xs">
          <History className="w-10 h-10 text-[#657267] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#174D32]">No Queries Executed Yet</h3>
          <p className="text-xs text-[#657267] mt-1">
            Run SQL statements in the SQL Studio to record execution times, row counts, and statement logs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#DCE6DA] rounded-xl p-4 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#DCE6DA]/50 text-xs">
                <div className="flex items-center gap-2">
                  {item.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#26834A]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#C43D3D]" />
                  )}
                  <span className="font-semibold text-[#103B29] capitalize">
                    {item.target.replace("_", " ")}
                  </span>
                  <span className="text-[#657267]">· {item.timestamp}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#657267] font-mono tabular-nums">
                  <span>Latency: {item.executionMs}ms</span>
                  <span>· Rows: {item.rowCount}</span>
                </div>
              </div>

              <div className="my-2.5 p-2.5 bg-[#0D2E20] rounded-lg text-xs font-mono text-[#A5E86A] overflow-x-auto">
                <pre>{item.sql}</pre>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => onSelectQuery(item.sql)}
                  className="text-xs font-medium text-[#26834A] hover:text-[#174D32] flex items-center gap-1"
                >
                  <span>Load in Editor</span>
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
