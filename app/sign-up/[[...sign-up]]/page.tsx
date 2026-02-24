"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const nextRoute = process.env.NEXT_PUBLIC_POST_ONBOARDING_ROUTE || "/users";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      await user.setProfileImage({ file });

      router.push(nextRoute);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
    }
  };

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div
        className="flex flex-col overflow-x-clip justify-center items-center min-h-screen pt-32 pb-20 px-4"
        style={{
          backgroundColor: "rgb(252, 251, 242)",
          backgroundImage: `
             radial-gradient(circle at right, #EFEFE6 0%, transparent 900vw),
             repeating-linear-gradient(0deg, transparent, transparent 77px, rgba(0,0,0,0.5) 80px),
             repeating-linear-gradient(90deg, transparent, transparent 77px, rgba(0,0,0,0.5) 80px)
           `,
          backgroundBlendMode: "normal",
          backgroundAttachment: "fixed",
        }}
      >
        <SignUp
          appearance={{
            elements: {
              card: "w-full bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl p-6 md:p-8",
              headerTitle: "text-black font-black text-3xl tracking-tight",
              headerSubtitle: "text-zinc-600 font-medium text-base",
              socialButtonsBlockButton:
                "bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all rounded-full",
              socialButtonsBlockButtonText: "text-black font-bold",
              dividerLine: "bg-black/20",
              dividerText: "text-zinc-500 font-bold",
              formFieldLabel: "text-black font-bold",
              formFieldInput:
                "border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:ring-0 focus:border-blue-500 rounded-lg transition-all",
              formButtonPrimary:
                "bg-[#ffcf00] border-2 border-black text-black text-base font-black px-4 py-3 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#ffcf00] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all mt-2",
              footerActionText: "text-zinc-600 font-medium",
              footerActionLink:
                "text-black font-black hover:text-[#ffcf00] hover:drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen px-4"
      style={{
        backgroundColor: "rgb(252, 251, 242)",
        backgroundImage: `
             radial-gradient(circle at right, #EFEFE6 0%, transparent 900vw),
             repeating-linear-gradient(0deg, transparent, transparent 77px, rgba(0,0,0,0.5) 80px),
             repeating-linear-gradient(90deg, transparent, transparent 77px, rgba(0,0,0,0.5) 80px)
           `,
        backgroundBlendMode: "normal",
      }}
    >
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-black mb-2 text-black tracking-tight">
          Welcome, {user.username || "User"}!
        </h2>
        <p className="text-zinc-600 font-medium mb-8">
          Let's put a face to the name before you start chatting.
        </p>

        <div className="flex flex-col items-center mb-8">
          <img
            src={user.imageUrl}
            alt="Profile Preview"
            className="w-32 h-32 rounded-full border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-6 object-cover"
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[#ffcf00] border-2 border-black text-black font-black px-6 py-3 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload Avatar"}
          </button>
        </div>

        <Link
          href={nextRoute}
          className="text-zinc-500 hover:text-black font-bold transition-colors"
        >
          Skip to App ➔
        </Link>
      </div>
    </div>
  );
}
