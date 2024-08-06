import TenantList from "@/components/TenantList";
import { getSettings } from "@/utils/actions";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const settings = await getSettings();

  const { portals } = JSON.parse(searchParams.portals);
  const clientId = searchParams.clientId;

  if (typeof settings !== "object") return;

  return (
    <TenantList
      portals={portals}
      clientId={clientId}
      baseDomain={settings.baseDomain}
    />
  );
}
