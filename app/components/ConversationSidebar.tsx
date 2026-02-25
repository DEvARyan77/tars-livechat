"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import SidebarMenu from "./SidebarMenu";
import SidebarSearch from "./SidebarSearch";
import SidebarUsers from "./SidebarUsers";

export default function ConversationSidebar() {
  const { user } = useUser();
  const router = useRouter();

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
      <SidebarMenu activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="w-72 lg:w-80 border-r flex flex-col flex-shrink-0">
        <SidebarSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          activeTab={activeTab}
        />
        <SidebarUsers
          isSearchFocused={isSearchFocused}
          searchQuery={searchQuery}
          activeTab={activeTab}
          filteredUsers={filteredUsers}
          recentSearches={recentSearches}
          handleStartChat={handleStartChat}
          conversations={conversations}
        />
      </div>
    </div>
  );
}
