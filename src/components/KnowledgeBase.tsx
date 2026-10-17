import React, { useState } from "react";
import {
  BookOpenText,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  FileText,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
} from "lucide-react";
import { RagDocument } from "../types";
import { RagService, RetrievedChunk } from "../services/ragService";

export const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<RagDocument[]>(RagService.getDocuments());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RetrievedChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Financial Standards");
  const [newContent, setNewContent] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = RagService.search(searchQuery.trim(), 4);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleDelete = (id: string) => {
    RagService.deleteDocument(id);
    setDocuments(RagService.getDocuments());
    if (searchQuery.trim()) {
      setSearchResults(RagService.search(searchQuery.trim(), 4));
    }
  };

  const handleResetDefaults = () => {
    RagService.resetToDefault();
    setDocuments(RagService.getDocuments());
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    RagService.addDocument(newTitle, newCategory, newContent);
    setDocuments(RagService.getDocuments());
    setShowAddModal(false);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#103B29]">RAG Knowledge Base</h1>
          <p className="text-xs text-[#657267] mt-1 leading-relaxed">
            Manage domain definitions, GAAP accounting principles, and KPI documentation. Evidence is retrieved and cited in conversational answers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-lg border border-[#DCE6DA] bg-white text-xs text-[#657267] hover:text-[#174D32] hover:bg-[#FAFBF7] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standard Docs</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#174D32] text-white text-xs font-semibold hover:bg-[#103B29] flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Business Document</span>
          </button>
        </div>
      </div>

      {/* Semantic Vector Search Simulator */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-[#174D32] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[#26834A]" />
          <span>Knowledge Retrieval Test & Grounding</span>
        </h3>
        <p className="text-xs text-[#657267] mb-3">
          Simulate how the RAG pipeline indexes chunks and matches user inquiries:
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., 'How is profit margin calculated under GAAP?' or 'Snowflake clustering keys'"
            className="flex-1 px-3.5 py-2 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#72C84A] text-[#202820]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#26834A] text-white text-xs font-semibold rounded-lg hover:bg-[#174D32] transition-colors"
          >
            Test Retrieval
          </button>
        </form>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#DCE6DA] space-y-3">
            <div className="text-xs font-semibold text-[#174D32]">
              Top Retrieved Passages ({searchResults.length} matches):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#FAFBF7] border border-[#72C84A]/30 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-[#103B29] mb-1">
                    <span className="truncate">{res.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#26834A] font-mono">
                      {(res.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="text-[#657267] text-[11px] leading-relaxed line-clamp-3">
                    "{res.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Indexed Document Library */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE6DA] mb-4">
          <h3 className="text-sm font-semibold text-[#174D32] flex items-center gap-2">
            <BookOpenText className="w-4 h-4 text-[#72C84A]" />
            <span>Indexed Knowledge Documents ({documents.length})</span>
          </h3>
          <span className="text-[11px] text-[#657267]">
            Status: Fully Vectorized & Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-[#DCE6DA] bg-[#FAFBF7] hover:border-[#72C84A]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#657267] mb-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#174D32]">
                    {doc.category}
                  </span>
                  <span>{doc.uploadedAt}</span>
                </div>
                <h4 className="text-xs font-bold text-[#103B29] line-clamp-1">{doc.title}</h4>
                <p className="text-[11px] text-[#657267] mt-1.5 line-clamp-4 leading-relaxed">
                  {doc.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCE6DA] flex items-center justify-between text-[11px] text-[#657267]">
                <span>{doc.chunkCount} indexed chunks</span>
                {doc.sourceType === "user" && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1 hover:text-[#C43D3D] transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE6DA] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#103B29] mb-1">Add Business Knowledge</h3>
            <p className="text-xs text-[#657267] mb-4">
              Add internal KPI definitions, accounting standards, or customer rules for grounding.
            </p>

            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#202820] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Q4 Discounting & Rebate Policy"
                  className="w-full px-3 py-2 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#72C84A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202820] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#72C84A]"
                >
                  <option value="Financial Standards">Financial Standards</option>
                  <option value="Accounting Policy">Accounting Policy</option>
                  <option value="Data Governance">Data Governance</option>
                  <option value="Operational Metrics">Operational Metrics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202820] mb-1">Content</label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste documentation text, rules, or formulas..."
                  className="w-full px-3 py-2 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#72C84A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-[#657267] hover:bg-[#FAFBF7] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#174D32] hover:bg-[#103B29] rounded-lg shadow-xs"
                >
                  Index & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
