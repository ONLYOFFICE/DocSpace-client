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
import { observer } from "mobx-react";

import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";

import { getRoomMembers } from "@docspace/shared/api/rooms";
import type { RoomMember } from "@docspace/shared/api/rooms/types";

import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { useFormsAiAgentStore } from "../../_store/FormsAiAgentStore";

import AIAgentForm from "./category/AIAgentForm";
import BillingForm from "./category/BillingForm";
import ConnectDatabaseForm from "./category/ConnectDatabaseForm";
import ContactsForm from "./category/ContactsForm";

const Settings = () => {
  const { t } = useTranslation(["Common"]);
  const { roomId } = useFormsSettingsStore();
  const aiStore = useFormsAiAgentStore();
  const [selectedTabId, setSelectedTabId] = React.useState("payments");
  const [members, setMembers] = React.useState<RoomMember[]>([]);

  const fetchMembers = React.useCallback(() => {
    if (!roomId) return;

    getRoomMembers(roomId, {})
      .then((res) => {
        setMembers(res.items);

        // Sync agent members when access list changes
        if (aiStore.aiAgentEnabled) {
          aiStore.syncAllAgentMembers();
        }
      })
      .catch(() => {});
  }, [roomId, aiStore]);

  React.useEffect(() => {
    if (!roomId) return;

    const abortController = new AbortController();

    getRoomMembers(roomId, {}, abortController.signal)
      .then((res) => {
        setMembers(res.items);
      })
      .catch(() => {});

    return () => {
      abortController.abort();
    };
  }, [roomId]);

  const tabs: TTabItem[] = React.useMemo(
    () => [
      {
        id: "payments",
        name: t("Common:Billing"),
        content: <BillingForm />,
      },
      {
        id: "ai-agent",
        name: t("Common:AIAgent"),
        content: <AIAgentForm inline />,
      },
      {
        id: "access",
        name: t("Common:AccessSettings"),
        content: (
          <ContactsForm
            inline
            members={members}
            onMembersChange={fetchMembers}
          />
        ),
      },
      {
        id: "collect-data",
        name: t("Common:CollectData"),
        content: <ConnectDatabaseForm inline />,
      },
    ],
    [t, members, fetchMembers],
  );

  const onSelect = React.useCallback((tab: TTabItem) => {
    setSelectedTabId(tab.id);
  }, []);

  return (
    <div>
      <Tabs
        items={tabs}
        selectedItemId={selectedTabId}
        onSelect={onSelect}
        withoutStickyIntend
      />
    </div>
  );
};

export default observer(Settings);
