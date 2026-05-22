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

  // All translation keys below are the same ones client's
  // `useFeedTranslation.tsx` uses — no duplicates, no SDK-only invented
  // strings. Trans-style placeholders (e.g. `<1>«{{roomTitle}}»</1>`) are
  // rendered as plain text here because this view is a simple list; the
  // `«{{roomTitle}}»` substring is what the user sees.
  switch (key) {
    case FeedActionKeys.AgentCreated:
      return t("InfoPanel:HistoryAgentCreated", { roomTitle: title });
    case FeedActionKeys.AgentRenamed:
      return t("InfoPanel:AgentRenamed", {
        oldRoomTitle: oldTitle,
        roomTitle: title,
      });
    case FeedActionKeys.RoomCreated:
      return t("InfoPanel:HistoryRoomCreated", { roomTitle: title });
    case FeedActionKeys.RoomRenamed:
      return t("InfoPanel:RoomRenamed", {
        oldRoomTitle: oldTitle,
        roomTitle: title,
      });
    case FeedActionKeys.RoomChangeOwner:
      return t("InfoPanel:RoomChangeOwner");
    case FeedActionKeys.RoomCreateUser:
      return t("Common:RoomCreateUser");
    case FeedActionKeys.RoomRemoveUser:
      return t("InfoPanel:RoomRemoveUser");
    case FeedActionKeys.RoomUpdateAccessForUser:
    case FeedActionKeys.RoomUpdateAccessForGroup:
      return t("InfoPanel:RoomUpdateAccess");
    case FeedActionKeys.RoomGroupAdded:
      return t("InfoPanel:RoomGroupAdded");
    case FeedActionKeys.RoomGroupRemove:
      return t("InfoPanel:RoomGroupRemove");
    case FeedActionKeys.AddedRoomTags:
      return t("InfoPanel:AddedRoomTags");
    case FeedActionKeys.DeletedRoomTags:
      return t("InfoPanel:DeletedRoomTags");
    case FeedActionKeys.RoomLogoCreated:
    case FeedActionKeys.RoomColorChanged:
    case FeedActionKeys.RoomCoverChanged:
    case FeedActionKeys.RoomLogoDeleted:
      return t("InfoPanel:RoomLogoChanged");
    case FeedActionKeys.FileCreated:
    case FeedActionKeys.FileUploaded:
      return t("Common:FileCreatedNotify");
    case FeedActionKeys.FileDeleted:
    case FeedActionKeys.FileMovedToTrash:
      return t("Common:FilesRemovedNotify");
    case FeedActionKeys.FileRenamed:
      return t("Common:FileRenamedNotify");
    case FeedActionKeys.FolderCreated:
      return t("Common:FolderCreatedNotify");
    case FeedActionKeys.FolderDeleted:
    case FeedActionKeys.FolderMovedToTrash:
      return t("Common:FoldersRemovedNotify");
    case FeedActionKeys.FolderRenamed:
      return t("Common:FolderRenamedNotify");
    default:
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
          {t("InfoPanel:HistoryEmptyScreenText", {
            defaultValue: "Activity history will be shown here",
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
