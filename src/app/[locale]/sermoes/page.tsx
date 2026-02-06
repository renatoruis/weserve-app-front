import { useTranslations } from "next-intl";
import SermonList from "@/components/SermonList";

export default function SermonsPage() {
  const t = useTranslations("sermons");

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <SermonList />
    </div>
  );
}
