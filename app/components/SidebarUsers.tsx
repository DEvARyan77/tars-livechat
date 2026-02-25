"use client";

import { UserCircle, Clock, } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import ConversationItem from "./ConversationItem";
import { useRouter } from "next/navigation";

interface User {
  _id: Id<"users">;
  clerkId: string;
  name: string;
  avatarUrl?: string;
}

interface Conversation {
  _id: string;
  isGroup?: boolean; 
  groupName?: string | null; 
  memberCount?: number | null; 
  otherUser: User | null;
  unreadCount: number;
  lastMessage: {
    content: string;
    timestamp: number;
    deleted?: boolean;
  } | null;
}

interface SidebarUsersProps {
  isSearchFocused: boolean;
  searchQuery: string;
  activeTab: "chats" | "directory" | "status" | "calls";
  filteredUsers: User[];
  recentSearches: (User | null)[] | undefined;
  handleStartChat: (id: Id<"users">, clerkId: string) => void;
  conversations: Conversation[];
}

export default function SidebarUsers({
  isSearchFocused,
  searchQuery,
  activeTab,
  filteredUsers,
  recentSearches,
  handleStartChat,
  conversations,
}: SidebarUsersProps) {
  const router = useRouter();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    if (timestamp >= startOfToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (timestamp >= startOfYesterday) {
      return "Yesterday";
    } else {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {isSearchFocused ? (
        <div className="space-y-1">
          {searchQuery.length > 0 ? (
            <>
              <p className="text-xs font-bold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                Search Results
              </p>
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-zinc-500 p-2">No users found.</p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u._id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleStartChat(u._id, u.clerkId)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 transition-colors text-left"
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border border-zinc-200 object-cover"
                      />
                    ) : (
                      <UserCircle className="w-10 h-10 text-zinc-400" />
                    )}
                    <div>
                      <div className="font-bold text-black">{u.name}</div>
                      <div className="text-xs text-zinc-500">
                        @{u.name.toLowerCase().replace(/\s/g, "")}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-zinc-400 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recent Searches
              </p>
              {!recentSearches || recentSearches.length === 0 ? (
                <p className="text-sm text-zinc-500 p-2">No recent searches.</p>
              ) : (
                recentSearches.map((u) => {
                  if (!u) return null;
                  return (
                    <button
                      key={u._id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleStartChat(u._id, u.clerkId)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 transition-colors text-left"
                    >
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full border border-zinc-200 object-cover"
                        />
                      ) : (
                        <UserCircle className="w-10 h-10 text-zinc-400" />
                      )}
                      <div>
                        <div className="font-bold text-black">{u.name}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {activeTab === "chats" && (
            <ul className="space-y-1">
              {conversations.length === 0 ? (
                <p className="text-sm text-zinc-500 p-2 text-center mt-4">
                  No active chats.
                  <br />
                  Search to start one!
                </p>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conv) => (
                    <ConversationItem
                      key={conv._id}
                      conv={conv}
                      onClick={() => {
                        if (conv.isGroup) {
                          // Logic for Group: Navigate directly to the conversation ID
                          router.push(`/users/${conv._id}`);
                        } else if (
                          conv.otherUser?._id &&
                          conv.otherUser?.clerkId
                        ) {
                          // Logic for DMs: Use your existing handleStartChat
                          handleStartChat(
                            conv.otherUser._id,
                            conv.otherUser.clerkId,
                          );
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </ul>
          )}

          {activeTab === "directory" && (
            <div className="space-y-1">
              {filteredUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleStartChat(u._id, u.clerkId)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 transition-colors text-left"
                >
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border border-zinc-200 object-cover"
                    />
                  ) : (
                    <UserCircle className="w-10 h-10 text-zinc-400" />
                  )}
                  <div className="font-bold text-black">{u.name}</div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "status" && (
            <div className="text-center text-zinc-500 mt-10">
              Status coming soon.
            </div>
          )}
          {activeTab === "calls" && (
            <div className="text-center text-zinc-500 mt-10">
              Calls coming soon.
            </div>
          )}
        </>
      )}
    </div>
  );
}
