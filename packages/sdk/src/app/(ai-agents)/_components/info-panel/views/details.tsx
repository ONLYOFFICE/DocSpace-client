// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { observer } from "mobx-react";
import { decode } from "he";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";

import type { TAgent } from "@docspace/shared/api/ai/types";

import { useAgentInfoPanelStore } from "../../../_store";
import styles from "../InfoPanel.module.scss";

type RowProps = {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "link" | "muted";
};

const Row = ({ title, children, variant = "default" }: RowProps) => {
  const valueClass =
    variant === "link"
      ? styles.propertyLink
      : variant === "muted"
        ? styles.propertyMuted
        : styles.propertyContent;
  return (
    <div className={styles.property}>
      <Text as="span" className={styles.propertyTitle}>
        {title}
      </Text>
      <Text as="span" className={valueClass}>
        {children}
      </Text>
    </div>
  );
};

const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const DetailsView = observer(() => {
  const { t, i18n } = useTranslation(["Common"]);
  const { currentAgent } = useAgentInfoPanelStore();

  if (!currentAgent) return null;

  const agent: TAgent = currentAgent;

  const renderPerson = (person?: TAgent["createdBy"]) => {
    if (!person?.displayName) return "—";
    if (person.isAnonim)
      return t("Common:Anonymous", { defaultValue: "Anonymous" });
    return decode(person.displayName);
  };

  const culture = i18n.language || "en";

  const folders = agent.foldersCount ?? 0;
  const files = agent.filesCount ?? 0;
  const contentLabel = `${t("Common:Folders", { defaultValue: "Folders" })}: ${folders} | ${t("Common:Files", { defaultValue: "Files" })}: ${files}`;

  const storageLabel =
    agent.usedSpace !== undefined && agent.quotaLimit !== undefined
      ? `${formatBytes(agent.usedSpace)} / ${formatBytes(agent.quotaLimit)}`
      : formatBytes(agent.usedSpace);

  return (
    <>
      <div className={styles.thumbnail}>
        <RoomIcon
          color={agent.logo?.color}
          title={agent.title || ""}
          isArchive={Boolean(agent.isArchive)}
          size="144px"
          radius="16px"
          showDefault={!agent.logo?.large && !agent.logo?.cover}
          logo={agent.logo?.large || agent.logo}
          dataTestId="info_panel_details_agent_icon"
        />
      </div>

      <div className={styles.subtitle}>
        <Text fontWeight={600} fontSize="14px">
          {t("Common:Properties", { defaultValue: "Properties" })}
        </Text>
      </div>

      <div className={styles.properties}>
        <Row title={t("Common:Owner", { defaultValue: "Owner" })} variant="link">
          {renderPerson(agent.createdBy)}
        </Row>
        <Row title={t("Common:Content", { defaultValue: "Content" })}>
          {contentLabel}
        </Row>
        <Row title={t("Common:DateModified", { defaultValue: "Date modified" })}>
          {getCorrectDate(culture, agent.updated)}
        </Row>
        <Row
          title={t("Common:LastModifiedBy", {
            defaultValue: "Last modified by",
          })}
          variant="link"
        >
          {renderPerson(agent.updatedBy ?? agent.createdBy)}
        </Row>
        <Row title={t("Common:CreationDate", { defaultValue: "Creation date" })}>
          {getCorrectDate(culture, agent.created)}
        </Row>
        <Row
          title={
            agent.quotaLimit !== undefined
              ? t("Common:StorageAndQuota", {
                  defaultValue: "Storage and quota",
                })
              : t("Common:Storage", { defaultValue: "Storage" })
          }
          variant="muted"
        >
          {storageLabel}
        </Row>
      </div>
    </>
  );
});

export default DetailsView;
