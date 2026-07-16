import React from "react";
import { Film, Cloud, RefreshCw, Wifi, WifiOff, User, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  activeProfile: UserProfile;
  isOffline: boolean;
  isSyncing: boolean;
  onToggleOffline: () => void;
  onForceSync: () => void;
  onOpenProfile: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  activeProfile,
  isOffline,
  isSyncing,
  onToggleOffline,
  onForceSync,
  onOpenProfile,
  activeTab,
  setActiveTab
}: NavbarProps) {
  const tabs = [
    { id: "movies", label: "Catalog" },
    { id: "watchlist", label: `My Watchlist (${activeProfile.watchlist.length})` },
    { id: "social", label: "Social watch" },
    { id: "analytics", label: "Analytics" },
    { id: "playground", label: "API Playground" }
  ];

  const getAvatarIcon = (name: string) => {
    switch (name) {
      case "clapperboard":
        return "🎬";
      case "ticket":
        return "🎟️";
      case "camera":
        return "📷";
      case "film":
        return "🎞️";
      default:
        return "🍿";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-orange-600 rotate-12 shadow-lg shadow-orange-600/20">
              <Film className="h-4 w-4 text-white -rotate-12" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-lg font-extrabold tracking-tighter text-white uppercase">
                  CineSync
                </span>
                <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-gray-400">
                  v2.0
                </span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-gray-500">
                DecodeLabs Project 2
              </p>
            </div>
          </div>

          {/* Quick profile / status trigger for mobile */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#050505] px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
            >
              <span className="text-sm">{getAvatarIcon(activeProfile.avatar)}</span>
              <span className="max-w-[70px] truncate font-medium">{activeProfile.username}</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="flex items-center justify-start gap-1 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-lg px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 ${
                activeTab === tab.id
                  ? "bg-orange-600/15 text-orange-500 shadow-sm border border-orange-600/30"
                  : "text-gray-400 border border-transparent hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              {tab.label}
              {tab.id === "playground" && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right side utility controls */}
        <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
          {/* Cloud Sync Status indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={onForceSync}
              disabled={isOffline || isSyncing}
              className={`flex h-7 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-gray-300 transition-all ${
                isOffline ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10 hover:text-white"
              }`}
              title="Force Database Sync"
            >
              <RefreshCw
                className={`h-3 w-3 text-orange-500 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span className="font-mono text-[10px]">
                {isSyncing ? "Syncing..." : "Cloud Synced"}
              </span>
            </button>
          </div>

          {/* Offline Mode Switch */}
          <button
            onClick={onToggleOffline}
            className={`flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-all ${
              isOffline
                ? "border-orange-600/30 bg-orange-600/10 text-orange-500"
                : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200"
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="h-3 w-3 text-orange-500" />
                <span className="font-mono text-[10px]">OFFLINE MODE</span>
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="font-mono text-[10px]">ONLINE</span>
              </>
            )}
          </button>

          {/* User profile details trigger */}
          <button
            onClick={onOpenProfile}
            className="hidden items-center gap-2 rounded-lg border border-white/10 bg-[#050505] px-3 py-1 text-xs text-gray-200 hover:bg-white/5 hover:border-white/20 sm:flex"
          >
            <span className="text-base">{getAvatarIcon(activeProfile.avatar)}</span>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-bold font-sans">{activeProfile.username}</span>
                <Sparkles className="h-2.5 w-2.5 text-orange-500" />
              </div>
              <p className="text-[9px] font-mono text-gray-400">
                {activeProfile.watchlist.length} saved
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
