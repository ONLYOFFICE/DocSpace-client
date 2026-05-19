/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { usePathname, useRouter } from "next/navigation";
import classNames from "classnames";

import { LoaderWrapper } from "@docspace/ui-kit/components/loader-wrapper";
import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/ui-kit/utils/socket";

import { pathsWithoutTabs } from "@/lib/constants";
import useAppState from "@/hooks/useAppState";
import { useEndAnimation } from "@/hooks/useEndAnimation";

import styles from "./layout.module.scss";

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
    const { socketSubscribers } = SocketHelper!;

    if (!socketSubscribers.has("backup")) {
      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts: "backup",
      });

      if (standalone) {
        SocketHelper?.emit(SocketCommands.SubscribeInSpaces, {
          roomParts: "backup",
        });
      }
    }

    return () => {
      SocketHelper?.off(SocketEvents.BackupProgress);
      SocketHelper?.emit(SocketCommands.Unsubscribe, {
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
    <div
      className={classNames(styles.wrapper, { [styles.hideTabs]: hideTabs })}
    >
      <Tabs
        items={data}
        selectedItemId={selectedId}
        onSelect={(e) => onSelect(e)}
        withAnimation
      />
    </div>
  );
};

export default observer(SettingsLayout);
