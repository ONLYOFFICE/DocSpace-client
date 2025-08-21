// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { usePathname, useRouter } from "next/navigation";

import { LoaderWrapper } from "@docspace/shared/components/loader-wrapper";
import { Tabs, type TTabItem } from "@docspace/shared/components/tabs";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";

import { pathsWithoutTabs } from "@/lib/constants";
import useAppState from "@/hooks/useAppState";
import { useEndAnimation } from "@/hooks/useEndAnimation";

import { StyledWrapper } from "./layout.styled";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const router = useRouter();

  const { settings } = useAppState();
  const isLoading = useEndAnimation();
  const standalone = settings?.standalone;

  const data = [
    {
      id: "branding",
      name: t("Common:Branding"),
      content: <LoaderWrapper isLoading={isLoading}>{children}</LoaderWrapper>,
    },
    {
      id: "data-backup",
      name: t("Common:DataBackup"),
      content: <LoaderWrapper isLoading={isLoading}>{children}</LoaderWrapper>,
    },
    {
      id: "auto-backup",
      name: t("Common:AutoBackup"),
      content: <LoaderWrapper isLoading={isLoading}>{children}</LoaderWrapper>,
    },
    {
      id: "restore",
      name: t("Common:RestoreBackup"),
      content: <LoaderWrapper isLoading={isLoading}>{children}</LoaderWrapper>,
    },
    {
      id: "encrypt-data",
      name: t("Common:Storage"),
      content: <LoaderWrapper isLoading={isLoading}>{children}</LoaderWrapper>,
    },
  ];

  const getCurrentTab = () => {
    const currentTab = data.find((item) => pathname.includes(item.id));
    return currentTab && data.length ? currentTab.id : data[0].id;
  };

  const [selectedId, setSelectedId] = useState<string>(getCurrentTab());

  useEffect(() => {
    setSelectedId(getCurrentTab());
  }, [pathname]);

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

  const onSelect = (e: TTabItem) => {
    setSelectedId(e.id);
    router.push(`/settings/${e.id}`);
  };

  const hideTabs = pathsWithoutTabs.some((item) => pathname.includes(item));

  return (
    <StyledWrapper hideTabs={hideTabs}>
      <Tabs
        items={data}
        selectedItemId={selectedId}
        onSelect={(e) => onSelect(e)}
        withAnimation
      />
    </StyledWrapper>
  );
};

export default observer(SettingsLayout);
