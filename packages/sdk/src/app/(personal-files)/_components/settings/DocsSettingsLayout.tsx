// (c) Copyright Ascensio System SIA 2009-2026
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
