"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, UserCircle } from "lucide-react";

export default function ConversationItem({ conv, onClick }: { conv: any; onClick: () => void }) {
  const groupImageUrl = useQuery(api.conversations.getGroupImageUrl, {
    storageId: conv.groupImage,
  });

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-zinc-100 cursor-pointer transition-colors"
    >
      <div className="relative flex-shrink-0">
        {conv.isGroup ? (
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200 overflow-hidden">
            {groupImageUrl ? (
              <img
                src={groupImageUrl}
                alt="Group"
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="w-6 h-6 text-[#ffcf00]" />
            )}
          </div>
        ) : conv.otherUser?.avatarUrl ? (
          <img
            src={conv.otherUser.avatarUrl}
            alt="Avatar"
            className="w-12 h-12 rounded-full border border-zinc-200 object-cover"
          />
        ) : (
          <UserCircle className="w-12 h-12 text-zinc-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-black text-sm truncate">
          {conv.isGroup ? conv.name : conv.otherUser?.name}
        </p>
      </div>
    </div>
  );
}