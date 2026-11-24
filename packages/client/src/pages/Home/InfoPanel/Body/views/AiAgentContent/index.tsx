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
import { when } from "mobx";
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

/**
 * How long a signal that the conversation's files changed waits before the
 * lists are read again: a round reports a tool result and then its end, and
 * the burst becomes one pair of requests.
 */
export const REFRESH_DELAY_MS = 400;

type TThreadFiles = { artifacts: TFile[]; attachments: TFile[] };

const NO_FILES: TThreadFiles = { artifacts: [], attachments: [] };

const sameList = (a: TFile[], b: TFile[]) =>
  a.length === b.length &&
  a.every(
    (file, i) =>
      file.id === b[i].id &&
      file.title === b[i].title &&
      file.contentLength === b[i].contentLength &&
      file.updated === b[i].updated,
  );

/** The same files as shown: kept as they are, so no row is drawn again. */
const sameFiles = (a: TThreadFiles | null, b: TThreadFiles) =>
  !!a &&
  sameList(a.artifacts, b.artifacts) &&
  sameList(a.attachments, b.attachments);

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
 * a new tab; its "..." menu downloads it, saves a copy to a room or opens
 * the room or folder it is in.
 *
 * The server announces no new file, so the lists are read again when the
 * chat reports a round of this conversation that may have produced one
 * (dialogsStore.aiChatThreadFilesChange, fed from the chat's callbacks in
 * Shell), and when the browser tab is shown again: a round finished out of
 * sight, or on another device, reports nothing here.
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

  // A change reported for another conversation is none of this tab's.
  const change = dialogsStore.aiChatThreadFilesChange;
  const refreshKey =
    threadId && change.threadId === threadId ? change.seq : 0;

  const [files, setFiles] = React.useState<TThreadFiles | null>(null);
  const [failed, setFailed] = React.useState(false);

  const filesRef = React.useRef(files);
  filesRef.current = files;
  // Only the latest read may show its answer: an earlier one, of this
  // conversation or of the one before, may come back after it.
  const latestRef = React.useRef(0);
  const prevThreadRef = React.useRef(threadId);
  // The last change already covered by a read, so a change seen again on
  // coming back to a conversation does not read it twice.
  const handledSeqRef = React.useRef(0);

  const read = React.useCallback(() => {
    if (!threadId) return;
    latestRef.current += 1;
    const id = latestRef.current;
    readThreadFiles(projectId, threadId)
      .then((data) => {
        if (id !== latestRef.current) return;
        // A read again may recover from a first read that failed.
        setFailed(false);
        setFiles((shown) => (sameFiles(shown, data) ? shown : data));
      })
      .catch(() => {
        // A read again that fails keeps what is shown.
        if (id === latestRef.current && !filesRef.current) setFailed(true);
      });
  }, [projectId, threadId]);

  const readRef = React.useRef(read);
  readRef.current = read;

  React.useEffect(() => {
    // Whatever is still on its way belongs to what was shown before.
    latestRef.current += 1;
    handledSeqRef.current = dialogsStore.aiChatThreadFilesChange.seq;
    setFailed(false);
    const prevThreadId = prevThreadRef.current;
    prevThreadRef.current = threadId;
    // A chat not sent yet is no conversation: nothing to read.
    if (!threadId) {
      setFiles(NO_FILES);
      return;
    }
    // Another conversation hides the files of the last one. The one a new
    // chat has just become keeps its empty lists until its files come.
    if (prevThreadId) setFiles(null);
    read();
  }, [projectId, threadId]);

  React.useEffect(() => {
    if (!refreshKey || refreshKey <= handledSeqRef.current) return undefined;
    handledSeqRef.current = refreshKey;
    const timer = setTimeout(() => readRef.current(), REFRESH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  React.useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") readRef.current();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

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
    // The copy panel leaves the buffered item where it is when it closes,
    // and the Info panel shows a buffered item in place of the open folder:
    // without this the agent's panel would stay the panel of this file, as
    // the agent's page has no list whose click takes the buffer away. It
    // outlives this view, which the panel may put away meanwhile.
    when(
      () => !dialogsStore.copyPanelVisible,
      () => {
        if (filesStore.bufferSelection?.id === file.id)
          filesStore.setBufferSelection(null);
      },
    );
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
    // No "Open location": every file listed lies in a folder of the
    // conversation that is internal to the agent and read-only to its
    // author, so the conversation itself is where the file is.
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
