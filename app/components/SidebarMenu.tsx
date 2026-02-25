"use client";

import { UserButton } from "@clerk/nextjs";
import { MessageCircle, CircleDashed, Phone, Users, Plus } from "lucide-react";

// 1. Define the possible tab values
type TabType = "chats" | "directory" | "status" | "calls";

// 2. Define the Props interface
interface SidebarMenuProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenGroupModal: () => void;
}

export default function SidebarMenu({
  activeTab,
  setActiveTab,
  onOpenGroupModal,
}: SidebarMenuProps) {
  return (
    <div className="w-16 border-r bg-zinc-50 flex flex-col items-center py-4 flex-shrink-0">
      <div className="mb-auto">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox:
                "!w-[40px] !h-[40px] border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all",
            },
          }}
        />
      </div>

      <div className="flex flex-col gap-6 items-center mt-8">
        <button
          onClick={() => setActiveTab("chats")}
          className={`p-2 rounded-xl border-2 transition-all ${
            activeTab === "chats"
              ? "bg-[#ffcf00] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-200"
          }`}
        >
          <MessageCircle
            className="w-6 h-6 text-black"
            strokeWidth={activeTab === "chats" ? 2.5 : 2}
          />
        </button>

        <button
          onClick={() => setActiveTab("directory")}
          className={`p-2 rounded-xl border-2 transition-all ${
            activeTab === "directory"
              ? "bg-[#ffcf00] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-200"
          }`}
        >
          <Users
            className="w-6 h-6 text-black"
            strokeWidth={activeTab === "directory" ? 2.5 : 2}
          />
        </button>

        <button
          onClick={() => setActiveTab("status")}
          className={`p-2 rounded-xl border-2 transition-all ${
            activeTab === "status"
              ? "bg-[#ffcf00] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-200"
          }`}
        >
          <CircleDashed
            className="w-6 h-6 text-black"
            strokeWidth={activeTab === "status" ? 2.5 : 2}
          />
        </button>

        <button
          onClick={() => setActiveTab("calls")}
          className={`p-2 rounded-xl border-2 transition-all ${
            activeTab === "calls"
              ? "bg-[#ffcf00] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-200"
          }`}
        >
          <Phone
            className="w-6 h-6 text-black"
            strokeWidth={activeTab === "calls" ? 2.5 : 2}
          />
        </button>
        <button
          onClick={onOpenGroupModal}
          className="p-2 bg-[#ffcf00] border-2 border-black rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          <Plus className="w-5 h-5 text-black" strokeWidth={3} />
        </button>
      </div>
      <div className="mt-auto"></div>
    </div>
  );
}
