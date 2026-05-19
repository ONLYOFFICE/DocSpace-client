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

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";

import useDeviceType from "@/hooks/useDeviceType";
import RootScrollbar from "@/app/(docspace)/_components/RootScrollbar";
import { SectionWrapper } from "@/app/(docspace)/_components/section";
import { DeviceTypeObserver } from "@/app/(docspace)/_components/DeviceTypeObserver";
import Dialogs from "@/app/(docspace)/_components/dialogs";

import { useSDKConfig } from "@/providers/SDKConfigProvider";

import { SidebarProvider } from "../../_contexts/SidebarContext";
import DocsSidebar from "../sidebar";
import { useDocsFrameBridge } from "../../_hooks/useDocsFrameBridge";
import Settings from "./index";

import layoutStyles from "../docs-layout/DocsLayout.module.scss";

const DocsSettingsLayoutInner = observer(() => {
  const { t } = useTranslation(["Common"]);
  const { sdkConfig } = useSDKConfig();

  useDocsFrameBridge({ isReady: true });

  return (
    <div className={layoutStyles.root}>
      {sdkConfig?.showMenu !== false && <DocsSidebar />}
      <div className={layoutStyles.sectionArea}>
        <RootScrollbar>
          <SectionWrapper
            sectionHeaderContent={
              <div style={{ padding: "12px 0" }}>
                <Text fontSize="18px" fontWeight={700}>
                  {t("Common:Settings")}
                </Text>
              </div>
            }
            sectionFilterContent={<div />}
            sectionBodyContent={<Settings />}
            isEmptyPage={false}
            filesFilter=""
            showFilter={false}
            viewAs="settings"
          />
          <DeviceTypeObserver />
          <Dialogs />
        </RootScrollbar>
      </div>
    </div>
  );
});

const DocsSettingsLayout = () => {
  const { currentDeviceType } = useDeviceType();

  return (
    <SidebarProvider currentDeviceType={currentDeviceType}>
      <DocsSettingsLayoutInner />
    </SidebarProvider>
  );
};

export default DocsSettingsLayout;
