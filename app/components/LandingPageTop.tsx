"use client";

import React, { useState, useRef } from "react";
import WhyChooseUs from "./WhyChooseUs";

export default function LandingPageTop() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const maxRotation = 15;
    const rotateX = (mouseY / height - 0.5) * maxRotation;
    const rotateY = -(mouseX / width - 0.5) * maxRotation;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      className="sticky flex flex-col overflow-x-clip items-center min-h-[100vh] pb-20"
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
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-24 md:pt-32 pb-20 px-4 sm:px-6 z-10">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tighter text-zinc-900 leading-[1.05]">
            Because another meeting <br className="hidden lg:block" />
            could be a{" "}
            <span className="inline-block bg-[#ffcf00] px-4 py-1 transform -rotate-2 border-2 border-black rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              message.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-zinc-600 font-medium max-w-2xl mb-10 leading-relaxed">
            Tars Chat delivers blazing-fast, secure messaging designed to keep
            you in sync. Drop the distractions and focus on what matters.
          </p>

          <a href="/sign-up">
            <button className="relative px-8 py-4 bg-[#ffcf00] text-black font-bold text-lg rounded-[150px] flex items-center hover:bg-black hover:text-white transition-all duration-300 group overflow-hidden border-2 border-transparent hover:border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1">
              <div className="absolute inset-0 w-full h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative z-10 mr-4">
                Start Chatting — It's Free
              </span>
              <div className="relative z-10 w-8 h-8 bg-black rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-white">
                <svg
                  className="w-4 h-4 text-white group-hover:text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </a>
        </div>

        <div className="relative w-full h-full hidden lg:flex items-center justify-center">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-md xl:max-w-lg bg-white/30 backdrop-blur-md border border-white/50 rounded-3xl overflow-hidden transition-transform duration-200 ease-out cursor-default shadow-lg"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
            }}
          >
            <div className="h-12 bg-white/40 border-b border-white/30 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/50"></div>
            </div>

            <div className="p-6 flex bg-white/10 h-[400px]">
              <div className="w-1/4 bg-white/20 rounded-xl h-full hidden sm:block mr-4 animate-pulse border border-white/20"></div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-300 rounded-full mr-3 border border-white/40"></div>
                    <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none text-sm text-zinc-800 shadow-sm border border-white/50">
                      Is the landing page ready?
                    </div>
                  </div>
                  <div className="flex items-end justify-end">
                    <div className="bg-blue-500 p-3 rounded-2xl rounded-br-none text-sm text-white shadow-sm border border-blue-400">
                      Just shipped it. Check it out! 🚀
                    </div>
                  </div>
                  <div className="flex items-start mt-4">
                    <div className="w-8 h-8 bg-blue-300 rounded-full mr-3 border border-white/40"></div>
                    <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none text-sm text-zinc-800 shadow-sm border border-white/50">
                      Looks fantastic. Great job team.
                    </div>
                  </div>
                </div>

                <div className="h-12 bg-white/40 backdrop-blur-md rounded-full w-full mt-4 flex items-center px-4 text-zinc-600 font-medium text-sm border border-white/50 shadow-inner">
                  Type a message...
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        </div>
      </div>

      <WhyChooseUs />
    </div>
  );
}
