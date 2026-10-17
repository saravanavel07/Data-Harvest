import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Database,
  ExternalLink,
} from "lucide-react";
import { Dataset } from "../types";

interface TopNavProps {
  currentTab: string;
  activeDataset: Dataset | null;
  onOpenMobileMenu: () => void;
  onQuickSearch: (query: string) => void;
  onOpenHelp: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  activeDataset,
  onOpenMobileMenu,
  onQuickSearch,
  onOpenHelp,
}) => {
  const [searchVal, setSearchVal] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Real operational notifications based on app state
  const notifications = [
    {
      id: "n1",
      title: activeDataset ? `Dataset '${activeDataset.name}' Loaded` : "Ready for Dataset Upload",
      time: "Active Session",
      type: "success",
      detail: activeDataset
        ? `${activeDataset.rowCount} rows verified with ${activeDataset.qualityScore}/100 quality score.`
        : "Upload CSV or Excel to start conversational analysis.",
    },
    {
      id: "n2",
      title: "SQL Engine Ready",
      time: "In-Memory",
      type: "info",
      detail: "Read-only AlaSQL execution sandbox initialized.",
    },
  ];

  const tabLabels: Record<string, string> = {
    overview: "Workspace Overview",
    analyst: "AI Data Analyst",
    explorer: "Data Explorer & Quality Audit",
    upload: "Dataset Ingestion",
    knowledge: "RAG Knowledge Base",
    pipelines: "Data Transformation Pipelines",
    sql: "SQL Studio & Snowflake",
    history: "Analytical Query History",
    settings: "Platform Settings & Token Usage",
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FAFBF7]/90 backdrop-blur-md border-b border-[#DCE6DA] flex items-center justify-between px-4 lg:px-8 gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-[#202820] hover:bg-[#E8F5E9] rounded-lg lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-[#657267] truncate">
          <span className="font-semibold text-[#174D32]">DataHarvest</span>
          <span aria-hidden="true" className="text-[#DCE6DA]">/</span>
          <span className="text-[#202820] font-medium truncate">
            {tabLabels[currentTab] || "Analytics"}
          </span>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="hidden md:flex items-center max-w-md w-full relative">
        <Search className="w-4 h-4 text-[#657267] absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            onQuickSearch(e.target.value);
          }}
          placeholder="Ask a question, filter columns, or search documents..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F4F8F1] border border-[#DCE6DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#72C84A] focus:border-[#72C84A] text-[#202820] placeholder-[#657267] transition-all"
        />
      </div>

      {/* Right: Dataset Badge & Action Icons */}
      <div className="flex items-center gap-3 shrink-0">
        {activeDataset ? (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E8F5E9] border border-[#72C84A]/40 text-[11px] text-[#174D32] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#26834A]" />
            <span className="font-semibold truncate max-w-[140px]">
              {activeDataset.name}
            </span>
            <span className="text-[#657267] tabular-nums font-mono">
              ({activeDataset.rowCount} rows)
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F8F1] border border-[#DCE6DA] text-[11px] text-[#657267]">
            <span>No dataset active</span>
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#657267] hover:text-[#174D32] hover:bg-[#E8F5E9] rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#72C84A]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#DCE6DA] rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCE6DA] mb-2">
                <span className="text-xs font-semibold text-[#174D32]">
                  System Notifications
                </span>
                <span className="text-[10px] text-[#657267]">
                  {notifications.length} real events
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded-lg bg-[#FAFBF7] border border-[#DCE6DA] text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#202820]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#26834A]" />
                        <span>{n.title}</span>
                      </div>
                      <span className="text-[10px] text-[#657267]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#657267] mt-1 leading-relaxed">
                      {n.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Modal Trigger */}
        <button
          onClick={onOpenHelp}
          className="p-2 text-[#657267] hover:text-[#174D32] hover:bg-[#E8F5E9] rounded-lg transition-colors"
          aria-label="Documentation & help"
          title="Documentation & Formula Standards"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
