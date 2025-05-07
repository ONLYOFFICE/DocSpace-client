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

import { useEffect, useState } from "react";

import { isDesktop } from "../../utils";

import { RowsSkeleton } from "../rows";
import { RectangleSkeleton } from "../rectangle";

import styles from "./Profile.module.scss";
import { ProfileFooterLoaderProps } from "./Profile.types";

export const ProfileFooterLoader = ({
  id,
  className,
  style,
  ...rest
}: ProfileFooterLoaderProps) => {
  const {
    title,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  const [isDesktopView, setIsDesktopView] = useState(false);

  const checkWidth = () => {
    setIsDesktopView(isDesktop());
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <div id={id} className={className} style={style}>
      <div className={styles.footerBlock} data-testid="profile-footer">
        <div className="header">
          <RectangleSkeleton
            title={title}
            width="129"
            height="22"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />

          <RectangleSkeleton
            title={title}
            width="213"
            height="20"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
        </div>

        {isDesktopView ? (
          <div className="table-header">
            <RectangleSkeleton
              title={title}
              width="51"
              height="16"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />

            <RectangleSkeleton
              title={title}
              width="60"
              height="16"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />

            <RectangleSkeleton
              title={title}
              width="62"
              height="16"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        ) : null}

        <RowsSkeleton count={3} />
      </div>
    </div>
  );
};
