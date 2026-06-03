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

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import CheckRoundReactSvgUrl from "PUBLIC_DIR/images/icons/16/check.round.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";

import { Badge } from "@docspace/ui-kit/components/badge";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Row, RowContainer } from "@docspace/ui-kit/components/rows";
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "@docspace/ui-kit/components/table";
import type { TTableColumn } from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { DeviceType } from "@docspace/ui-kit/enums";
import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";
import { Provider } from "@docspace/ui-kit/utils/context";
import { isMobile, isTablet } from "@docspace/ui-kit/utils/device";

import { downloadQuota } from "@docspace/shared/api/docs-cloud";

import { InfoTile } from "../_components/InfoTile";
import { PropertyRow } from "../_components/PropertyRow";
import { StatRowContent } from "../_components/StatRowContent";
import type { InformationTabProps, StatRow } from "../types";
import styles from "./Information.module.scss";

const COLUMN_STORAGE_NAME = "docsCloudStatsColumns_v1";
const COLUMN_INFO_PANEL_STORAGE_NAME = "docsCloudStatsInfoPanelColumns_v1";

const getDeviceType = (): DeviceType => {
  if (typeof window === "undefined") return DeviceType.desktop;
  if (isMobile()) return DeviceType.mobile;
  if (isTablet()) return DeviceType.tablet;
  return DeviceType.desktop;
};

// Inner component — must be a child of Provider to call useViewEffect
const InformationTabContent = ({ info }: InformationTabProps) => {
  const { t } = useTranslation(["DocsCloud", "Common"]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewAs, setViewAs] = useState<"table" | "row">("table");
  const [currentDeviceType, setCurrentDeviceType] = useState(getDeviceType);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleViewChange = (view: string) => {
    if (view === "table" || view === "row") setViewAs(view);
  };

  useViewEffect({ view: viewAs, setView: handleViewChange, currentDeviceType });

  useEffect(() => {
    const handleResize = () => setCurrentDeviceType(getDeviceType());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadQuota();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quota-${info.alias}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const columns: TTableColumn[] = [
    {
      key: "Name",
      title: t("Common:Name"),
      default: true,
      enable: true,
      resizable: false,
      minWidth: 120,
    },
    {
      key: "active",
      title: t("Active"),
      enable: true,
      resizable: true,
      minWidth: 60,
    },
    {
      key: "internal",
      title: t("DocsCloud:Internal"),
      enable: true,
      resizable: true,
      minWidth: 60,
    },
    {
      key: "external",
      title: t("DocsCloud:External"),
      enable: true,
      resizable: true,
      minWidth: 60,
    },
    {
      key: "remaining",
      title: t("DocsCloud:Remaining"),
      enable: true,
      resizable: true,
      minWidth: 60,
    },
  ];

  const statRows: StatRow[] = [
    {
      label: t("DocsCloud:EditorsMode"),
      active: info.activeEditorsCount,
      internal: info.internalEditorsCount,
      external: info.externalEditorsCount,
      remaining: info.remainingEditorsCount,
    },
    {
      label: t("DocsCloud:LiveViewerMode"),
      active: info.activeViewersCount,
      internal: info.internalViewersCount,
      external: info.externalViewersCount,
      remaining: info.remainingViewersCount,
    },
    {
      label: t("DocsCloud:EditorsMode"),
      isMonthly: true,
      active: info.monthlyActiveEditors,
      internal: null,
      external: null,
      remaining: null,
    },
    {
      label: t("DocsCloud:LiveViewerMode"),
      isMonthly: true,
      active: info.monthlyActiveViewers,
      internal: null,
      external: null,
      remaining: null,
    },
  ];

  const formatRowValues = (row: StatRow) => {
    const parts: string[] = [`${t("Active")}: ${row.active ?? "—"}`];
    if (row.internal !== null)
      parts.push(`${t("DocsCloud:Internal")}: ${row.internal}`);
    if (row.external !== null)
      parts.push(`${t("DocsCloud:External")}: ${row.external}`);
    if (row.remaining !== null)
      parts.push(`${t("DocsCloud:Remaining")}: ${row.remaining}`);
    return parts.join(" . ");
  };

  const hasExternalUsers =
    info.externalEditorsCount + info.externalViewersCount > 0;

  return (
    <>
      {/* Meta tiles */}
      <div className={styles.infoTileRow}>
        <InfoTile label={t("DocsCloud:Build")} value={info.buildVersion} />
        <InfoTile
          label={t("Common:ValidUntil")}
          value={formatDate(info.licenseDate)}
        />
        <InfoTile label={t("DocsCloud:UsersLimit")} value={info.usersLimit} />
      </div>

      {/* Document Service */}
      <div className={styles.sectionHead}>
        <span className={styles.sectionTitle}>
          {t("DocsCloud:DocumentService")}
        </span>
        {info.isActive && (
          <span className={`${styles.pill} ${styles.pillOk}`}>
            <span className={styles.pillDot} />
            {t("Common:Connected")}
          </span>
        )}
      </div>
      <div className={styles.propertyCard}>
        <PropertyRow label={t("DocsCloud:DocServerAddress")}>
          <a
            href={info.docServerAddress}
            target="_blank"
            rel="noopener noreferrer"
          >
            {info.docServerAddress}
          </a>
          <IconButton
            iconName={copied ? CheckRoundReactSvgUrl : CopyReactSvgUrl}
            size={12}
            isClickable
            onClick={() => {
              navigator.clipboard
                ?.writeText(info.docServerAddress)
                .catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          />
        </PropertyRow>
        <PropertyRow label={t("DocumentServiceAuthHeader")}>
          <span className={styles.codeChip}>{info.authorizationHeader}</span>
        </PropertyRow>
        <PropertyRow label={t("DocsCloud:DocumentServerSecret")}>
          {info.documentServerSecret ? (
            <>
              <span className={styles.mono}>
                {showSecret ? info.documentServerSecret : "••••••••••••"}
              </span>
              <IconButton
                iconName={showSecret ? EyeOffReactSvgUrl : EyeReactSvgUrl}
                size={12}
                isClickable
                className={styles.iconBtn}
                onClick={() => setShowSecret((s) => !s)}
              />
            </>
          ) : (
            "—"
          )}
        </PropertyRow>
      </div>

      {/* License Usage */}
      <div className={styles.sectionHead}>
        <span className={styles.sectionTitle}>
          {t("DocsCloud:LicenseUsage")}
        </span>
        {hasExternalUsers && (
          <span className={`${styles.pill} ${styles.pillWarn}`}>
            <span className={styles.pillDot} />
            {t("DocsCloud:ExternalUsersActive")}
          </span>
        )}
      </div>

      {viewAs === "table" ? (
        <TableContainer
          useReactWindow={false}
          forwardedRef={containerRef}
          className={styles.statsTable}
        >
          <TableHeader
            containerRef={containerRef}
            columns={columns}
            columnStorageName={COLUMN_STORAGE_NAME}
            columnInfoPanelStorageName={COLUMN_INFO_PANEL_STORAGE_NAME}
            sectionWidth={0}
            useReactWindow={false}
            showSettings={false}
            sortingVisible={false}
          />
          <TableBody
            columnStorageName={COLUMN_STORAGE_NAME}
            columnInfoPanelStorageName={COLUMN_INFO_PANEL_STORAGE_NAME}
            useReactWindow={false}
            itemHeight={48}
            filesLength={statRows.length}
            fetchMoreFiles={async () => {}}
            hasMoreFiles={false}
            itemCount={statRows.length}
          >
            {statRows.map((row) => (
              <TableRow key={`${row.label}-${row.isMonthly}`}>
                <TableCell>
                  <div className={styles.nameCellContent}>
                    <Text fontSize="13px" fontWeight={600} truncate>
                      {row.label}
                    </Text>
                    {row.isMonthly && (
                      <Badge
                        label={t("DocsCloud:Monthly")}
                        fontSize="10.5px"
                        fontWeight={600}
                        color="var(--param-description-color, #a3a9ae)"
                        backgroundColor="var(--header-background-color, #f8f9f9)"
                        border="1px solid var(--files-section-table-view-row-border-color, #eceef1)"
                        borderRadius="100px"
                        padding="1px 8px"
                        noHover
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className={styles.statsDataCell}>
                  <Text fontSize="13px">{row.active ?? "—"}</Text>
                </TableCell>
                <TableCell className={styles.statsDataCell}>
                  <Text fontSize="13px">{row.internal ?? "—"}</Text>
                </TableCell>
                <TableCell className={styles.statsDataCell}>
                  <Text fontSize="13px">{row.external ?? "—"}</Text>
                </TableCell>
                <TableCell className={styles.statsDataCell}>
                  <Text fontSize="13px">{row.remaining ?? "—"}</Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      ) : (
        <RowContainer useReactWindow={false}>
          {statRows.map((row) => (
            <Row key={row.label}>
              <StatRowContent row={row} values={formatRowValues(row)} />
            </Row>
          ))}
        </RowContainer>
      )}

      <div className={styles.downloadRow}>
        <Button
          label={t("Common:DownloadReportBtnText")}
          size={ButtonSize.small}
          isLoading={isDownloading}
          onClick={handleDownload}
        />
      </div>
    </>
  );
};

// Outer component — sets up sectionWidth and wraps with Provider so
// useViewEffect inside InformationTabContent can read it from context
export const InformationTab = ({ info }: InformationTabProps) => {
  const [sectionWidth, setSectionWidth] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setSectionWidth(entry.contentRect.width);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef}>
      <Provider value={{ sectionWidth }}>
        <InformationTabContent info={info} />
      </Provider>
    </div>
  );
};

