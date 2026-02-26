"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ConversationItem({
  conv,
  onClick,
}: {
  conv: any;
  onClick?: () => void;
}) {
  const pathname = usePathname();

  const groupImageUrl = useQuery(api.conversations.getGroupImageUrl, {
    storageId: conv.groupImage,
  });

  const chatHref = conv.isGroup
    ? `/users/${conv._id}`
    : `/users/${conv.otherUser?.clerkId}`;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    if (timestamp >= startOfToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (timestamp >= startOfYesterday) {
      return "Yesterday";
    } else {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}/${date.getFullYear()}`;
    }
  };

  return (
    <li>
      <Link
        href={chatHref}
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
          pathname === chatHref
            ? "bg-zinc-100 border border-zinc-200"
            : "hover:bg-zinc-50 border border-transparent"
        }`}
      >
        <div className="relative flex-shrink-0">
          {conv.isGroup ? (
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200 overflow-hidden">
              {groupImageUrl ? (
                <img src={groupImageUrl} alt="Group" className="w-full h-full object-cover" />
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

        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-black truncate">
              {conv.isGroup ? conv.groupName : conv.otherUser?.name}
            </h3>
            
            {conv.unreadCount > 0 && (
              <div className="bg-[#ffcf00] text-black text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-black flex-shrink-0">
                {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {conv.isGroup && (
                <span className="text-[9px] bg-zinc-200 px-1 py-0.5 rounded font-black uppercase flex-shrink-0">
                  {conv.memberCount} Members
                </span>
              )}
              <p className={`text-sm truncate ${
                conv.lastMessage?.deleted ? "italic text-zinc-400" : "font-semibold text-zinc-500"
              }`}>
                {conv.lastMessage
                  ? conv.lastMessage.deleted
                    ? "This message was deleted"
                    : conv.lastMessage.content
                  : "No Conversation Yet"}
              </p>
            </div>
            {conv.lastMessage && (
              <span className="text-[10px] text-zinc-400 font-bold whitespace-nowrap">
                {formatTimestamp(conv.lastMessage.timestamp)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}