import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileCheck2,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Table,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { AnalyticsEngine } from "../services/analyticsEngine";
import { Dataset } from "../types";

interface UploadDataProps {
  onDatasetLoaded: (dataset: Dataset) => void;
  onLoadSampleData: () => void;
  currentDataset: Dataset | null;
  onNavigateAnalyst: () => void;
}

export const UploadData: React.FC<UploadDataProps> = ({
  onDatasetLoaded,
  onLoadSampleData,
  currentDataset,
  onNavigateAnalyst,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        throw new Error("File exceeds maximum allowed size of 25MB.");
      }

      const extension = file.name.split(".").pop()?.toLowerCase();

      let dataset: Dataset;

      if (extension === "csv") {
        const text = await file.text();
        if (!text.trim()) {
          throw new Error("The selected CSV file is completely empty.");
        }
        dataset = AnalyticsEngine.parseCSV(text, file.name, file.size);
      } else if (extension === "xlsx" || extension === "xls") {
        const buffer = await file.arrayBuffer();
        dataset = AnalyticsEngine.parseExcel(buffer, file.name);
      } else {
        throw new Error("Unsupported format. Please upload a .csv, .xlsx, or .xls file.");
      }

      if (dataset.rowCount === 0) {
        throw new Error("The parsed file contains no data rows.");
      }

      setPreviewDataset(dataset);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process file. Ensure it is a valid CSV or Excel spreadsheet.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmActivation = () => {
    if (previewDataset) {
      onDatasetLoaded(previewDataset);
      setPreviewDataset(null);
      onNavigateAnalyst();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#103B29]">Dataset Ingestion</h1>
        <p className="text-xs text-[#657267] mt-1 leading-relaxed">
          Upload spreadsheets or transactional logs. DataHarvest parses column headers, checks data quality, and maps fields for conversational analytics.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all bg-white ${
          isDragging
            ? "border-[#72C84A] bg-[#E8F5E9]/50 scale-[1.01]"
            : "border-[#DCE6DA] hover:border-[#72C84A]/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#174D32] flex items-center justify-center mx-auto mb-4 border border-[#72C84A]/40 shadow-xs">
          {isProcessing ? (
            <RefreshCw className="w-7 h-7 animate-spin text-[#26834A]" />
          ) : (
            <UploadCloud className="w-7 h-7 text-[#26834A]" />
          )}
        </div>

        <h3 className="text-sm font-semibold text-[#174D32]">
          {isProcessing ? "Validating & Ingesting Dataset..." : "Drag and drop your dataset here"}
        </h3>
        <p className="text-xs text-[#657267] mt-1.5 max-w-sm mx-auto leading-relaxed">
          Supports CSV and Excel (.xlsx, .xls) files up to 25MB. Column data types and anomalies are calculated automatically.
        </p>

        <div className="mt-5 flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-[#174D32] text-white text-xs font-semibold hover:bg-[#103B29] transition-colors shadow-xs"
          >
            Browse Local Files
          </button>

          <span className="text-xs text-[#657267]">or</span>

          <button
            onClick={onLoadSampleData}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-lg bg-[#F4F8F1] border border-[#DCE6DA] hover:bg-[#E8F5E9] text-xs font-semibold text-[#174D32] transition-colors flex items-center gap-1.5"
          >
            <Table className="w-3.5 h-3.5 text-[#26834A]" />
            <span>Load Demo Sales Dataset (50 rows)</span>
          </button>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#C43D3D]/10 border border-[#C43D3D]/30 text-xs text-[#C43D3D] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Preview & Confirmation Modal/Card */}
      {previewDataset && (
        <div className="bg-white border-2 border-[#72C84A] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE6DA]">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-[#26834A]" />
              <div>
                <h3 className="text-sm font-bold text-[#103B29]">{previewDataset.name}</h3>
                <p className="text-[11px] text-[#657267]">
                  Ready to activate · {previewDataset.rowCount} rows · {previewDataset.columnCount} columns · Quality Score: {previewDataset.qualityScore}/100
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewDataset(null)}
                className="px-3 py-1.5 rounded-lg border border-[#DCE6DA] text-xs text-[#657267] hover:bg-[#FAFBF7]"
              >
                Discard
              </button>
              <button
                onClick={handleConfirmActivation}
                className="px-4 py-1.5 rounded-lg bg-[#174D32] text-white text-xs font-semibold hover:bg-[#103B29] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Activate for Analysis</span>
              </button>
            </div>
          </div>

          {/* Quick Preview Table of First 5 Rows */}
          <div>
            <div className="text-xs font-semibold text-[#174D32] mb-2">First 5 Sample Records:</div>
            <div className="overflow-x-auto border border-[#DCE6DA] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F4F8F1] border-b border-[#DCE6DA] text-[#657267]">
                    {previewDataset.columns.map((c) => (
                      <th key={c} className="py-2 px-3 font-medium whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE6DA]/50">
                  {previewDataset.data.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#FAFBF7]">
                      {previewDataset.columns.map((c) => (
                        <td key={c} className="py-1.5 px-3 whitespace-nowrap text-[#202820]">
                          {String(row[c] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Currently Active Dataset Info */}
      {currentDataset && !previewDataset && (
        <div className="bg-[#FAFBF7] border border-[#DCE6DA] rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#174D32] flex items-center justify-center border border-[#72C84A]/30">
              <FileSpreadsheet className="w-5 h-5 text-[#26834A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#103B29] flex items-center gap-2">
                <span>Active: {currentDataset.name}</span>
                <span className="text-[10px] text-[#26834A] px-1.5 py-0.5 rounded bg-[#E8F5E9]">
                  In Memory
                </span>
              </div>
              <p className="text-[11px] text-[#657267] mt-0.5">
                {currentDataset.rowCount} rows · {currentDataset.columnCount} columns · Quality Score: {currentDataset.qualityScore}/100
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateAnalyst}
            className="px-3.5 py-1.5 rounded-lg bg-[#174D32] text-white text-xs font-medium hover:bg-[#103B29] transition-colors flex items-center gap-1"
          >
            <span>Open in AI Analyst</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
