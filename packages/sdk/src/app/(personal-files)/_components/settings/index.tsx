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
import { useTranslation } from "react-i18next";

import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";
import { LoaderWrapper } from "@docspace/ui-kit/components/loader-wrapper";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

import { useDocsUserStore } from "../../_store/DocsUserStore";
import BillingForm from "./category/BillingForm";
import FileManagement from "./category/FileManagement";
import InterfaceTheme from "./category/InterfaceTheme";

const Settings = () => {
  const { t } = useTranslation(["Common", "Profile"]);
  const { user } = useDocsUserStore();
  const canSeeBilling = user?.isAdmin || user?.isOwner;
  const [selectedTabId, setSelectedTabId] = React.useState(() =>
    canSeeBilling ? "billing" : "file-management",
  );
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!isPending) {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    }
  }, [isPending]);

  const wrapContent = (content: React.ReactNode) => (
    <LoaderWrapper isLoading={isPending}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingTop: 16,
        }}
      >
        {content}
      </div>
    </LoaderWrapper>
  );

  const tabs: TTabItem[] = React.useMemo(
    () => [
      ...(canSeeBilling
        ? [
            {
              id: "billing",
              name: "Billing",
              content: wrapContent(<BillingForm />),
            },
          ]
        : []),
      {
        id: "file-management",
        name: t("Common:FileManagement"),
        content: wrapContent(<FileManagement />),
      },
      {
        id: "interface-theme",
        name: t("Common:InterfaceTheme"),
        content: wrapContent(<InterfaceTheme />),
      },
    ],
    [t, isPending, canSeeBilling],
  );

  const onSelect = React.useCallback((tab: TTabItem) => {
    startTransition(() => {
      setSelectedTabId(tab.id);
    });
  }, []);

  return (
    <div>
      <Tabs
        items={tabs}
        selectedItemId={selectedTabId}
        onSelect={onSelect}
        withAnimation
      />
    </div>
  );
};

export default Settings;

