"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  MessageCircle,
  CircleDashed,
  Phone,
  Search,
  UserCircle,
  Users,
  X,
  Clock,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function ConversationSidebar() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const currentUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id || "",
  });
  const allUsers = useQuery(api.users.list);
  const conversations = useQuery(
    api.conversations.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip",
  );
  const recentSearches = useQuery(
    api.users.getRecentSearches,
    currentUser ? { searcherId: currentUser._id } : "skip",
  );

  const createOrGetConversation = useMutation(
    api.conversations.getOrCreateDirectConversation,
  );
  const addRecentSearch = useMutation(api.users.addRecentSearch);

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

  const [activeTab, setActiveTab] = useState<
    "chats" | "directory" | "status" | "calls"
  >("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredUsers = (allUsers || [])
    .filter((u) => u.clerkId !== user?.id)
    .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleStartChat = async (
    otherUserId: Id<"users">,
    otherUserClerkId: string,
  ) => {
    if (!currentUser) return;

    try {
      await addRecentSearch({
        searcherId: currentUser._id,
        searchedUserId: otherUserId,
      });

      await createOrGetConversation({
        currentUserId: currentUser._id,
        otherUserId: otherUserId,
      });

      setSearchQuery("");
      setIsSearchFocused(false);
      setActiveTab("chats");
      router.push(`/users/${otherUserClerkId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  if (!currentUser || !allUsers || !conversations) {
    return (
      <div className="w-80 border-r p-4 h-screen flex items-center justify-center text-zinc-500 font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
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
            className={`p-2 rounded-xl border-2 transition-all ${activeTab === "chats" ? "bg-[#ffcf00] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]" : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-200"}`}
          >
            <MessageCircle
              className="w-6 h-6 text-black"
              strokeWidth={activeTab === "chats" ? 2.5 : 2}
            />
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`p-2 rounded-xl border-2 transition-all ${activeTab === "directory" ? "bg-[#ffcf00] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]" : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-200"}`}
          >
            <Users
              className="w-6 h-6 text-black"
              strokeWidth={activeTab === "directory" ? 2.5 : 2}
            />
          </button>

          <button
            onClick={() => setActiveTab("status")}
            className={`p-2 rounded-xl border-2 transition-all ${activeTab === "status" ? "bg-[#ffcf00] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]" : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-200"}`}
          >
            <CircleDashed
              className="w-6 h-6 text-black"
              strokeWidth={activeTab === "status" ? 2.5 : 2}
            />
          </button>

          <button
            onClick={() => setActiveTab("calls")}
            className={`p-2 rounded-xl border-2 transition-all ${activeTab === "calls" ? "bg-[#ffcf00] border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]" : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-200"}`}
          >
            <Phone
              className="w-6 h-6 text-black"
              strokeWidth={activeTab === "calls" ? 2.5 : 2}
            />
          </button>
        </div>
        <div className="mt-auto"></div>
      </div>

      <div className="w-72 lg:w-80 border-r flex flex-col flex-shrink-0">
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
                            className="w-10 h-10 rounded-full border border-zinc-200"
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
                    <p className="text-sm text-zinc-500 p-2">
                      No recent searches.
                    </p>
                  ) : (
                    recentSearches.map((u) => (
                      <button
                        key={u?._id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => u && handleStartChat(u._id, u.clerkId)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 transition-colors text-left"
                      >
                        {u?.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border border-zinc-200"
                          />
                        ) : (
                          <UserCircle className="w-10 h-10 text-zinc-400" />
                        )}
                        <div>
                          <div className="font-bold text-black">{u?.name}</div>
                        </div>
                      </button>
                    ))
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
                    conversations.map((conv) => (
                      <li key={conv._id}>
                        <Link
                          href={`/users/${conv.otherUser?.clerkId}`}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${pathname === `/chat/${conv.otherUser?.clerkId}` ? "bg-zinc-100 border border-zinc-200" : "hover:bg-zinc-50 border border-transparent"}`}
                        >
                          {conv.otherUser?.avatarUrl ? (
                            <img
                              src={conv.otherUser.avatarUrl}
                              alt="Avatar"
                              className="w-12 h-12 rounded-full border border-zinc-200 object-cover"
                            />
                          ) : (
                            <UserCircle className="w-12 h-12 text-zinc-400" />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <div className="font-bold text-black truncate">
                                {conv.otherUser?.name}
                              </div>
                              {conv.unreadCount > 0 && (
                                <div className="bg-[#ffcf00] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                                  {conv.unreadCount > 100
                                    ? "100+"
                                    : conv.unreadCount}
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-semibold text-zinc-500 truncate">
                                {conv.lastMessage?.content ||
                                  "No Conversation Yet"}
                              </div>
                              {conv.lastMessage && (
                                <span className="text-[10px] text-zinc-400 font-bold whitespace-nowrap pt-1">
                                  {formatTimestamp(conv.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))
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
                          className="w-10 h-10 rounded-full border border-zinc-200"
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
      </div>
    </div>
  );
}
