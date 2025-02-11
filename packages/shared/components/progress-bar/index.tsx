// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";

import { Text } from "../text";

import styles from "./ProgressBar.module.scss";

import { ProgressBarProps } from "./ProgressBar.types";

const ProgressBar = ({
  percent,
  label,
  isInfiniteProgress,
  className,
  status,
  error,
  style,
  ...rest
}: ProgressBarProps) => {
  const progressPercent = percent > 100 ? 100 : percent;

  return (
    <div className={styles.container} style={style}>
      <Text
        className={styles.fullText}
        fontSize="12px"
        fontWeight="400"
        lineHeight="16px"
        title={label}
      >
        {label}
      </Text>
      <div
        {...rest}
        className={`${styles.progressBar} ${className || ""}`}
        data-testid="progress-bar"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        data-status={status || undefined}
        data-error={error || undefined}
        data-progress={progressPercent}
      >
        {isInfiniteProgress ? (
          <div
            className={styles.animation}
            data-testid="progress-bar-animation"
          />
        ) : (
          <div
            className={styles.percent}
            data-testid="progress-bar-percent"
            style={{ width: `${progressPercent}%` }}
          />
        )}
      </div>
      {status || error ? (
        <Text
          className={error ? styles.statusError : styles.statusText}
          fontSize="12px"
          fontWeight="400"
          lineHeight="16px"
          as="p"
          title={error || status}
        >
          {error || status}
        </Text>
      ) : null}
    </div>
  );
};

export { ProgressBar };
