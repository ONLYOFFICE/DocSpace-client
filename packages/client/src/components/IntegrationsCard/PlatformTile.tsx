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

import { Text } from "@docspace/ui-kit/components/text";

import ArrowIcon from "PUBLIC_DIR/images/arrow2.react.svg";
import PluginIcon from "PUBLIC_DIR/images/icons/20/catalog.devtools-plugin-sdk.react.svg";

import styles from "./IntegrationsCard.module.scss";

export type PlatformTileProps = {
  name: string;
  iconUrl?: string;
  iconAlt?: string;
  hideIcon?: boolean;
  muted?: boolean;
  isBold?: boolean;
  linkLabel?: string;
  href?: string;
  onClick?: () => void;
  testId?: string;
};

export const PlatformTileGrid = ({
  children,
  columns,
  testId,
}: {
  children: React.ReactNode;
  columns?: 2;
  testId?: string;
}) => (
  <div
    className={styles.integrationsGrid}
    data-columns={columns}
    data-testid={testId}
  >
    {children}
  </div>
);

export const PlatformTile = ({
  name,
  iconUrl,
  iconAlt,
  hideIcon = false,
  muted = false,
  isBold = false,
  linkLabel,
  href,
  onClick,
  testId,
}: PlatformTileProps) => {
  const content = (
    <>
      {hideIcon ? null : (
        <span
          className={styles.integrationIcon}
          data-fallback={iconUrl ? undefined : "true"}
        >
          {iconUrl ? (
            <img src={iconUrl} alt={iconAlt ?? ""} />
          ) : (
            <PluginIcon aria-hidden="true" />
          )}
        </span>
      )}
      <Text
        as="span"
        className={styles.integrationName}
        isBold={isBold}
        truncate
        title={name}
      >
        {name}
      </Text>
      {linkLabel ? (
        <span className={styles.integrationLink}>
          {linkLabel}
          <ArrowIcon aria-hidden="true" className={styles.integrationArrow} />
        </span>
      ) : (
        <ArrowIcon aria-hidden="true" className={styles.integrationArrow} />
      )}
    </>
  );

  const tileProps = {
    className: styles.integrationTile,
    "data-variant": muted ? "muted" : undefined,
    "data-testid": testId,
  };

  if (href)
    return (
      <a {...tileProps} href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );

  return (
    <button {...tileProps} type="button" onClick={onClick}>
      {content}
    </button>
  );
};

export default PlatformTile;
