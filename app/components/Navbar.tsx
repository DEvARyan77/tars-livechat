"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 50) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  const handleScrollClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed top-4 left-0 w-full z-[100] flex justify-center px-4 pointer-events-none">
      <motion.nav
        variants={{
          visible: { y: 0, scale: 1, opacity: 1 },
          hidden: { y: -80, scale: 0.85, opacity: 0 },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="pointer-events-auto w-full max-w-6xl bg-white/80 backdrop-blur-md border-2 border-black rounded-full px-4 py-2 md:px-6 md:py-3 flex justify-between items-center shadow-[4px_4px_0px_rgba(0,0,0,1)]"
      >
        <Link href="/" className="flex items-center group">
          <div className="w-8 h-8 bg-[#ffcf00] border-2 border-black rounded-full flex items-center justify-center mr-2 group-hover:-rotate-12 transition-transform duration-300">
            <span className="font-black text-black text-sm leading-none pt-[2px]">
              T
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900">
            Tars Chat
          </h1>
        </Link>

        <div className="flex items-center space-x-3 md:space-x-4">
          <a
            href="#features"
            onClick={(e) => handleScrollClick(e, "features")}
            className="text-sm font-bold text-zinc-500 hover:text-black transition-colors cursor-pointer mr-2"
          >
            Features
          </a>

          <SignInButton mode="modal">
            <button className="text-sm font-bold text-zinc-600 hover:text-black transition-colors px-2 cursor-pointer">
              Log in
            </button>
          </SignInButton>

          <a href="/sign-up">
            <button className="bg-[#ffcf00] border-2 border-black text-black text-sm font-black px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all cursor-pointer">
              Sign Up
            </button>
          </a>
        </div>
      </motion.nav>
    </div>
  );
}
