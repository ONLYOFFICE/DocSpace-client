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

import React, { useCallback, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { injectDefaultTheme } from "@docspace/shared/utils";
import { zIndex } from "@docspace/shared/themes";

const StyledTooltip = styled.div.attrs(injectDefaultTheme)`
  position: fixed;
  display: none;
  padding: 8px;
  z-index: ${zIndex.overlay};
  background: ${(props) => props.theme.filesDragTooltip.background};
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  box-shadow: ${(props) => props.theme.filesDragTooltip.boxShadow};
  -moz-box-shadow: ${(props) => props.theme.filesDragTooltip.boxShadow};
  -webkit-box-shadow: ${(props) => props.theme.filesDragTooltip.boxShadow};

  .tooltip-moved-obj-wrapper {
    display: flex;
    align-items: center;
  }
  .tooltip-moved-obj-icon {
    margin-inline-end: 6px;
  }
  .tooltip-moved-obj-extension {
    color: ${(props) => props.theme.filesDragTooltip.color};
  }
`;

const DragTooltip = (props) => {
  const tooltipRef = useRef(null);
  const {
    t,
    tooltipOptions,
    iconOfDraggedFile,
    isSingleItem,
    title,
    tooltipPageX,
    tooltipPageY,
  } = props;
  const { filesCount, operationName } = tooltipOptions;

  const { interfaceDirection } = useTheme();
  const isRtl = interfaceDirection === "rtl";

  const setTooltipPosition = useCallback(() => {
    const tooltip = tooltipRef.current;
    if (tooltip) {
      tooltip.style.display = "block";

      const margin = 8;
      tooltip.style.left = `${
        isRtl ? tooltipPageX - tooltip.offsetWidth : tooltipPageX + margin
      }px`;
      tooltip.style.top = `${tooltipPageY + margin}px`;
    }
  }, [tooltipPageX, tooltipPageY, isRtl]);

  useEffect(() => {
    setTooltipPosition();
  }, [setTooltipPosition, tooltipPageX, tooltipPageY]);

  const renderFileMoveTooltip = useCallback(() => {
    const reg = /^([^\\]*)\.(\w+)/;
    const matches = title.match(reg);

    let nameOfMovedObj;
    let fileExtension;
    if (matches) {
      nameOfMovedObj = matches[1];
      fileExtension = matches.pop();
    } else {
      nameOfMovedObj = title;
    }

    return (
      <div className="tooltip-moved-obj-wrapper">
        {iconOfDraggedFile ? (
          <img
            className="tooltip-moved-obj-icon"
            src={`${iconOfDraggedFile}`}
            alt=""
          />
        ) : null}
        {nameOfMovedObj}
        {fileExtension ? (
          <span className="tooltip-moved-obj-extension">.{fileExtension}</span>
        ) : null}
      </div>
    );
  }, [title, iconOfDraggedFile]);

  const tooltipLabel = tooltipOptions
    ? operationName === "copy"
      ? isSingleItem
        ? t("TooltipElementCopyMessage", { element: filesCount })
        : t("TooltipElementsCopyMessage", { element: filesCount })
      : isSingleItem
        ? renderFileMoveTooltip()
        : t("TooltipElementsMoveMessage", { element: filesCount })
    : t("");

  return <StyledTooltip ref={tooltipRef}>{tooltipLabel}</StyledTooltip>;
};

export default inject(({ filesStore }) => {
  const {
    selection,
    iconOfDraggedFile,
    tooltipOptions,
    tooltipPageX,
    tooltipPageY,
    bufferSelection,
  } = filesStore;

  const isSingleItem = selection.length === 1 || bufferSelection;
  const item = bufferSelection || selection[0];

  return {
    title: item?.title,
    isSingleItem,
    tooltipOptions,
    iconOfDraggedFile,

    tooltipPageX,
    tooltipPageY,
  };
})(withTranslation("Files")(observer(DragTooltip)));
