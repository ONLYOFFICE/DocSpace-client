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
import { inject, observer } from "mobx-react";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import StyledLoadingButton from "@docspace/shared/components/color-theme/sub-components/StyledLoadingButton";
import StyledCircle from "@docspace/shared/components/color-theme/sub-components/StyledCircle";

const LoadingButton = (props) => {
  const { id, className, style, percent, onClick, isConversion, inConversion } =
    props;
  const [isAnimation, setIsAnimation] = useState(true);

  const stopAnimation = () => {
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
      {...props}
      id={id}
      className={className}
      style={style}
      onClick={onClick}
      themeId={ThemeId.LoadingButton}
    >
      <StyledCircle
        percent={percent}
        inConversion={inConversion}
        isAnimation={isAnimation}
      >
        <div className="circle__mask circle__full">
          <div className="circle__fill"></div>
        </div>
        <div className="circle__mask">
          <div className="circle__fill"></div>
        </div>

        <StyledLoadingButton
          className="loading-button"
          isConversion={isConversion}
        >
          {!inConversion && <>&times;</>}
        </StyledLoadingButton>
      </StyledCircle>
    </ColorTheme>
  );
};

export default inject(({ uploadDataStore }, { item }) => {
  const { primaryProgressDataStore, isParallel } = uploadDataStore;
  const { loadingFile: file } = primaryProgressDataStore;

  const loadingFile = !file || !file.uniqueId ? null : file;

  const currentFileUploadProgress =
    file && loadingFile?.uniqueId === item?.uniqueId
      ? loadingFile.percent
      : null;

  return {
    percent: isParallel
      ? item?.percent
        ? item.percent
        : null
      : currentFileUploadProgress,
  };
})(observer(LoadingButton));
