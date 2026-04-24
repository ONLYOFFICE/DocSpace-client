/*
 * (c) Copyright Ascensio System SIA 2009-2026
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { Activity } from "react";
import { inject, observer } from "mobx-react";

import NewChat from "@docspace/ui-kit/ai-agent/new-chat";

import NoAccessContainer, {
  NoAccessContainerType,
} from "SRC_DIR/components/EmptyContainer/NoAccessContainer";
import { SectionBodyContent } from "SRC_DIR/pages/Home/Section";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import type AccessRightsStore from "SRC_DIR/store/AccessRightsStore";

type Props = {
  currentView: string;
  isErrorAIAgentNotAvailable?: FilesStore["isErrorAIAgentNotAvailable"];
  showArticleLoader?: ClientLoadingStore["showArticleLoader"];
  showBodyLoader?: ClientLoadingStore["showBodyLoader"];
  canUseChat?: AccessRightsStore["canUseChat"];
};

const AIAgentViewComponent = ({
  currentView,
  isErrorAIAgentNotAvailable,
  showArticleLoader,
  showBodyLoader,
  canUseChat,
}: Props) => {
  if (
    currentView === "chat" &&
    isErrorAIAgentNotAvailable &&
    !showArticleLoader
  ) {
    return <NoAccessContainer type={NoAccessContainerType.Agent} />;
  }

  const hasNoAccessToChat = !canUseChat && !showBodyLoader;
  const shouldRenderChat =
    !hasNoAccessToChat && (!isErrorAIAgentNotAvailable || showArticleLoader);
  const shouldRenderFiles = currentView !== "chat";

  return (
    <>
      {shouldRenderChat ? (
        <Activity mode={currentView === "chat" ? "visible" : "hidden"}>
          <NewChat />
        </Activity>
      ) : null}

      {shouldRenderFiles ? <SectionBodyContent /> : null}
    </>
  );
};

export const AIAgentView = inject(
  ({ filesStore, clientLoadingStore, accessRightsStore }: TStore) => {
    const { isErrorAIAgentNotAvailable } = filesStore;

    const { showArticleLoader, showBodyLoader } = clientLoadingStore;

    const { canUseChat } = accessRightsStore;

    return {
      isErrorAIAgentNotAvailable,
      showArticleLoader,
      showBodyLoader,
      canUseChat,
    };
  },
)(observer(AIAgentViewComponent));

