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

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { ContextMenuButton } from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import { Link, LinkTarget, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import {
  getAiThreadArtifacts,
  getAiThreadAttachments,
} from "@docspace/shared/api/ai/threadFiles";
import type { TFile } from "@docspace/shared/api/files/types";

import { useStore } from "SRC_DIR/store/useStore";

import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";

import styles from "./AiAgentContent.module.scss";

/** How often the lists are read again while the tab is shown: a reply may have produced a file. */
export const REFRESH_MS = 15000;

type TThreadFiles = { artifacts: TFile[]; attachments: TFile[] };

const NO_FILES: TThreadFiles = { artifacts: [], attachments: [] };

/**
 * The files of a conversation. The attachments do not hold the artifacts
 * back: a list that cannot be read is shown empty, and only both failing is
 * an error.
 */
export const readThreadFiles = async (
  projectId: number,
  threadId: string,
): Promise<TThreadFiles> => {
  const [artifacts, attachments] = await Promise.allSettled([
    getAiThreadArtifacts(projectId, threadId),
    getAiThreadAttachments(projectId, threadId),
  ]);
  if (artifacts.status === "rejected" && attachments.status === "rejected")
    throw artifacts.reason;
  return {
    artifacts: artifacts.status === "fulfilled" ? artifacts.value : [],
    attachments: attachments.status === "fulfilled" ? attachments.value : [],
  };
};

type AiAgentContentProps = {
  /** The id of the agent whose page is open. */
  projectId: number;
};

/**
 * The Content tab of the Info panel on an agent's page: the files of the
 * conversation on screen - Artifacts, what its replies produced, and
 * Attachments, what the user added to it. It follows the conversation: a new
 * chat shows both empty, another conversation its own files. A file opens in
 * a new tab; its "..." menu downloads it or saves a copy to a room.
 */
const AiAgentContent = observer(({ projectId }: AiAgentContentProps) => {
  const { t } = useTranslation(["Common", "Files"]);
  const threadId = useStore("dialogsStore").aiChatActiveThreadId;
  const { getIcon } = useStore("filesSettingsStore");
  const culture = useStore("settingsStore").culture;
  const { downloadFiles } = useStore("filesActionsStore");
  const filesStore = useStore("filesStore");
  const dialogsStore = useStore("dialogsStore");
  const infoPanelStore = useStore("infoPanelStore");

  const [files, setFiles] = React.useState<TThreadFiles | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
    // A chat not sent yet is no conversation: nothing to read.
    if (!threadId) {
      setFiles(NO_FILES);
      return undefined;
    }
    setFiles(null);
    let cancelled = false;
    const read = (isRefresh: boolean) =>
      readThreadFiles(projectId, threadId)
        .then((data) => !cancelled && setFiles(data))
        // A refresh that fails keeps what is shown.
        .catch(() => !cancelled && !isRefresh && setFailed(true));
    void read(false);
    const timer = setInterval(() => void read(true), REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [projectId, threadId]);

  if (failed)
    return (
      <Text className={styles.message} data-testid="ai-agent-content-error">
        {t("Common:SomethingWentWrong")}
      </Text>
    );

  if (!files) return null;

  // A copy goes through the portal's copy panel, which copies the buffered
  // item when nothing is selected: this file, not what a list held.
  const saveToRoom = (file: TFile) => {
    filesStore.setSelected("none");
    filesStore.setBufferSelection(file as never);
    infoPanelStore.setIsMobileHidden(true);
    dialogsStore.setCopyPanelVisible(true);
  };

  const getRowOptions = (file: TFile): ContextMenuModel[] => [
    {
      key: "ai-agent-content-download",
      label: t("Common:Download"),
      icon: DownloadReactSvgUrl,
      onClick: () => window.open(file.viewUrl, "_self"),
    },
    {
      key: "ai-agent-content-save-to-room",
      label: t("Common:SaveToRoom"),
      icon: CopyToReactSvgUrl,
      onClick: () => saveToRoom(file),
    },
  ];

  const row = (file: TFile) => {
    const details = [
      file.contentLength,
      file.created ? getCorrectDate(culture, file.created) : "",
    ]
      .filter(Boolean)
      .join(" \u00b7 ");
    return (
      <div key={file.id} className={styles.row} data-testid="ai-agent-content-file">
        <img className={styles.icon} src={getIcon(32, file.fileExst)} alt="" />
        <div className={styles.text}>
          <Link
            href={file.webUrl}
            target={LinkTarget.blank}
            fontSize="13px"
            fontWeight={600}
            isTextOverflow
            title={file.title}
            dataTestId="ai-agent-content-open"
          >
            {file.title}
          </Link>
          <Text fontSize="12px" className={styles.details} truncate>
            {details}
          </Text>
        </div>
        <div className={styles.actions}>
          <ContextMenuButton
            directionX="right"
            title={t("Common:Actions")}
            getData={() => getRowOptions(file)}
            testId="ai-agent-content-menu"
          />
        </div>
      </div>
    );
  };

  const section = (
    key: string,
    label: string,
    list: TFile[],
    withDownloadAll: boolean,
  ) => (
    <section className={styles.section} data-testid={`ai-agent-content-${key}`}>
      <div className={styles.header}>
        <Text
          as="h4"
          fontSize="12px"
          fontWeight={600}
          className={styles.heading}
        >
          {label}
        </Text>
        {withDownloadAll && list.length > 1 ? (
          <Link
            type={LinkType.action}
            isHovered
            fontSize="12px"
            fontWeight={600}
            // One archive, through the portal's download operation.
            onClick={() =>
              downloadFiles(
                list.map((file) => file.id),
                [],
                { label: t("Common:ArchivingData") },
              )
            }
            dataTestId="ai-agent-content-download-all"
          >
            {t("Files:DownloadAll")}
          </Link>
        ) : null}
      </div>
      {list.length > 0 ? (
        list.map((file) => row(file))
      ) : (
        <Text fontSize="13px" className={styles.empty}>
          {t("Common:AiContentEmpty")}
        </Text>
      )}
    </section>
  );

  return (
    <div className={styles.content} data-testid="ai-agent-content">
      {section("artifacts", t("Common:AiArtifacts"), files.artifacts, true)}
      {section(
        "attachments",
        t("Common:AiAttachments"),
        files.attachments,
        false,
      )}
    </div>
  );
});

export default AiAgentContent;
