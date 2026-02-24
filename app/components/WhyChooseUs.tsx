"use client";

import React from "react";
import { motion } from "framer-motion";

interface StampCardProps {
  title: string;
  description: string;
  color: string;
  rotation: string;
  children: React.ReactNode;
}

const HandDrawnFilter = () => (
  <svg className="hidden">
    <filter id="hand-drawn">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.05"
        numOctaves="2"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="4"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

const StampCard: React.FC<StampCardProps> = ({
  title,
  description,
  color,
  rotation,
  children,
}) => {
  return (
    <div
      className={`relative w-full max-w-sm mx-auto transform ${rotation} hover:scale-105 transition-transform duration-300`}
    >
      <div
        className={`absolute inset-0 top-2 left-2 w-full h-full ${color} rounded-md`}
        style={{ filter: "url(#hand-drawn)" }}
      ></div>

      <div
        className="relative bg-white border-4 border-black p-8 rounded-sm flex flex-col items-center text-center z-10 h-full"
        style={{ filter: "url(#hand-drawn)" }}
      >
        <div className="absolute top-4 left-4 text-black font-bold">✧</div>
        <div className="absolute bottom-4 right-4 text-black font-bold">✦</div>

        <div className="mb-6 border-b-2 border-black pb-4 w-full flex justify-center">
          {children}
        </div>

        <h3 className="text-xl font-extrabold text-black mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-800 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default function WhyChooseUs() {
  return (
    <section
      id="features"
      className="py-32 min-h-screen flex flex-col justify-center overflow-hidden"
    >
      <HandDrawnFilter />

      <div className="text-center mb-24">
        <h2
          className="text-4xl md:text-6xl font-black text-black mb-4 relative inline-block"
          style={{ filter: "url(#hand-drawn)" }}
        >
          Why Choose Tars?
          <svg
            className="absolute w-full h-4 -bottom-4 left-0 text-blue-500"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0 10 Q 25 20, 50 10 T 100 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
            />
          </svg>
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-24">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StampCard
            title="Lightning Fast"
            description="Messages deliver before you even finish blinking. Zero lag, pure speed."
            color="bg-pink-300"
            rotation="-rotate-3"
          >
            <svg
              className="w-16 h-16 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon
                points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                fill="currentColor"
              />
            </svg>
          </StampCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StampCard
            title="Ironclad Privacy"
            description="Your data is yours. Nobody else can peek at your conversations."
            color="bg-green-400"
            rotation="rotate-2"
          >
            <svg
              className="w-16 h-16 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </StampCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <StampCard
            title="Zero Clutter"
            description="A clean, minimalist UI that gets out of your way so you can focus."
            color="bg-blue-300"
            rotation="-rotate-2"
          >
            <svg
              className="w-16 h-16 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </StampCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StampCard
            title="Seamless Sharing"
            description="Drag, drop, and send files of any size without breaking a sweat."
            color="bg-yellow-300"
            rotation="rotate-3"
          >
            <svg
              className="w-16 h-16 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </StampCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StampCard
            title="Any Device"
            description="Start chatting on your phone, finish on your laptop. Perfectly synced."
            color="bg-purple-300"
            rotation="-rotate-1"
          >
            <svg
              className="w-16 h-16 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
          </StampCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <StampCard
            title="Express Yourself"
            description="Custom reactions, themes, and emojis to match your exact vibe."
            color="bg-orange-300"
            rotation="rotate-2"
          >
            <svg
              className="w-16 h-16 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </StampCard>
        </motion.div>
      </div>
    </section>
  );
}
