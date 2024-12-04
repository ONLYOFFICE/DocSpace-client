// (c) Copyright Ascensio System SIA 2009-2024
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

import { BaseLoaderProps } from "../Loader.types";

import styles from "./Base.module.scss";

export const Base = React.forwardRef<HTMLDivElement, BaseLoaderProps>(
  (
    {
      label = "Loading content, please wait",
      size = "18px",
      color,
      primary,
      isDisabled,
      ...rest
    },
    ref,
  ) => {
    const dotSize = React.useMemo(() => {
      const numericSize = parseInt(size, 10);
      return Number.isNaN(numericSize)
        ? 4
        : Math.max(4, Math.floor(numericSize / 4));
    }, [size]);

    const mergedStyle = React.useMemo(
      () => ({
        ...(color && { color }),
      }),
      [color],
    );

    const dots = ["0s", "0.2s", "0.4s"];

    return (
      <div
        ref={ref}
        className={[styles.wrapper].filter(Boolean).join(" ")}
        style={mergedStyle}
        data-primary={primary ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        role="status"
        aria-label={label}
        aria-busy="true"
        {...rest}
      >
        <span className={styles.label}>{label}</span>
        <div className={styles.dotWrapper}>
          {dots.map((delay) => (
            <span
              key={delay}
              className={styles.dot}
              data-delay={delay}
              style={{
                width: `${dotSize}px`,
                height: `${dotSize}px`,
              }}
            />
          ))}
        </div>
      </div>
    );
  },
);

Base.displayName = "Base";
