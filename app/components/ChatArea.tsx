"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { SendHorizontal, Trash2, X, SmilePlus, Plus } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import EmojiPicker, { Theme } from "emoji-picker-react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export default function ChatArea({ otherUserId }: { otherUserId: string }) {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id || "",
  });
  const otherUser = useQuery(api.users.getByClerkId, { clerkId: otherUserId });
  const updatePresence = useMutation(api.users.updatePresence);
  const hideMessageFromView = useMutation(api.message.hideMessageFromView);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);

  const [activeEmojiMenu, setActiveEmojiMenu] = useState<Id<"messages"> | null>(null);
  const [showFullPicker, setShowFullPicker] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMessageCountRef = useRef(0);

  const getOrCreateConv = useMutation(api.conversations.getOrCreateDirectConversation);
  const markAsRead = useMutation(api.conversations.markAsRead);
  const setTyping = useMutation(api.conversations.updateTypingStatus);
  const sendMessage = useMutation(api.message.send);
  const deleteMessage = useMutation(api.message.deleteMessage);
  const toggleReaction = useMutation(api.message.toggleReaction);

  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId: conversationId as Id<"conversations"> } : "skip"
  );

  const messages = useQuery(
    api.message.list,
    conversationId ? { conversationId: conversationId as any } : "skip"
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
    const isBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
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
    const currentCount = messages?.length || 0;
    const hasNewMessageArrived = currentCount > prevMessageCountRef.current;

    if (isAtBottom || (hasNewMessageArrived && prevMessageCountRef.current === 0)) {
      scrollToBottom();
    } else if (hasNewMessageArrived) {
      setShowNewMessageButton(true);
    }
    prevMessageCountRef.current = currentCount;
  }, [messages, isAtBottom]);

  useEffect(() => {
    if (isAtBottom && isOtherUserTyping()) {
      scrollToBottom();
    }
  }, [conversation?.typingIndicators, isAtBottom]);

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
    setTyping({ conversationId: conversationId as any, userId: currentUser._id, isTyping: false });

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
      const confirmed = window.confirm("Delete this message for everyone?");
      if (confirmed) {
        await deleteMessage({
          messageId: msg._id,
          userId: currentUser._id,
        });
      }
    }
  };

  const handleReaction = async (messageId: Id<"messages">, emoji: string) => {
    if (!currentUser) return;
    await toggleReaction({ messageId, emoji, userId: currentUser._id });
    setActiveEmojiMenu(null);
    setShowFullPicker(false);
  };

  if (!currentUser || !otherUser)
    return <div className="p-4 font-black italic">Loading Tars Chat...</div>;

  const getStatusText = () => {
    if (!otherUser.lastSeen) return "Offline";
    const isOnline = Date.now() - otherUser.lastSeen < 120000;
    if (isOnline) return "Online";
    return `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <div className="border-b-2 border-black p-4 flex items-center gap-3 bg-zinc-50 z-10">
        <div className="relative">
          {otherUser.avatarUrl ? (
            <img src={otherUser.avatarUrl} className="w-10 h-10 rounded-full border-2 border-black object-cover" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-black" />
          )}
          {otherUser.lastSeen && Date.now() - otherUser.lastSeen < 120000 && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <h2 className="font-black text-black leading-none">{otherUser.name}</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-wider">{getStatusText()}</p>
        </div>
      </div>

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-12 bg-zinc-50/50 scroll-smooth">
        {messages
          ?.filter((msg) => !msg.hiddenBy?.includes(currentUser._id))
          .map((msg) => {
            const isMe = msg.senderId === currentUser._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%] group relative">
                  
                  {activeEmojiMenu === msg._id && !msg.deleted && (
                    <div 
                      className={`absolute -top-12 ${isMe ? "right-0" : "left-0"} 
                        flex gap-2 bg-white border-2 border-black p-1.5 rounded-xl 
                        shadow-[3px_3px_0px_rgba(0,0,0,1)] z-[100]`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {EMOJIS.map(emoji => (
                        <button 
                          key={emoji} 
                          onClick={() => handleReaction(msg._id, emoji)}
                          className={`hover:scale-110 transition-transform px-1 text-lg`}
                        >
                          {emoji}
                        </button>
                      ))}
                      <button 
                        onClick={() => setShowFullPicker(!showFullPicker)}
                        className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {showFullPicker && (
                        <div className="absolute top-12 left-0 z-[110] shadow-2xl scale-90 origin-top-left">
                          <EmojiPicker 
                            onEmojiClick={(e) => handleReaction(msg._id, e.emoji)}
                            width={250}
                            height={300}
                            theme={Theme.LIGHT}
                            skinTonesDisabled
                            searchDisabled={false}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {!msg.deleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEmojiMenu(activeEmojiMenu === msg._id ? null : msg._id);
                      }}
                      className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-8" : "-right-8"} 
                        opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-black`}
                    >
                      <SmilePlus className="w-5 h-5" />
                    </button>
                  )}

                  {(isMe || msg.deleted) && (
                    <button
                      onClick={() => handleDeleteMessage(msg)}
                      className={`absolute -top-2 ${isMe ? "-left-2" : "-right-2"} 
                        bg-white border-2 border-black p-1 rounded-full z-20
                        opacity-0 group-hover:opacity-100 transition-opacity
                        hover:bg-red-400 active:translate-y-[1px] shadow-[2px_2px_0px_rgba(0,0,0,1)]`}
                    >
                      {msg.deleted ? (
                         <X className="w-3 h-3 text-black" strokeWidth={3} />
                      ) : (
                         <Trash2 className="w-3 h-3 text-black" strokeWidth={3} />
                      )}
                    </button>
                  )}

                  <div
                    onDoubleClick={() => handleDeleteMessage(msg)}
                    className={`p-3 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] relative transition-all 
                    ${isMe ? "bg-[#ffcf00] text-black rounded-b-2xl rounded-tl-2xl" : "bg-white text-black rounded-b-2xl rounded-tr-2xl"}`}
                  >
                    {msg.deleted ? (
                      <span className="italic opacity-50 text-xs font-medium">This message was deleted</span>
                    ) : (
                      <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      {Object.entries(msg.reactions).map(([emoji, users]) => (
                        users && users.length > 0 && (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg._id, emoji)}
                            className={`flex items-center gap-1 bg-white border border-black px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all ${users.includes(currentUser._id) ? "bg-yellow-100" : ""}`}
                          >
                            {emoji} {users.length}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-[10px] mt-2 font-black text-zinc-400 ${isMe ? "text-right" : "text-left"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}

        {isOtherUserTyping() && (
          <div className="flex justify-start pb-2">
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