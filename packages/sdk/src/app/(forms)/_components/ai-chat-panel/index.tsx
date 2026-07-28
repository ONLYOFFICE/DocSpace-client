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
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { DeviceType } from "@docspace/shared/enums";

import Chat from "@docspace/ui-kit/ai-agent/chat";

import useDeviceType from "@/hooks/useDeviceType";
import { useFormsAiAgentStore } from "../../_store/FormsAiAgentStore";
import { useFormsNavigationStore } from "../../_store/FormsNavigationStore";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import ArrowLeftReactSvgUrl from "PUBLIC_DIR/images/arrow.left.react.svg?url";
import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";

import ResizeHandle from "./ResizeHandle";
import styles from "./AiChatPanel.module.scss";

type AiChatPanelProps = {
  rootRef: React.RefObject<HTMLDivElement | null>;
  headerOffset?: number;
  headerHeight?: number;
};

const AiChatPanel = ({
  rootRef,
  headerOffset = 0,
  headerHeight = 0,
}: AiChatPanelProps) => {
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
  const { currentDeviceType } = useDeviceType();
  const isMobile = currentDeviceType === DeviceType.mobile;

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

  const chatHeaderStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!headerOffset && !headerHeight) return undefined;
    const style: React.CSSProperties = {};
    if (headerOffset) style.paddingInlineStart = `${16 + headerOffset}px`;
    if (headerHeight) style.height = `${headerHeight}px`;
    return style;
  }, [headerOffset, headerHeight]);

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
      <div className={styles.chatHeader} style={chatHeaderStyle}>
        <div className={styles.headerTitle}>
          {isMobile && (
            <IconButton
              iconName={ArrowLeftReactSvgUrl}
              size={16}
              onClick={closePanel}
              tooltipId="close-panel-tooltip"
              tooltipContent={t("Common:CloseButton")}
            />
          )}
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
          {!isMobile && (
            <>
              <IconButton
                iconName={LogoutReactSvgUrl}
                size={16}
                className={
                  panelPosition === "right"
                    ? styles.positionIconFlipped
                    : undefined
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
            </>
          )}
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
