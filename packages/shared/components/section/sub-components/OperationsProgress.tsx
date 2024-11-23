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
import { useState } from "react";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/refresh.react.svg?url";
import UploadSvgUrl from "PUBLIC_DIR/images/icons/16/upload.react.svg?url";
import DuplicateIconUrl from "PUBLIC_DIR/images/button.duplicate.react.svg?url";

import { StyledDropDown } from "../Section.styled";
import { FloatingButton } from "../../floating-button";
import { ProgressPanel } from "../../progress-panel/ProgressPanel";

const OperationsProgress = ({
  primaryActiveOperations,
  secondaryActiveOperations,
  isFinishedActiveOperations,
  onClick,
}) => {
  const [isOpenPanel, setIsOpenPanel] = useState<boolean>(false);

  const onClickAction = () => {
    onClick?.();
    setIsOpenPanel(false);
  };
  console.log(
    "secondaryActiveOperations",
    secondaryActiveOperations,
    "primaryActiveOperations",
    primaryActiveOperations,
    "isFinishedActiveOperations",
    isFinishedActiveOperations,
  );

  if (!primaryActiveOperations && !secondaryActiveOperations) return <></>;
  if (!primaryActiveOperations.length && !secondaryActiveOperations.length)
    return <></>;

  const onOpenProgressPanel = () => {
    setIsOpenPanel(!isOpenPanel);
  };

  const getIcon = (icon) => {
    switch (icon) {
      case "upload":
        return UploadSvgUrl;
      case "convert":
        return RefreshReactSvgUrl;
      case "copy":
      case "duplicate":
        return DuplicateIconUrl;
      default:
        return UploadSvgUrl;
    }
  };

  const isSeveralOperations =
    (primaryActiveOperations.length | secondaryActiveOperations.length) > 1;

  const progressList = () => {
    return (
      <div className="progress-container">
        {secondaryActiveOperations.map((item) => {
          return (
            <div className="progress-list">
              <ProgressPanel
                label={item.label}
                percent={item.items[0].percent}
                open
                iconUrl={getIcon(item.operation)}
                withoutProgress
                //status="Done"
              />
            </div>
          );
        })}
        {primaryActiveOperations.map((item) => (
          <div className="progress-list">
            <ProgressPanel
              label={item.label}
              percent={item.percent}
              open
              iconUrl={getIcon(item.icon)}
              onClickAction={onClickAction}
            />
          </div>
        ))}
      </div>
    );
  };

  if (true) {
    return (
      <div className="progress-bar_container">
        <FloatingButton
          className="layout-progress-bar"
          icon={isOpenPanel ? "arrow" : "dots"}
          //alert={showPrimaryButtonAlert}
          onClick={onOpenProgressPanel}
          // clearUploadedFilesHistory={clearUploadedFilesHistory}
          percent={isFinishedActiveOperations ? 100 : 0}
        />

        <StyledDropDown
          open={isOpenPanel}
          withBackdrop
          manualWidth="344px"
          directionY="top"
          directionX="right"
          fixedDirection
          isDefaultMode={false}
          className="progress-dropdown"
        >
          {progressList()}
        </StyledDropDown>
      </div>
    );
  }
  const activeOperations =
    primaryActiveOperations[0] ?? secondaryActiveOperations[0];

  return (
    <div className="progress-bar_container">
      <FloatingButton
        className="layout-progress-bar"
        icon={activeOperations.icon}
        alert={activeOperations.alert}
        onClick={onOpenProgressPanel}
        percent={activeOperations.percent}
        // clearUploadedFilesHistory={clearUploadedFilesHistory}
      />
    </div>
  );
};

export default OperationsProgress;
