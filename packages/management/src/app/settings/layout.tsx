"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { usePathname, useRouter } from "next/navigation";

import { Tabs, type TTabItem } from "@docspace/shared/components/tabs";
import { DeviceType } from "@docspace/shared/enums";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";

import useDeviceType from "@/hooks/useDeviceType";
import { pathsWithoutTabs } from "@/lib/constants";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const router = useRouter();

  const { currentDeviceType } = useDeviceType();

  const data = [
    {
      id: "branding",
      name: t("Common:Branding"),
      content: children,
    },
    {
      id: "data-backup",
      name: t("Common:DataBackup"),
      content: children,
    },
    {
      id: "auto-backup",
      name: t("Common:AutoBackup"),
      content: children,
    },
    {
      id: "restore",
      name: t("Common:RestoreBackup"),
      content: children,
    },
  ];

  useEffect(() => {
    const { socketSubscribers } = SocketHelper;

    if (!socketSubscribers.has("backup")) {
      SocketHelper.emit(SocketCommands.Subscribe, {
        roomParts: "backup",
      });
    }

    return () => {
      SocketHelper.off(SocketEvents.BackupProgress);
      SocketHelper.emit(SocketCommands.Unsubscribe, {
        roomParts: "backup",
      });
    };
  }, []);

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
