import { SignInButton } from "@clerk/nextjs";

export default function WhyChooseUs() {
  return (
    <>
      <div className="mb-20">
        <h3 className="text-xl md:text-2xl font-medium text-zinc-400">
          Trusted by{" "}
          <span className="text-white font-bold">teams and individuals</span>{" "}
          worldwide.
        </h3>
      </div>

      <div className="max-w-4xl mb-24">
        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-tight">
          Ready to drop the <br className="hidden md:block" /> noise?
        </h2>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Join Tars today and experience the fastest, cleanest, and most secure
          chatting platform ever built. Stop waiting, start connecting.
        </p>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a href="/sign-up">
            <button className="w-full sm:w-auto bg-white text-black font-extrabold text-lg px-10 py-4 rounded-full hover:bg-zinc-200 transition transform hover:scale-105">
              Get Started for Free
            </button>
          </a>
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto bg-transparent border-2 border-zinc-800 text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-zinc-800 hover:border-zinc-700 transition">
              I already have an account
            </button>
          </SignInButton>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm font-medium">
        <p className="mb-4 md:mb-0">© 2026 Tars Chat. All rights reserved.</p>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-white transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white transition">
            Twitter / X
          </a>
          <a href="#" className="hover:text-white transition">
            GitHub
          </a>
        </div>
      </div>
    </>
  );
}
