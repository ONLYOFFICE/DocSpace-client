"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";

import { Tabs, type TTabItem } from "@docspace/shared/components/tabs";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";

import { pathsWithoutTabs } from "@/lib/constants";
import useAppState from "@/hooks/useAppState";
import { useRouteAnimation } from "@/hooks/useRouteAnimation";

import { StyledWrapper } from "./layout.styled";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();

  const { settings } = useAppState();

  const standalone = settings?.standalone;

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

      if (standalone) {
        SocketHelper?.emit(SocketCommands.SubscribeInSpaces, {
          roomParts: "backup",
        });
      }
    }

    return () => {
      SocketHelper.off(SocketEvents.BackupProgress);
      SocketHelper.emit(SocketCommands.Unsubscribe, {
        roomParts: "backup",
      });

      if (standalone) {
        SocketHelper?.emit(SocketCommands.UnsubscribeInSpaces, {
          roomParts: "backup",
        });
      }
    };
  }, [standalone]);

  const getCurrentTab = () => {
    const currentTab = data.find((item) => pathname.includes(item.id));
    return currentTab && data.length ? currentTab.id : data[0].id;
  };

  const { startNavigation } = useRouteAnimation({ autoEndOnPathChange: true });

  const onSelect = (e: TTabItem) => {
    startNavigation(`/settings/${e.id}`);
  };

  const hideTabs = pathsWithoutTabs.some((item) => pathname.includes(item));

  return (
    <StyledWrapper hideTabs={hideTabs}>
      <Tabs
        className="tabs"
        items={data}
        selectedItemId={getCurrentTab()}
        onSelect={(e) => onSelect(e)}
        withAnimation
      />
    </StyledWrapper>
  );
};

export default observer(SettingsLayout);
