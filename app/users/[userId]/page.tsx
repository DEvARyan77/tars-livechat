"use client";

import { useParams } from "next/navigation";
import ChatArea from "@/app/components/ChatArea";

export default function ChatPage() {
  const { userId } = useParams();
  return <ChatArea otherUserId={userId as string} />;
}
