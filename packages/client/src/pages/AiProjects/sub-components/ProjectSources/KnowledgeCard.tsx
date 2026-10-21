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

import { Card } from "@onlyoffice/apps-ui-kit/components/card";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ProgressBar } from "@onlyoffice/apps-ui-kit/components/progress-bar";
import { Loader, LoaderTypes } from "@onlyoffice/apps-ui-kit/components/loader";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { VectorizationStatus } from "@docspace/shared/enums";
import { iconSize32 } from "@docspace/shared/utils/image-helpers";
import { FailedVectorizationBadge } from "@docspace/shared/components/failed-vectorization-badge";

import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";
import { useStore } from "SRC_DIR/store/useStore";

import { useKnowledgeFiles, type TKnowledgeFile } from "../../hooks/useKnowledgeFiles";
import { SourceCardTitle } from "./SourceCardTitle";
import styles from "./ProjectSources.module.scss";

type KnowledgeCardProps = {
  onChangeRoom: (room: TAiPreset["knowledgeRoom"]) => void;
};

/**
 * The project's knowledge base: the room's name, how much of it is indexed,
 * and its files with the indexing state of each; a menu connects another
 * Knowledge room or disconnects it.
 */
export const KnowledgeCard = observer(({ onChangeRoom }: KnowledgeCardProps) => {
  const { t } = useTranslation(["Common"]);
  const { useCloudsStore } = useStores();
  const filesSettingsStore = useStore("filesSettingsStore");

  const selected = useCloudsStore((s) => s.selectedKnowledgeFolder);
  const knowledgeFolders = useCloudsStore((s) => s.knowledgeFolders);
  const fetchKnowledgeFolders = useCloudsStore((s) => s.fetchKnowledgeFolders);

  React.useEffect(() => {
    void fetchKnowledgeFolders();
  }, [fetchKnowledgeFolders]);

  const { files, total, indexed } = useKnowledgeFiles(selected?.room.id ?? null);

  const getData = React.useCallback((): ContextMenuModel[] => {
    const rooms = knowledgeFolders.flatMap((folder) =>
      folder.rooms.map((room) => ({ cloud: folder.cloud, room })),
    );
    const model: ContextMenuModel[] = [];
    if (rooms.length > 0) {
      model.push({
        key: "change-knowledge-room",
        label: t("Common:AIProjectChangeKnowledge"),
        items: rooms.map(({ cloud, room }) => ({
          key: `knowledge-room-${room.id}`,
          label: room.name,
          checked: room.id === selected?.room.id,
          onClick: () =>
            onChangeRoom({ cloud, id: room.id, name: room.name }),
        })),
      });
    }
    if (selected) {
      model.push({
        key: "disconnect-knowledge-room",
        label: t("Common:Disconnect"),
        onClick: () => onChangeRoom(null),
      });
    }
    return model;
  }, [knowledgeFolders, selected, onChangeRoom, t]);

  const renderStatus = (file: TKnowledgeFile) => {
    switch (file.status) {
      // An indexed file is the normal state: the count above says it, and
      // only the files that are not there yet carry a mark.
      case VectorizationStatus.Completed:
        return null;
      case VectorizationStatus.InProgress:
        return (
          <span className={styles.statusBusy}>
            <Loader
              type={LoaderTypes.oval}
              size="12px"
              label={t("Common:AIProjectIndexing")}
            />
            <Text className={styles.status}>{t("Common:AIProjectIndexing")}</Text>
          </span>
        );
      case VectorizationStatus.Failed:
        return <FailedVectorizationBadge />;
      default:
        return (
          <Text className={styles.status}>{t("Common:AIProjectNotIndexed")}</Text>
        );
    }
  };

  return (
    <Card
      className={styles.card}
      dataTestId="ai-project-knowledge"
      title={
        <SourceCardTitle
          icon={iconSize32.get("knowledgeRoom.svg") ?? ""}
          label={t("Common:Knowledge")}
          name={selected?.room.name ?? t("Common:AIProjectNotSet")}
        />
      }
      extra={
        <ContextMenuButton
          className={styles.menu}
          displayType={ContextMenuButtonDisplayType.dropdown}
          getData={getData}
          directionX="right"
          title={t("Common:AIProjectChangeKnowledge")}
        />
      }
    >
      {selected ? (
        <div className={styles.body}>
          <ProgressBar
            percent={total > 0 ? Math.round((indexed / total) * 100) : 0}
            status={t("Common:AIProjectKnowledgeIndexed", { indexed, total })}
          />
          {files.length > 0 ? (
            <ul className={styles.list}>
              {files.map((file) => (
                <li key={file.id} className={styles.row}>
                  <img
                    className={styles.fileIcon}
                    src={filesSettingsStore.getIcon(24, file.fileExst)}
                    alt=""
                    aria-hidden="true"
                  />
                  <Text className={styles.rowName} truncate title={file.title}>
                    {file.title}
                  </Text>
                  {renderStatus(file)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
});

export default KnowledgeCard;
