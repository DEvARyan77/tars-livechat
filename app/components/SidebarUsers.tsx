"use client";

import Link from "next/link";
import { UserCircle, Clock, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  clerkId: string;
  name: string;
  avatarUrl?: string;
}

interface Conversation {
  _id: string;
  isGroup?: boolean; // Added
  groupName?: string | null; // Added
  memberCount?: number | null; // Added
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
  const pathname = usePathname();

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
                conversations.map((conv) => {
                  // Determine Link destination based on type
                  const chatHref = conv.isGroup
                    ? `/users/${conv._id}`
                    : `/users/${conv.otherUser?.clerkId}`;

                  return (
                    <li key={conv._id}>
                      <Link
                        href={chatHref}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          pathname === chatHref
                            ? "bg-zinc-100 border border-zinc-200"
                            : "hover:bg-zinc-50 border border-transparent"
                        }`}
                      >
                        {/* Avatar Logic */}
                        <div className="relative flex-shrink-0">
                          {conv.isGroup ? (
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200">
                              <Users className="w-6 h-6 text-[#ffcf00]" />
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
                              {conv.isGroup
                                ? conv.groupName
                                : conv.otherUser?.name}
                            </h3>
                            {conv.unreadCount > 0 && (
                              <div className="bg-[#ffcf00] text-black text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-black flex-shrink-0">
                                {conv.unreadCount > 99
                                  ? "99+"
                                  : conv.unreadCount}
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
                              <p
                                className={`text-sm truncate ${
                                  conv.lastMessage?.deleted
                                    ? "italic text-zinc-400"
                                    : "font-semibold text-zinc-500"
                                }`}
                              >
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
                })
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
