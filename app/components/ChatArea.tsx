"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { SendHorizontal, ChevronDown } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatArea({ otherUserId }: { otherUserId: string }) {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id || "",
  });
  const otherUser = useQuery(api.users.getByClerkId, { clerkId: otherUserId });
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getOrCreateConv = useMutation(api.conversations.getOrCreateDirectConversation);
  const markAsRead = useMutation(api.conversations.markAsRead);
  const setTyping = useMutation(api.conversations.updateTypingStatus);
  const sendMessage = useMutation(api.message.send);

  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId: conversationId as Id<"conversations"> } : "skip"
  );

  const messages = useQuery(
    api.message.list,
    conversationId ? { conversationId: conversationId as any } : "skip"
  );

  useEffect(() => {
    if (!currentUser || !otherUser) return;
    const init = async () => {
      const id = await getOrCreateConv({
        currentUserId: currentUser._id,
        otherUserId: otherUser._id,
      });
      setConversationId(id);
    };
    init();
  }, [currentUser, otherUser, getOrCreateConv]);

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
      container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
    setIsAtBottom(isBottom);
    if (isBottom) setShowNewMessageButton(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMessageButton(false);
  };

  const isOtherUserTyping = () => {
    if (!conversation || !otherUser) return false;
    const typingMap = (conversation as any).typingIndicators || {};
    const lastTyped = typingMap[otherUser._id] || 0;
    return Date.now() - lastTyped < 3000;
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else if (messages && messages.length > 0) {
      setShowNewMessageButton(true);
    }
  }, [messages, conversation?.typingIndicators]);

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

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTyping({
        conversationId: conversationId as any,
        userId: currentUser._id,
        isTyping: false,
    });

    await sendMessage({
      conversationId: conversationId as any,
      senderId: currentUser._id,
      content: newMessage,
    });
    
    setNewMessage("");
    setIsAtBottom(true);
    setTimeout(scrollToBottom, 100);
  };

  if (!currentUser || !otherUser) return <div className="p-4 font-bold">Loading Chat...</div>;

  const getStatusText = () => {
    if (!otherUser.lastSeen) return "Offline";
    const isOnline = Date.now() - otherUser.lastSeen < 60000;
    if (isOnline) return "Online";
    return `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <div className="border-b-2 border-black p-4 flex items-center gap-3 bg-zinc-50 z-10">
        <div className="relative">
          {otherUser.avatarUrl ? (
            <img src={otherUser.avatarUrl} className="w-10 h-10 rounded-full border-2 border-black" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-black" />
          )}
          {otherUser.lastSeen && Date.now() - otherUser.lastSeen < 60000 && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <h2 className="font-black text-black leading-none">{otherUser.name}</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{getStatusText()}</p>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 scroll-smooth"
      >
        {messages?.map((msg) => {
          const isMe = msg.senderId === currentUser._id;
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <div className={`p-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] ${isMe ? "bg-[#ffcf00]" : "bg-white"}`}>
                  {msg.deleted ? (
                    <span className="italic opacity-50 text-sm">This message was deleted</span>
                  ) : (
                    <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                  )}
                </div>
                <div className={`text-[10px] mt-2 font-black text-zinc-400 ${isMe ? "text-right" : "text-left"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}

        {isOtherUserTyping() && (
          <div className="flex justify-start pb-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white border-2 border-black p-2 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {showNewMessageButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#ffcf00] border-2 border-black px-4 py-2 rounded-full font-black text-[10px] shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-2 hover:translate-y-1 hover:shadow-none transition-all z-50 animate-bounce"
        >
          <ChevronDown className="w-4 h-4" /> NEW MESSAGES
        </button>
      )}

      <form onSubmit={handleSend} className="p-4 bg-white border-t-2 border-black flex gap-2">
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