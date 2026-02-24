import LandingPageTop from "./components/LandingPageTop";
import LandingPageBottom from "./components/LandingPageBottom";

export default function Home() {
  return (
    <main className="relative block bg-[#f8f7f4]">
      <div className="left-0 w-full">
        <LandingPageTop />
      </div>

      <div className="relative w-full bg-zinc-950 text-white rounded-t-[3rem] md:rounded-t-[5rem] pt-24 pb-12 px-4 sm:px-6 lg:px-8 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center">
        <LandingPageBottom />
      </div>
    </main>
  );
}
