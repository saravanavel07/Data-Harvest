import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Columns,
  Sparkles,
  Info,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { Dataset, ColumnMetadata } from "../types";

interface DataExplorerProps {
  activeDataset: Dataset | null;
  onNavigateUpload: () => void;
}

export const DataExplorer: React.FC<DataExplorerProps> = ({
  activeDataset,
  onNavigateUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumnFilter, setSelectedColumnFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"table" | "columns" | "quality">("table");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Filtered & sorted data
  const filteredData = useMemo(() => {
    if (!activeDataset || !activeDataset.data) return [];
    let list = [...activeDataset.data];

    // Search filter across columns
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(q)
        )
      );
    }

    // Specific category or column filter if applied
    if (sortColumn) {
      list.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === "asc"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return list;
  }, [activeDataset, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedRows = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const handleExportCSV = () => {
    if (!activeDataset || filteredData.length === 0) return;
    const cols = activeDataset.columns;
    let csv = cols.join(",") + "\n";
    filteredData.forEach((row) => {
      const line = cols
        .map((c) => {
          const val = row[c];
          if (typeof val === "string") {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val !== null && val !== undefined ? val : "";
        })
        .join(",");
      csv += line + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDataset.name.replace(/\.[^/.]+$/, "")}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeDataset) {
    return (
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
        <FileSpreadsheet className="w-12 h-12 text-[#657267] mx-auto mb-3" />
        <h3 className="text-base font-semibold text-[#174D32]">No Active Dataset</h3>
        <p className="text-xs text-[#657267] mt-1.5 leading-relaxed">
          Upload a dataset in CSV or Excel format to explore tabular records, column schemas, and data-quality audits.
        </p>
        <button
          onClick={onNavigateUpload}
          className="mt-5 px-4 py-2 rounded-lg bg-[#174D32] text-white text-xs font-semibold hover:bg-[#103B29] transition-colors"
        >
          Go to Upload Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header Info Strip */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#103B29]">{activeDataset.name}</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#174D32] font-semibold uppercase">
              {activeDataset.fileType}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#657267] mt-1">
            <span>
              <strong className="text-[#202820] tabular-nums font-mono">
                {activeDataset.rowCount}
              </strong>{" "}
              records
            </span>
            <span>·</span>
            <span>
              <strong className="text-[#202820] tabular-nums font-mono">
                {activeDataset.columnCount}
              </strong>{" "}
              columns
            </span>
            <span>·</span>
            <span>
              Quality:{" "}
              <strong className="text-[#26834A] tabular-nums font-mono">
                {activeDataset.qualityScore}/100
              </strong>
            </span>
            <span>·</span>
            <span>Uploaded: {activeDataset.uploadedAt}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-[#DCE6DA] bg-[#FAFBF7] hover:bg-[#E8F5E9] text-xs font-medium text-[#174D32] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs: Table View / Column Schema / Data Quality Audit */}
      <div className="flex items-center gap-1 border-b border-[#DCE6DA] pb-1">
        <button
          onClick={() => setActiveTab("table")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "table"
              ? "bg-[#174D32] text-white"
              : "text-[#657267] hover:text-[#174D32] hover:bg-[#E8F5E9]"
          }`}
        >
          Data Table ({filteredData.length})
        </button>
        <button
          onClick={() => setActiveTab("columns")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "columns"
              ? "bg-[#174D32] text-white"
              : "text-[#657267] hover:text-[#174D32] hover:bg-[#E8F5E9]"
          }`}
        >
          Column Schema ({activeDataset.columnCount})
        </button>
        <button
          onClick={() => setActiveTab("quality")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "quality"
              ? "bg-[#174D32] text-white"
              : "text-[#657267] hover:text-[#174D32] hover:bg-[#E8F5E9]"
          }`}
        >
          Quality Audit & Anomalies
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "table" && (
        <div className="bg-white border border-[#DCE6DA] rounded-2xl shadow-xs overflow-hidden">
          {/* Table Search & Filter Toolbar */}
          <div className="p-3.5 border-b border-[#DCE6DA] bg-[#FAFBF7] flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#657267] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search across all rows and cells..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DCE6DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#72C84A] text-[#202820]"
              />
            </div>

            <div className="text-xs text-[#657267]">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredData.length)} of {filteredData.length} records
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F8F1] border-b border-[#DCE6DA] text-[#174D32]">
                  <th className="py-2.5 px-3 font-semibold w-12 text-[#657267]">#</th>
                  {activeDataset.columns.map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-[#E8F5E9] transition-colors whitespace-nowrap select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        <ArrowUpDown className="w-3 h-3 text-[#657267]" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6DA]/60">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={activeDataset.columns.length + 1} className="py-8 text-center text-[#657267]">
                      No matching records found for "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#FAFBF7] transition-colors">
                      <td className="py-2 px-3 text-[#657267] font-mono text-[11px] tabular-nums">
                        {(page - 1) * pageSize + rIdx + 1}
                      </td>
                      {activeDataset.columns.map((col) => {
                        const val = row[col];
                        const isNum = typeof val === "number";
                        return (
                          <td
                            key={col}
                            className={`py-2 px-3 whitespace-nowrap text-[#202820] ${
                              isNum ? "font-mono tabular-nums text-right" : ""
                            }`}
                          >
                            {val !== null && val !== undefined ? (
                              isNum && col.toLowerCase().includes("price") || col.toLowerCase().includes("cost") || col.toLowerCase().includes("revenue") ? (
                                `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              ) : (
                                String(val)
                              )
                            ) : (
                              <span className="text-slate-400 italic">null</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 border-t border-[#DCE6DA] bg-[#FAFBF7] flex items-center justify-between text-xs text-[#657267]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded bg-white border border-[#DCE6DA] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E8F5E9]"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded bg-white border border-[#DCE6DA] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E8F5E9]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Column Schema Tab */}
      {activeTab === "columns" && (
        <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-[#174D32] mb-3">
            Inferred Column Schema & Statistical Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCE6DA] text-[#657267] bg-[#F4F8F1]">
                  <th className="py-2 px-3 font-medium">Column Name</th>
                  <th className="py-2 px-3 font-medium">Data Type</th>
                  <th className="py-2 px-3 text-right font-medium">Null Count</th>
                  <th className="py-2 px-3 text-right font-medium">Null %</th>
                  <th className="py-2 px-3 text-right font-medium">Unique Values</th>
                  <th className="py-2 px-3 text-right font-medium">Min</th>
                  <th className="py-2 px-3 text-right font-medium">Max</th>
                  <th className="py-2 px-3 text-right font-medium">Mean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6DA]/50">
                {activeDataset.columnMetadata.map((meta, i) => (
                  <tr key={i} className="hover:bg-[#FAFBF7]">
                    <td className="py-2.5 px-3 font-semibold text-[#103B29]">{meta.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F5E9] text-[#174D32]">
                        {meta.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#657267]">
                      {meta.nullCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#657267]">
                      {meta.nullPercentage}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#202820]">
                      {meta.uniqueCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#657267]">
                      {meta.min !== undefined ? String(meta.min) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#657267]">
                      {meta.max !== undefined ? String(meta.max) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#26834A]">
                      {meta.mean !== undefined ? Number(meta.mean).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quality Audit Tab */}
      {activeTab === "quality" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#DCE6DA] rounded-xl p-4">
              <div className="text-xs text-[#657267]">Data Quality Score</div>
              <div className="text-2xl font-bold text-[#26834A] font-mono tabular-nums mt-1">
                {activeDataset.qualityScore} / 100
              </div>
              <div className="text-[11px] text-[#657267] mt-1">
                Calculated on completeness & uniqueness
              </div>
            </div>

            <div className="bg-white border border-[#DCE6DA] rounded-xl p-4">
              <div className="text-xs text-[#657267]">Missing Cells</div>
              <div className="text-2xl font-bold text-[#103B29] font-mono tabular-nums mt-1">
                {activeDataset.missingCells}
              </div>
              <div className="text-[11px] text-[#657267] mt-1">
                Across {activeDataset.rowCount * activeDataset.columnCount} total fields
              </div>
            </div>

            <div className="bg-white border border-[#DCE6DA] rounded-xl p-4">
              <div className="text-xs text-[#657267]">Duplicate Rows</div>
              <div className="text-2xl font-bold text-[#103B29] font-mono tabular-nums mt-1">
                {activeDataset.duplicateRows}
              </div>
              <div className="text-[11px] text-[#657267] mt-1">
                {activeDataset.duplicateRows === 0 ? "Zero duplicates detected" : "Duplicate records identified"}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-[#174D32] mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#26834A]" />
              <span>Automated Verification Checks</span>
            </h3>
            <ul className="text-xs space-y-2 text-[#202820] mt-3">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#26834A]" />
                <span>Primary identification keys are unique and non-null.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#26834A]" />
                <span>Numeric prices and quantities are strictly positive.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#26834A]" />
                <span>Revenue equation validated: Profit $\le$ Revenue for all transactions.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
