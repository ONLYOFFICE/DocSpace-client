// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { observer } from "mobx-react";
import { decode } from "he";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";

import { getHistory } from "@docspace/shared/api/rooms";
import {
  FeedActionKeys,
  type TFeed,
  type TFeedAction,
} from "@docspace/shared/api/rooms/types";

import { useAgentInfoPanelStore } from "../../../_store";
import styles from "../InfoPanel.module.scss";

/**
 * Subset of `FeedActionKeys` that can plausibly appear in an AI-agent
 * history feed (agent room itself + its files/folders + members). File
 * version/lock events that won't fire for an agent are intentionally
 * dropped.
 */
const labelFor = (
  key: FeedActionKeys,
  data: TFeedAction["data"] | undefined,
  t: (
    k: string,
    opts?: Record<string, unknown> & { defaultValue?: string },
  ) => string,
): string => {
  const title = (data?.title || data?.newTitle || data?.oldTitle || "") as string;
  const oldTitle = (data?.oldTitle || "") as string;

  switch (key) {
    case FeedActionKeys.AgentCreated:
    case FeedActionKeys.RoomCreated:
      return t("InfoPanel:HistoryAgentCreated", {
        roomTitle: title,
        defaultValue: "Agent created",
      });
    case FeedActionKeys.AgentRenamed:
    case FeedActionKeys.RoomRenamed:
      return t("Common:HistoryAgentRenamed", {
        defaultValue: oldTitle
          ? `Renamed «${oldTitle}» → «${title}»`
          : "Renamed agent",
      });
    case FeedActionKeys.RoomChangeOwner:
      return t("Common:HistoryOwnerChanged", {
        defaultValue: "Owner changed",
      });
    case FeedActionKeys.RoomCreateUser:
      return t("Common:HistoryMemberAdded", {
        defaultValue: title ? `Added member: ${title}` : "Member added",
      });
    case FeedActionKeys.RoomRemoveUser:
      return t("Common:HistoryMemberRemoved", {
        defaultValue: title ? `Removed member: ${title}` : "Member removed",
      });
    case FeedActionKeys.RoomUpdateAccessForUser:
      return t("Common:HistoryAccessChanged", {
        defaultValue: title ? `Access changed: ${title}` : "Access changed",
      });
    case FeedActionKeys.RoomGroupAdded:
      return t("Common:HistoryGroupAdded", {
        defaultValue: title ? `Group added: ${title}` : "Group added",
      });
    case FeedActionKeys.RoomGroupRemove:
      return t("Common:HistoryGroupRemoved", {
        defaultValue: title ? `Group removed: ${title}` : "Group removed",
      });
    case FeedActionKeys.RoomUpdateAccessForGroup:
      return t("Common:HistoryGroupAccessChanged", {
        defaultValue: title
          ? `Group access changed: ${title}`
          : "Group access changed",
      });
    case FeedActionKeys.AddedRoomTags:
      return t("Common:HistoryTagsAdded", {
        defaultValue: "Tags added",
      });
    case FeedActionKeys.DeletedRoomTags:
      return t("Common:HistoryTagsRemoved", {
        defaultValue: "Tags removed",
      });
    case FeedActionKeys.RoomLogoCreated:
    case FeedActionKeys.RoomColorChanged:
    case FeedActionKeys.RoomCoverChanged:
      return t("Common:HistoryAppearanceUpdated", {
        defaultValue: "Appearance updated",
      });
    case FeedActionKeys.RoomLogoDeleted:
      return t("Common:HistoryLogoRemoved", {
        defaultValue: "Logo removed",
      });
    case FeedActionKeys.FileCreated:
    case FeedActionKeys.FileUploaded:
      return t("Common:HistoryFileAdded", {
        defaultValue: title ? `Added file: ${title}` : "File added",
      });
    case FeedActionKeys.FileDeleted:
    case FeedActionKeys.FileMovedToTrash:
      return t("Common:HistoryFileDeleted", {
        defaultValue: title ? `Deleted file: ${title}` : "File deleted",
      });
    case FeedActionKeys.FileRenamed:
      return t("Common:HistoryFileRenamed", {
        defaultValue: oldTitle
          ? `File renamed «${oldTitle}» → «${title}»`
          : title
            ? `File renamed: ${title}`
            : "File renamed",
      });
    case FeedActionKeys.FolderCreated:
      return t("Common:HistoryFolderAdded", {
        defaultValue: title ? `Added folder: ${title}` : "Folder added",
      });
    case FeedActionKeys.FolderDeleted:
    case FeedActionKeys.FolderMovedToTrash:
      return t("Common:HistoryFolderDeleted", {
        defaultValue: title ? `Deleted folder: ${title}` : "Folder deleted",
      });
    case FeedActionKeys.FolderRenamed:
      return t("Common:HistoryFolderRenamed", {
        defaultValue: title ? `Folder renamed: ${title}` : "Folder renamed",
      });
    default:
      // unknown / irrelevant for agents — still show something so the
      // event isn't lost in QA
      return key;
  }
};

const HistoryView = observer(() => {
  const { t, i18n } = useTranslation(["Common", "InfoPanel"]);
  const { currentAgent } = useAgentInfoPanelStore();
  const culture = i18n.language || "en";

  const [feed, setFeed] = React.useState<TFeedAction[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!currentAgent) return;
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    getHistory(
      "folder",
      currentAgent.id,
      { page: 0, startIndex: 0, count: 100 },
      controller.signal,
    )
      .then((res: TFeed) => {
        if (cancelled) return;
        setFeed(res.items ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        toastr.error(err instanceof Error ? err.message : String(err));
        setFeed([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentAgent]);

  if (!currentAgent) return null;

  if (loading && !feed) {
    return (
      <div className={styles.emptyState}>
        <Text fontSize="13px">{t("Common:LoadingProcessing")}</Text>
      </div>
    );
  }

  if (!feed || feed.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text fontSize="13px">
          {t("Common:EmptyHistoryDescription", {
            defaultValue: "No history yet",
          })}
        </Text>
      </div>
    );
  }

  return (
    <ul className={styles.historyList}>
      {feed.map((event) => {
        const initiator = event.initiator;
        const name = initiator?.displayName
          ? initiator.isAnonim
            ? t("Common:Anonymous", { defaultValue: "Anonymous" })
            : decode(initiator.displayName)
          : "—";
        const label = labelFor(event.action.key, event.data, t);
        return (
          <li key={event.id} className={styles.historyRow}>
            <Avatar
              size={AvatarSize.min}
              role={AvatarRole.user}
              source={initiator?.avatarSmall}
              userName={name}
              hideRoleIcon
            />
            <div className={styles.historyContent}>
              <Text fontSize="13px" fontWeight={600}>
                {name}
              </Text>
              <Text fontSize="13px" fontWeight={400}>
                {label}
              </Text>
              <Text fontSize="11px" fontWeight={400} className={styles.historyDate}>
                {getCorrectDate(culture, event.date)}
              </Text>
            </div>
          </li>
        );
      })}
    </ul>
  );
});

export default HistoryView;
