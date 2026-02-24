"use client";

import { SignUp, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div
        className="sticky flex flex-col overflow-x-clip justify-center items-center h-[120vh] pb-20"
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
        <SignUp />
      </div>
    );
  }

  return <div>Welcome!</div>;
}
