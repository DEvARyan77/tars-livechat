"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { SendHorizontal, Users } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import AllChats from "./AllChats";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export default function ChatArea({ otherUserId }: { otherUserId: string }) {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id || "",
  });
  const otherUser = useQuery(api.users.getByClerkId, { clerkId: otherUserId });
  const updatePresence = useMutation(api.users.updatePresence);
  const hideMessageFromView = useMutation(api.message.hideMessageFromView);

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);

  const [activeEmojiMenu, setActiveEmojiMenu] = useState<Id<"messages"> | null>(
    null,
  );
  const [showFullPicker, setShowFullPicker] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMessageCountRef = useRef(0);

  const getOrCreateConv = useMutation(
    api.conversations.getOrCreateDirectConversation,
  );
  const markAsRead = useMutation(api.conversations.markAsRead);
  const setTyping = useMutation(api.conversations.updateTypingStatus);
  const sendMessage = useMutation(api.message.send);
  const deleteMessage = useMutation(api.message.deleteMessage);
  const toggleReaction = useMutation(api.message.toggleReaction);

  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId } : "skip",
  );

  const messages = useQuery(
    api.message.list,
    conversationId ? { conversationId: conversationId as any } : "skip",
  );

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveEmojiMenu(null);
      setShowFullPicker(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    updatePresence({ userId: currentUser._id });
    const interval = setInterval(() => {
      updatePresence({ userId: currentUser._id });
    }, 30000);
    return () => clearInterval(interval);
  }, [currentUser, updatePresence]);

  useEffect(() => {
    if (!currentUser) return;

    const init = async () => {
      if (otherUserId.length > 20 && !otherUserId.startsWith("user_")) {
        setConversationId(otherUserId as Id<"conversations">);
        return;
      }

      if (otherUser) {
        const id = await getOrCreateConv({
          currentUserId: currentUser._id,
          otherUserId: otherUser._id,
        });
        setConversationId(id as Id<"conversations">);
      }
    };
    init();
  }, [currentUser, otherUser, otherUserId, getOrCreateConv]);

  useEffect(() => {
    if (conversationId && currentUser) {
      markAsRead({
        conversationId: conversationId as any,
        userId: currentUser._id,
      });
    }
  }, [conversationId, currentUser, messages, markAsRead]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 100;
    setIsAtBottom(isBottom);
    if (isBottom) setShowNewMessageButton(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMessageButton(false);
  };

  const isOtherUserTyping = () => {
    if (!conversation) return false;
    const typingMap = (conversation as any).typingIndicators || {};
    return Object.entries(typingMap).some(
      ([uid, lastTyped]) =>
        uid !== currentUser?._id && Date.now() - (lastTyped as number) < 3000,
    );
  };

  useEffect(() => {
    const currentCount = messages?.length || 0;
    const hasNewMessageArrived = currentCount > prevMessageCountRef.current;
    if (
      isAtBottom ||
      (hasNewMessageArrived && prevMessageCountRef.current === 0)
    ) {
      scrollToBottom();
    } else if (hasNewMessageArrived) {
      setShowNewMessageButton(true);
    }
    prevMessageCountRef.current = currentCount;
  }, [messages, isAtBottom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!currentUser || !conversationId) return;
    setTyping({
      conversationId: conversationId as any,
      userId: currentUser._id,
      isTyping: true,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping({
        conversationId: conversationId as any,
        userId: currentUser._id,
        isTyping: false,
      });
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !currentUser) return;
    await sendMessage({
      conversationId: conversationId as any,
      senderId: currentUser._id,
      content: newMessage,
    });
    setNewMessage("");
    setIsAtBottom(true);
    setTimeout(scrollToBottom, 50);
  };

  const handleDeleteMessage = async (msg: any) => {
    if (!currentUser) return;

    if (msg.deleted) {
      await hideMessageFromView({
        messageId: msg._id,
        userId: currentUser._id,
      });
    } else if (msg.senderId === currentUser._id) {
      if (window.confirm("Delete this message?")) {
        await deleteMessage({ messageId: msg._id, userId: currentUser._id });
      }
    }
  };

  const handleReaction = async (messageId: Id<"messages">, emoji: string) => {
    if (!currentUser) return;
    await toggleReaction({ messageId, emoji, userId: currentUser._id });
    setActiveEmojiMenu(null);
    setShowFullPicker(false);
  };

  const groupImageUrl = useQuery(api.conversations.getGroupImageUrl, {
    storageId: conversation?.groupImage,
  });

  if (!currentUser || conversation === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="p-4 font-black italic animate-pulse">
          LOADING TARS CHAT...
        </div>
      </div>
    );
  }

  const getStatusText = () => {
    if (conversation?.isGroup) return "Group Chat";
    if (!otherUser?.lastSeen) return "Offline";
    const isOnline = Date.now() - otherUser.lastSeen < 30000;
    return isOnline
      ? "Online"
      : `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <div className="border-b-2 border-black p-4 flex items-center gap-3 bg-zinc-50 z-[10]">
        <div className="relative">
          {conversation?.isGroup ? (
            <div>
              {groupImageUrl ? (
                <div className="w-10 overflow-hidden h-10 rounded-full bg-[#ffcf00] border-2 border-black flex items-center justify-center">
                  <img
                    src={groupImageUrl}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 overflow-hidden h-10 rounded-full bg-[#ffcf00] border-2 border-black flex items-center justify-center">
                  <Users className="w-5 h-5 text-black" />
                </div>
              )}
            </div>
          ) : otherUser?.avatarUrl ? (
            <img
              src={otherUser.avatarUrl}
              className="w-10 h-10 rounded-full border-2 border-black object-cover"
              alt="Avatar"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-black" />
          )}

          {!conversation?.isGroup &&
            otherUser?.lastSeen &&
            Date.now() - otherUser.lastSeen < 30000 && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
        </div>
        <div>
          <h2 className="font-black text-black leading-none">
            {conversation?.isGroup
              ? conversation.name || "Unnamed Group"
              : otherUser?.name || "Chatting..."}
          </h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-wider">
            {getStatusText()}
          </p>
        </div>
      </div>

      <AllChats
        scrollContainerRef={scrollContainerRef}
        messagesEndRef={messagesEndRef}
        handleScroll={handleScroll}
        messages={messages || []}
        currentUser={currentUser}
        activeEmojiMenu={activeEmojiMenu}
        setActiveEmojiMenu={setActiveEmojiMenu}
        handleReaction={handleReaction}
        handleDeleteMessage={handleDeleteMessage}
        showFullPicker={showFullPicker}
        setShowFullPicker={setShowFullPicker}
        isOtherUserTyping={isOtherUserTyping}
        EMOJIS={EMOJIS}
      />

      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t-2 border-black flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          className="flex-1 border-2 border-black rounded-xl p-3 text-sm font-black focus:outline-none focus:bg-zinc-50 transition-colors"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-[#ffcf00] border-2 border-black px-4 py-2 rounded-xl font-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
        >
          <SendHorizontal className="w-5 h-5 text-black" strokeWidth={3} />
        </button>
      </form>
    </div>
  );
}
