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

import React, { useState, useEffect } from "react";
import { ColorTheme, ThemeId } from "../color-theme";
import StyledLoadingButton from "../color-theme/sub-components/StyledLoadingButton";
import StyledCircle from "../color-theme/sub-components/StyledCircle";
import type { LoadingButtonProps } from "./LoadingButton.types";

const LoadingButton: React.FC<LoadingButtonProps> = ({
  id,
  className,
  style,
  percent = 0,
  onClick,
  isConversion = false,
  inConversion = false,
  color,
}) => {
  const progress = percent || null;

  const [isAnimation, setIsAnimation] = useState<boolean>(true);

  const stopAnimation = (): void => {
    setIsAnimation(false);
  };

  useEffect(() => {
    const timer = setTimeout(stopAnimation, 5000);

    return function cleanup() {
      clearTimeout(timer);
    };
  }, [isAnimation]);

  return (
    <ColorTheme
      id={id}
      className={className}
      style={style}
      onClick={onClick}
      themeId={ThemeId.LoadingButton}
      color={color}
    >
      <StyledCircle
        percent={progress}
        inConversion={inConversion}
        isAnimation={isAnimation}
      >
        <div className="circle__mask circle__full">
          <div className="circle__fill" />
        </div>
        <div className="circle__mask">
          <div className="circle__fill" />
        </div>

        <StyledLoadingButton
          className="loading-button"
          isConversion={isConversion}
        >
          {!inConversion ? <>&times;</> : null}
        </StyledLoadingButton>
      </StyledCircle>
    </ColorTheme>
  );
};

export { LoadingButton };
