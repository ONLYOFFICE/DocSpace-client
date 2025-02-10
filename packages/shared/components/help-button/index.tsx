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
import uniqueId from "lodash/uniqueId";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";
import { classNames } from "../../utils";
import { IconButton } from "../icon-button";
import { Tooltip } from "../tooltip";
import { HelpButtonProps } from "./HelpButton.types";

const HelpButton = (props: HelpButtonProps) => {
  const {
    id,
    className = "icon-button",
    iconName,
    size = 12,
    color,
    dataTip,
    getContent,
    place,
    offset,
    style,
    afterShow,
    afterHide,
    tooltipMaxWidth,
    tooltipContent,
    openOnClick = true,
    isClickable = true,
  } = props;

  const currentId = id || uniqueId();
  const ref = React.useRef(null);
  const anchorSelect = `div[id='${currentId}'] svg`;

  return (
    <div ref={ref} style={style} data-testid="help-button">
      <IconButton
        id={currentId}
        className={classNames(className, "help-icon")}
        isClickable={isClickable}
        iconName={iconName ?? InfoReactSvgUrl}
        size={size}
        color={color}
        data-for={currentId}
        dataTip={dataTip}
      />

      {getContent ? (
        <Tooltip
          clickable
          openOnClick={openOnClick}
          place={place || "top"}
          offset={offset}
          afterShow={afterShow}
          afterHide={afterHide}
          maxWidth={tooltipMaxWidth}
          getContent={getContent}
          anchorSelect={anchorSelect}
        />
      ) : (
        <Tooltip
          clickable
          openOnClick={openOnClick}
          place={place}
          offset={offset}
          afterShow={afterShow}
          afterHide={afterHide}
          maxWidth={tooltipMaxWidth}
          anchorSelect={anchorSelect}
        >
          {tooltipContent}
        </Tooltip>
      )}
    </div>
  );
};

export { HelpButton };
