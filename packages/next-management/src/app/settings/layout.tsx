"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { usePathname, useRouter } from "next/navigation";

import { Tabs, type TTabItem } from "@docspace/shared/components/tabs";
import { DeviceType } from "@docspace/shared/enums";

import useDeviceType from "@/hooks/useDeviceType";
import { pathsWithoutTabs } from "@/lib/constants";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation(["Common", "Settings"]);
  const pathname = usePathname();
  const router = useRouter();
  const { currentDeviceType } = useDeviceType();

  const data = [
    {
      id: "branding",
      name: t("Settings:Branding"),
      content: children,
    },
    {
      id: "data-backup",
      name: t("Settings:DataBackup"),
      content: children,
    },
    {
      id: "auto-backup",
      name: t("Settings:AutoBackup"),
      content: children,
    },
    {
      id: "restore",
      name: t("Settings:RestoreBackup"),
      content: children,
    },
  ];

  const getCurrentTab = () => {
    const currentTab = data.find((item) => pathname.includes(item.id));
    return currentTab && data.length ? currentTab.id : data[0].id;
  };

  const onSelect = (e: TTabItem) => {
    router.push(`/settings/${e.id}`);
  };

  if (
    currentDeviceType === DeviceType.mobile &&
    pathsWithoutTabs.some((item) => pathname.includes(item))
  ) {
    return children;
  }

  return (
    <Tabs
      items={data}
      selectedItemId={getCurrentTab()}
      onSelect={(e) => onSelect(e)}
    />
  );
};

export default observer(SettingsLayout);

