"use client";

import React from "react";
import { motion } from "framer-motion";

const HandDrawnFilter = () => (
  <svg className="hidden">
    <filter id="doodle-filter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.07"
        numOctaves="3"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="3"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

const MiniStampCard = ({
  title,
  description,
  color,
  rotation,
  icon: Icon,
}: any) => (
  <div className={`relative w-full mb-6 transform ${rotation} max-w-sm`}>
    <div
      className={`absolute inset-0 top-1.5 left-1.5 w-full h-full ${color} rounded-sm opacity-90`}
      style={{ filter: "url(#doodle-filter)" }}
    ></div>

    <div
      className="relative bg-white border-2 border-black p-5 rounded-sm flex items-center gap-4 z-10"
      style={{ filter: "url(#doodle-filter)" }}
    >
      <div className="flex-shrink-0 text-black">
        <Icon className="w-6 h-6" strokeWidth={3} />
      </div>
      <div className="text-left">
        <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none">
          {title}
        </h3>
        <p className="text-[11px] font-bold text-gray-700 leading-tight mt-1.5">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export default function UsersPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <HandDrawnFilter />

        <div className="text-center mb-12 w-full">
          <div className="relative inline-block">
            <h2
              className="text-3xl md:text-4xl font-black text-black px-4 italic tracking-tight"
              style={{ filter: "url(#doodle-filter)" }}
            >
              Why Choose Tars?
            </h2>
            <svg
              className="absolute -bottom-4 left-0 w-full h-6 text-blue-500 overflow-visible"
              viewBox="0 0 200 20"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M5,15 C40,5 70,25 100,15 C130,5 160,25 195,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center w-full">
          <MiniStampCard
            title="Instant Delivery"
            description="Messages zip through the void instantly."
            color="bg-pink-300"
            rotation="-rotate-0"
            icon={(props: any) => (
              <svg
                {...props}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 2L3 14h9l-1 8 11-12h-9l1-8z" fill="currentColor" />
              </svg>
            )}
          />

          <MiniStampCard
            title="Ironclad Privacy"
            description="End-to-end encryption for your peace of mind."
            color="bg-green-300"
            rotation="rotate-0"
            icon={(props: any) => (
              <svg
                {...props}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          />

          <MiniStampCard
            title="Always Synced"
            description="Switch devices without missing a single word."
            color="bg-blue-300"
            rotation="-rotate-0"
            icon={(props: any) => (
              <svg
                {...props}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  fill="currentColor"
                />
              </svg>
            )}
          />
        </div>
      </div>
    </div>
  );
}
