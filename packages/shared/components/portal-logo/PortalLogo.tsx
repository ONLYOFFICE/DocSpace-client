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

"use client";

import React, { useState } from "react";
import { isMobileOnly } from "react-device-detect";
import lightSmall from "PUBLIC_DIR/images/logo/lightsmall.svg?url";

import { classNames, getLogoUrl, size as deviceSize } from "../../utils";
import { WhiteLabelLogoType } from "../../enums";
import { useTheme } from "../../hooks/useTheme";
import type { PortalLogoProps } from "./PortalLogo.types";
import styles from "./PortalLogo.module.scss";

const PortalLogo = ({ className, isResizable = false }: PortalLogoProps) => {
  const [isError, setIsError] = useState(false);

  const { isBase } = useTheme();

  const [size, setSize] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  const onResize = () => {
    setSize(window.innerWidth);
  };

  React.useEffect(() => {
    if (isResizable) window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isResizable]);

  const isMobile = size <= deviceSize.mobile;

  const logoSize =
    isResizable && isMobile
      ? WhiteLabelLogoType.LightSmall
      : WhiteLabelLogoType.LoginPage;

  const logo = getLogoUrl(logoSize, !isBase);

  const wrapperClassName = classNames(styles.wrapper, {
    [styles.mobile]: isMobile,
    [styles.resizable]: isResizable,
    "not-mobile": !isMobileOnly,
  });

  if (isError) {
    return (
      <img
        className={classNames("logo-wrapper", className)}
        alt="portal logo"
        src={lightSmall}
      />
    );
  }

  return (
    <div className={wrapperClassName}>
      {logo ? (
        <img
          src={logo}
          className={classNames("logo-wrapper", className)}
          alt="portal logo"
          onError={() => setIsError(true)}
        />
      ) : null}
    </div>
  );
};

export default PortalLogo;
