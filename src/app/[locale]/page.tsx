import Banner from "@/components/Banner";
import VerseCard from "@/components/VerseCard";
import NextEventCard from "@/components/NextEventCard";
import LatestSermonCard from "@/components/LatestSermonCard";
import NoticesCard from "@/components/NoticesCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LiveBanner from "@/components/LiveBanner";

export default function HomePage() {
  return (
    <>
      {/* Fixed background banner (parallax) */}
      <Banner />

      {/* Scrollable content overlapping the banner */}
      <div className="relative z-10 pt-[35vh] pb-4">
        {/* Live Stream Banner */}
        <LiveBanner />

        <div className="px-4 flex flex-col gap-3">
          <VerseCard />

          <div className="grid grid-cols-2 gap-3">
            <NextEventCard />
            <LatestSermonCard />
          </div>

          <NoticesCard />
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}
