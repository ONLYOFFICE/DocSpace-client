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

import { pathsWithoutTabs } from "@/lib/constants";

import { StyledWrapper } from "./layout.styled";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const router = useRouter();

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
    {
      id: "encrypt-data",
      name: t("Common:Storage"),
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

  const hideTabs = pathsWithoutTabs.some((item) => pathname.includes(item));

  return (
    <StyledWrapper hideTabs={hideTabs}>
      <Tabs
        className="tabs"
        items={data}
        selectedItemId={getCurrentTab()}
        onSelect={(e) => onSelect(e)}
      />
      <div className="content">{children}</div>
    </StyledWrapper>
  );
};

export default observer(SettingsLayout);

