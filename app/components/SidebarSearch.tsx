"use client";

import { Search, X } from "lucide-react";

// 1. Define the Tab Type (Must match SidebarMenu exactly)
type TabType = "chats" | "directory" | "status" | "calls";

// 2. Define the Props Interface
interface SidebarSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  activeTab: TabType;
}

export default function SidebarSearch({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  activeTab,
}: SidebarSearchProps) {
  return (
    <div className="p-4 border-b">
      <h2 className="font-black text-2xl mb-4 text-black tracking-tight capitalize">
        {activeTab}
      </h2>

      {(activeTab === "chats" || activeTab === "directory") && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-zinc-100 border-2 border-transparent focus:border-black focus:bg-white rounded-xl text-sm transition-all outline-none"
          />
          {isSearchFocused && (
            <button
              onClick={() => {
                setIsSearchFocused(false);
                setSearchQuery("");
              }}
              className="absolute right-3 top-3 text-zinc-400 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}