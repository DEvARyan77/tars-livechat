import { SmilePlus, Plus, X, Trash2 } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Id } from "@/convex/_generated/dataModel";

interface AllChatsProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  messages: any[] | undefined;
  currentUser: any;
  activeEmojiMenu: Id<"messages"> | null;
  setActiveEmojiMenu: (id: Id<"messages"> | null) => void;
  handleReaction: (messageId: Id<"messages">, emoji: string) => void;
  handleDeleteMessage: (msg: any) => void;
  showFullPicker: boolean;
  setShowFullPicker: (show: boolean) => void;
  isOtherUserTyping: () => boolean;
  EMOJIS: string[];
}

export default function AllChats({
  scrollContainerRef,
  messagesEndRef,
  handleScroll,
  messages,
  currentUser,
  activeEmojiMenu,
  setActiveEmojiMenu,
  handleReaction,
  handleDeleteMessage,
  showFullPicker,
  setShowFullPicker,
  isOtherUserTyping,
  EMOJIS,
}: AllChatsProps) {
  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-12 bg-zinc-50/50 scroll-smooth"
    >
      {messages
        ?.filter((msg) => !msg.hiddenBy?.includes(currentUser._id))
        .map((msg) => {
          const isMe = msg.senderId === currentUser._id;
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[75%] group relative">
                {activeEmojiMenu === msg._id && !msg.deleted && (
                  <div
                    className={`absolute -top-14 ${isMe ? "right-0" : "left-0"} 
                      flex gap-2 bg-white border-2 border-black p-1.5 rounded-xl 
                      shadow-[3px_3px_0px_rgba(0,0,0,1)] z-[100] justify-center items-center px-0`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg._id, emoji)}
                        className={`hover:scale-110 text-2xl transition-transform px-1`}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowFullPicker(!showFullPicker)}
                      className="w-7 h-7 mr-2 -ml-1 flex items-center justify-center hover:bg-zinc-100 rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {showFullPicker && (
                      <div className="absolute top-full left-0 mt-2 z-[110] origin-top-left transition-all">
                        <div className="border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
                          <EmojiPicker
                            onEmojiClick={(e) =>
                              handleReaction(msg._id, e.emoji)
                            }
                            width={320}
                            height={300}
                            theme={Theme.LIGHT}
                            searchDisabled={false}
                            previewConfig={{ showPreview: false }}
                            skinTonesDisabled
                            searchPlaceholder="Search emojis..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!msg.deleted && !isMe && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEmojiMenu(
                        activeEmojiMenu === msg._id ? null : msg._id,
                      );
                    }}
                    className={`absolute top-1/3 -translate-y-1/2 ${isMe ? "-left-8" : "-right-8"} 
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
                    <span className="italic opacity-50 text-xs font-medium">
                      This message was deleted
                    </span>
                  ) : (
                    <p className="text-sm font-bold leading-relaxed">
                      {msg.content}
                    </p>
                  )}
                </div>

                {msg.reactions && msg.reactions.length > 0 && (
                  <div
                    className={`absolute bottom-1/5 ${isMe ? "right-4" : "left-4"} z-20`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEmojiMenu(
                          activeEmojiMenu === msg._id ? null : msg._id,
                        );
                      }}
                      className="flex items-center h-fit gap-1 bg-white border-2 border-black pl-1/2 pr-1 py-0.5 rounded-full active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      <div className="flex -space-x-1 items-center">
                        {msg.reactions
                          .slice(0, 3)
                          .map(({ emoji }: { emoji: string }) => (
                            <span
                              key={emoji}
                              className="text-[14px] leading-none bg-white rounded-full"
                            >
                              {emoji}
                            </span>
                          ))}

                        {msg.reactions.length > 3 && (
                          <span className="text-[11px] font-black font-sans ml-1 text-black/80">
                            +{msg.reactions.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 font-black text-zinc-400 ${isMe ? "text-right" : "text-left"}`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
  );
}
