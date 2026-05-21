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

import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import SocketHelper, { SocketEvents } from "@docspace/ui-kit/utils/socket";
import type { TOptSocket } from "@docspace/ui-kit/utils/socket";
import { frameCallEvent } from "@docspace/shared/utils/common";

import { useAgentFilesStore } from "../../_store";
import { formatCreated } from "../../_helpers/formatCreated";
import styles from "./AgentFilesList.module.scss";

type Slot = "knowledge" | "result" | "recent";

type Props = {
  folderId: number | string | null;
  slot: Slot;
};

const openFile = (fileId: number) => {
  // Inside an iframe, hand the file off to the parent host so it can route
  // the open however it wants (editor pane, new tab, modal — host decides).
  // Standalone: fall back to the client `openDocEditor` URL pattern.
  if (window.self !== window.parent) {
    frameCallEvent({ event: "onOpenFile", data: { fileId } });
    return;
  }
  window.open(`/doceditor?fileId=${fileId}`, "_blank", "noopener,noreferrer");
};

const AgentFilesList = ({ folderId, slot }: Props) => {
  const { t } = useTranslation(["Common"]);
  const store = useAgentFilesStore();

  React.useEffect(() => {
    if (!folderId) return;
    void store.fetch(slot, folderId);

    // Recent (and other server-side aliases like @favorites) is a virtual
    // aggregation — the portal never emits `s:modify-folder` for it. Mirror
    // client TreeFoldersStore.listenTreeFolders which skips FolderType.Recent
    // from socket subscriptions and just relies on the initial fetch.
    if (typeof folderId !== "number") {
      return () => {
        store.cancelFetch(slot);
      };
    }

    // Live-refresh on socket file/folder mutations within this DIR-{id}.
    // Mirrors client FilesStore's s:modify-folder handler — debounced so a
    // burst of events (bulk upload, multi-delete) collapses to one fetch.
    let pending: number | null = null;
    const refetch = () => {
      if (pending !== null) return;
      pending = window.setTimeout(() => {
        pending = null;
        void store.fetch(slot, folderId);
      }, 200);
    };

    const handler = (opt?: TOptSocket) => {
      if (!opt?.data) return;
      let data: { folderId?: number; parentId?: number; id?: number };
      try {
        data = JSON.parse(opt.data);
      } catch {
        return;
      }
      const matches =
        data.folderId === folderId ||
        data.parentId === folderId ||
        data.id === folderId;
      if (!matches) return;
      if (opt.cmd === "create" || opt.cmd === "update" || opt.cmd === "delete") {
        refetch();
      }
    };

    SocketHelper?.on(SocketEvents.ModifyFolder, handler);
    return () => {
      if (pending !== null) window.clearTimeout(pending);
      SocketHelper?.off(SocketEvents.ModifyFolder, handler);
      // Abort any in-flight fetch so a late response can't write into the
      // unmounted/orphaned slot.
      store.cancelFetch(slot);
    };
  }, [folderId, slot, store]);

  // Client never lands in a state where an AI room is missing its
  // knowledge/result folder — the parent shows a loader while folder
  // discovery is in flight. If discovery fails or returns no folder,
  // hide the slot entirely rather than render an invented fallback.
  if (!folderId) return null;

  if (store.isLoading[slot]) {
    return (
      <div className={styles.loader}>
        <Loader type={LoaderTypes.dualRing} size="40px" />
      </div>
    );
  }

  const files = store.files[slot];
  if (!files.length) {
    return (
      <div className={styles.empty}>
        {t("Common:EmptyFolder", { defaultValue: "This folder is empty" })}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {files.map((file) => (
        <div
          key={file.id}
          className={styles.row}
          role="button"
          tabIndex={0}
          onClick={() => openFile(file.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openFile(file.id);
          }}
        >
          <span className={styles.title}>{file.title}</span>
          <span className={styles.meta}>{formatCreated(file.created)}</span>
        </div>
      ))}
    </div>
  );
};

export default observer(AgentFilesList);
