"use client";
import ConversationSidebar from "@/app/components/ConversationSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <ConversationSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
