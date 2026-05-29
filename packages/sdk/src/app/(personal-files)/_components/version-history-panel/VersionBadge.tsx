/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import VersionSvg from "PUBLIC_DIR/images/versionrevision_active.react.svg";

import styles from "./VersionBadge.module.scss";

type VersionBadgeProps = {
  className?: string;
  isVersion: boolean;
  versionGroup: number;
  index: number;
};

const VersionBadge = ({
  className,
  isVersion,
  versionGroup,
  index,
}: VersionBadgeProps) => {
  const { i18n } = useTranslation();
  const isJapanese = i18n.language === "ja-JP";
  const isFirst = index === 0;

  return (
    <div
      className={classNames(styles.versionBadge, className, {
        [styles.isAccent]: !isFirst,
        [styles.isFirst]: isFirst,
      })}
    >
      <VersionSvg
        className={classNames(styles.versionMarkIcon, {
          [styles.isVersion]: isVersion,
          [styles.isFirst]: isFirst,
        })}
      />

      <Text
        className={classNames(styles.versionBadgeText, {
          [styles.reverse]: isJapanese,
        })}
        isBold
        fontSize="12px"
      >
        {isVersion ? (
          <>
            <span>Ver.</span>
            <span>{versionGroup}</span>
          </>
        ) : null}
      </Text>
    </div>
  );
};

export default VersionBadge;
