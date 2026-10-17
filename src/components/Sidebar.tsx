import React from "react";
import {
  LayoutDashboard,
  BotMessageSquare,
  TableProperties,
  UploadCloud,
  BookOpenText,
  Workflow,
  Database,
  History,
  Settings,
  ChevronDown,
  Layers,
  X,
} from "lucide-react";

export type NavTab =
  | "overview"
  | "analyst"
  | "explorer"
  | "upload"
  | "knowledge"
  | "pipelines"
  | "sql"
  | "history"
  | "settings";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeDatasetName?: string;
  rowCount?: number;
  currentWorkspace: string;
  onWorkspaceChange: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  activeDatasetName,
  rowCount,
  currentWorkspace,
  onWorkspaceChange,
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = React.useState(false);

  const workspaces = [
    "Enterprise Analytics Lab",
    "Q4 E-Commerce Growth",
    "Retail Operations Core",
  ];

  const navItems = [
    { id: "overview" as NavTab, label: "Overview", icon: LayoutDashboard },
    { id: "analyst" as NavTab, label: "AI Analyst", icon: BotMessageSquare },
    { id: "explorer" as NavTab, label: "Data Explorer", icon: TableProperties },
    { id: "upload" as NavTab, label: "Upload Data", icon: UploadCloud },
    { id: "knowledge" as NavTab, label: "Knowledge Base", icon: BookOpenText },
    { id: "pipelines" as NavTab, label: "Data Pipelines", icon: Workflow },
    { id: "sql" as NavTab, label: "SQL & Snowflake", icon: Database },
    { id: "history" as NavTab, label: "Query History", icon: History },
    { id: "settings" as NavTab, label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#103B29] text-[#FAFBF7] flex flex-col border-r border-[#174D32] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#174D32]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Custom DataHarvest Logo: Leaf + Branching Data Node */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#174D32] to-[#0A261A] p-2 flex items-center justify-center border border-[#72C84A]/40 logo-glow">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[#72C84A]"
              >
                {/* Stylized leaf silhouette with data branch nodes */}
                <path
                  d="M16 3C16 3 27 7 27 18C27 24.075 22.075 29 16 29C9.925 29 5 24.075 5 18C5 7 16 3 16 3Z"
                  stroke="#72C84A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="fill-[#72C84A]/15"
                />
                {/* Central vein with branching data nodes */}
                <path
                  d="M16 27V11"
                  stroke="#A5E86A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 19L21 15"
                  stroke="#A5E86A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 15L11 12"
                  stroke="#A5E86A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Glowing data points */}
                <circle cx="21" cy="15" r="1.5" fill="#FAFBF7" />
                <circle cx="11" cy="12" r="1.5" fill="#FAFBF7" />
                <circle cx="16" cy="10" r="2" fill="#A5E86A" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                DataHarvest
              </div>
              <p className="text-[11px] text-[#A5E86A] font-medium tracking-wide">
                Turn Data into Decisions
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white lg:hidden rounded-md hover:bg-[#174D32]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-3 pt-3">
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#174D32]/60 hover:bg-[#174D32] border border-[#72C84A]/20 text-left transition-colors text-xs font-medium text-slate-200"
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 text-[#72C84A] shrink-0" />
                <span className="truncate">{currentWorkspace}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0D2E20] border border-[#174D32] rounded-lg shadow-xl p-1 z-50">
                {workspaces.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      onWorkspaceChange(ws);
                      setShowWorkspaceMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                      currentWorkspace === ws
                        ? "bg-[#174D32] text-[#A5E86A] font-medium"
                        : "text-slate-300 hover:bg-[#174D32]/50 hover:text-white"
                    }`}
                  >
                    {ws}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-[#FAFBF7] text-[#103B29] font-semibold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#174D32]/70"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-[#174D32]"
                      : "text-[#72C84A] group-hover:text-[#A5E86A]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#26834A]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Dataset Context Badge */}
        {activeDatasetName && (
          <div className="mx-3 mb-3 p-2.5 rounded-lg bg-[#174D32]/50 border border-[#72C84A]/30">
            <div className="text-[11px] font-medium text-[#A5E86A] flex items-center justify-between">
              <span>Active Dataset</span>
              <span className="tabular-nums font-mono text-[10px] text-slate-300">
                {rowCount ? `${rowCount} rows` : ""}
              </span>
            </div>
            <div className="text-xs text-white font-semibold truncate mt-0.5">
              {activeDatasetName}
            </div>
          </div>
        )}

        {/* User Profile Footer */}
        <div className="p-3 border-t border-[#174D32]/80 bg-[#0C2D1F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#174D32] border border-[#72C84A]/40 flex items-center justify-center text-xs font-bold text-[#A5E86A]">
              SV
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                Saravanavel
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                saravanavel2006tn@gmail.com
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
