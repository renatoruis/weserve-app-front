import { useTranslations } from "next-intl";
import EventList from "@/components/EventList";

export default function AgendaPage() {
  const t = useTranslations("agenda");

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <EventList />
    </div>
  );
}
