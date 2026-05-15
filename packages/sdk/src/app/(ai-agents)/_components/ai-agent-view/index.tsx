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

import { Activity } from "react";
import { observer } from "mobx-react";
import dynamic from "next/dynamic";

import NoAgentItem from "../no-agent-item";
import { useAiRoomStore } from "../../_store";

import styles from "./AIAgentView.module.scss";

// NewChat pulls @onlyoffice/ai-chat at module load, which touches `document`
// at the top of the file and crashes Next.js SSR. Load it client-only.
const NewChat = dynamic(() => import("@docspace/ui-kit/ai-agent/new-chat"), {
  ssr: false,
});

const AiAgentView = () => {
  const aiRoomStore = useAiRoomStore();
  const { currentTab, roomId } = aiRoomStore;

  // No room selected — show a no-agent placeholder (ported from client
  // NoAgentItem.tsx in InfoPanel).
  if (!roomId) {
    return <NoAgentItem />;
  }

  // Mirror client AIAgentView: keep NewChat mounted across tab switches
  // via React 19 <Activity>, and render a file-list placeholder for
  // knowledge/result (the SDK does not ship SectionBodyContent).
  return (
    <>
      <Activity mode={currentTab === "chat" ? "visible" : "hidden"}>
        <div className={styles.aiAgentChat}>
          <NewChat />
        </div>
      </Activity>

      {currentTab !== "chat" ? (
        <div style={{ padding: 16, color: "var(--text-color)" }}>
          {currentTab === "knowledge"
            ? "Knowledge files"
            : "Result storage"}
          &nbsp;— файловый список появится после переноса SectionBodyContent
          в SDK.
        </div>
      ) : null}
    </>
  );
};

export default observer(AiAgentView);
