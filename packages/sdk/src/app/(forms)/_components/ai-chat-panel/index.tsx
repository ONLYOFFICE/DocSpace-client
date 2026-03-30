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
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import Chat from "@docspace/ui-kit/ai-agent/chat";

import { useFormsAiAgentStore } from "../../_store/FormsAiAgentStore";
import { useFormsNavigationStore } from "../../_store/FormsNavigationStore";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";

import ResizeHandle from "./ResizeHandle";
import styles from "./AiChatPanel.module.scss";

type AiChatPanelProps = {
  rootRef: React.RefObject<HTMLDivElement | null>;
};

const AiChatPanel = ({ rootRef }: AiChatPanelProps) => {
  const { t } = useTranslation(["Common"]);
  const aiAgentStore = useFormsAiAgentStore();
  const {
    isPanelVisible,
    closePanel,
    isSyncing,
    currentAgentId,
    pendingAttachmentFile,
    panelPosition,
    panelWidth,
    setPanelPosition,
    setPanelWidth,
  } = aiAgentStore;
  const { filesSettings, hasManagementAccess } = useFormsSettingsStore();
  const { editingFile } = useFormsNavigationStore();

  const panelRef = React.useRef<HTMLDivElement>(null);

  const agentRoomId = currentAgentId ?? 0;

  const { getIcon: getIconRaw } = useItemIcon({
    filesSettings: filesSettings!,
  });

  const getIcon = React.useCallback(
    (size: number, fileExst: string) =>
      getIconRaw(fileExst, size as 24 | 32 | 64 | 96),
    [getIconRaw],
  );

  const [attachmentFile, setAttachmentFile] = React.useState<Partial<
    import("@docspace/ui-kit/types").TFile
  > | null>(null);

  React.useEffect(() => {
    if (pendingAttachmentFile) {
      setAttachmentFile(
        pendingAttachmentFile as Partial<
          import("@docspace/ui-kit/types").TFile
        >,
      );
    }
  }, [pendingAttachmentFile]);

  const clearAttachmentFile = React.useCallback(() => {
    setAttachmentFile(null);
  }, []);

  const getResultStorageId = React.useCallback(() => null, []);

  const isAskFromDB = !!pendingAttachmentFile;

  const emptyScreenText = React.useMemo(() => {
    if (!pendingAttachmentFile?.title) return undefined;
    const name = pendingAttachmentFile.title.replace(/\.[^.]+$/, "");
    return t("Common:AskAboutFormData", { name });
  }, [pendingAttachmentFile?.title, t]);

  const askFromDBSamples = React.useMemo(
    () =>
      pendingAttachmentFile?.title
        ? [
            {
              title: t("Common:TotalSubmissions"),
              prompt: t("Common:TotalSubmissionsPrompt", {
                formName: pendingAttachmentFile.title,
              }),
            },
            {
              title: t("Common:RecentResponses"),
              prompt: t("Common:RecentResponsesPrompt", {
                formName: pendingAttachmentFile.title,
              }),
            },
            {
              title: t("Common:WhoFilledItOut"),
              prompt: t("Common:WhoFilledItOutPrompt", {
                formName: pendingAttachmentFile.title,
              }),
            },
            {
              title: t("Common:Summary"),
              prompt: t("Common:SummaryPrompt", {
                formName: pendingAttachmentFile.title,
              }),
            },
          ]
        : undefined,
    [pendingAttachmentFile?.title, t],
  );

  const handleResizeEnd = React.useCallback(
    (width: number) => {
      setPanelWidth(width);
    },
    [setPanelWidth],
  );

  const handleTogglePosition = React.useCallback(() => {
    setPanelPosition(panelPosition === "left" ? "right" : "left");
  }, [panelPosition, setPanelPosition]);

  if (!isPanelVisible || !agentRoomId || !hasManagementAccess || editingFile)
    return null;

  return (
    <div
      ref={panelRef}
      className={styles.chatPanel}
      data-position={panelPosition}
      style={{ width: panelWidth }}
    >
      <ResizeHandle
        position={panelPosition}
        panelRef={panelRef}
        rootRef={rootRef}
        onResizeEnd={handleResizeEnd}
      />
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <Text fontSize="16px" fontWeight={700}>
            {t("Common:AIAgent")}
          </Text>
          {isSyncing && (
            <span
              title={t("Common:SyncingKnowledgeBase")}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Loader type={LoaderTypes.track} size="16px" />
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          <IconButton
            iconName={LogoutReactSvgUrl}
            size={16}
            className={
              panelPosition === "right" ? styles.positionIconFlipped : undefined
            }
            onClick={handleTogglePosition}
            tooltipId="move-panel-tooltip"
            tooltipContent={
              panelPosition === "right"
                ? t("Common:MovePanelLeft")
                : t("Common:MovePanelRight")
            }
          />
          <IconButton
            iconName={CrossReactSvgUrl}
            size={17}
            onClick={closePanel}
            tooltipId="close-panel-tooltip"
            tooltipContent={t("Common:CloseButton")}
          />
        </div>
      </div>

      <div className={styles.chatBody}>
        <Chat
          agentId={agentRoomId}
          selectedModel=""
          getIcon={getIcon}
          attachmentFile={attachmentFile}
          clearAttachmentFile={clearAttachmentFile}
          hideAttachments={isAskFromDB}
          emptyScreenText={emptyScreenText}
          withSamples={isAskFromDB}
          samples={askFromDBSamples}
          standalone
          getResultStorageId={getResultStorageId}
        />
      </div>
    </div>
  );
};

export default observer(AiChatPanel);
