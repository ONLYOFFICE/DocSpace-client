import { cookies } from "next/headers";

import { LANGUAGE } from "@docspace/shared/constants";

import { GreetingLoginContainer } from "@/components/GreetingContainer";
import { LoginContainer } from "@/components/LoginContainer";
import { getSettings } from "@/utils/actions";

import TenantList from "./page.client";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const settings = await getSettings();

  // const { portals } = JSON.parse(searchParams.portals);
  const clientId = searchParams.clientId;

  const isRegisterContainerVisible =
    typeof settings === "string" ? undefined : settings?.enabledJoin;

  const settingsCulture =
    typeof settings === "string" ? undefined : settings?.culture;

  const culture = cookies().get(LANGUAGE)?.value ?? settingsCulture;
  return (
    <>
      {settings && typeof settings !== "string" && (
        <LoginContainer isRegisterContainerVisible={isRegisterContainerVisible}>
          <>
            <GreetingLoginContainer
              greetingSettings={settings?.greetingSettings}
              culture={culture}
            />
            <TenantList clientId={clientId} baseDomain={settings.baseDomain} />
          </>
        </LoginContainer>
      )}
    </>
  );
}
