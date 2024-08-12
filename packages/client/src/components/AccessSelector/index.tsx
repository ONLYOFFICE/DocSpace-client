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

import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import { isMobile } from "@docspace/shared/utils";
import { AccessRightSelect } from "@docspace/shared/components/access-right-select";
import { TTranslation } from "@docspace/shared/types";
import { RoomsType } from "@docspace/shared/enums";
import { getAccessOptions } from "../panels/InvitePanel/utils";
import StyledAccessSelector from "./AccessSelector.styled";

interface AccessSelectorProps {
  t: TTranslation;
  roomType: RoomsType;
  onSelectAccess: (access: any) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  defaultAccess: number;
  isOwner: boolean;
  withRemove?: boolean;
  filteredAccesses: any[];
  setIsOpenItemAccess: (isOpen: boolean) => void;
  className: string;
  standalone: boolean;
  isMobileView: boolean;
  noBorder?: boolean;
  manualWidth?: number;
  isDisabled?: boolean;
  directionX?: string;
  directionY?: string;
  isSelectionDisabled?: boolean;
  selectionErrorText: React.ReactNode;
  availableAccess?: number;
}

const AccessSelector: React.FC<AccessSelectorProps> = ({
  t,
  roomType,
  onSelectAccess,
  containerRef,
  defaultAccess,
  isOwner,
  withRemove = false,
  filteredAccesses,
  setIsOpenItemAccess,
  className,
  standalone,
  isMobileView,
  noBorder = false,
  manualWidth,
  isDisabled,
  directionX = "right",
  directionY = "bottom",
  isSelectionDisabled,
  selectionErrorText,
  availableAccess,
}) => {
  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [width, setWidth] = useState(manualWidth || 0);

  useEffect(() => {
    if (!containerRef?.current?.offsetWidth) {
      return;
    }

    setWidth(containerRef?.current?.offsetWidth - 32);
  }, [containerRef?.current?.offsetWidth]);

  const accessOptions = getAccessOptions(
    t,
    roomType,
    withRemove,
    true,
    isOwner,
    standalone,
  );

  const selectedOption = accessOptions.filter(
    (access) => access.access === +defaultAccess,
  )[0];

  const checkWidth = () => {
    if (!isMobile()) return;

    if (!isMobile()) {
      setHorizontalOrientation(true);
    } else {
      setHorizontalOrientation(false);
    }
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const isMobileHorizontalOrientation = isMobile() && horizontalOrientation;

  return (
    <StyledAccessSelector className="access-selector">
      {!(isMobile() && !isMobileHorizontalOrientation) && (
        <AccessRightSelect
          className={className}
          selectedOption={selectedOption}
          onSelect={onSelectAccess}
          accessOptions={filteredAccesses || accessOptions}
          noBorder={noBorder}
          directionX={directionX}
          directionY={directionY}
          fixedDirection
          manualWidth={`${width}px`}
          isDefaultMode={false}
          isAside={false}
          setIsOpenItemAccess={setIsOpenItemAccess}
          hideMobileView={isMobileHorizontalOrientation}
          isDisabled={isDisabled}
          isSelectionDisabled={isSelectionDisabled}
          selectionErrorText={selectionErrorText}
          availableAccess={availableAccess}
        />
      )}

      {isMobile() && !isMobileHorizontalOrientation && (
        <AccessRightSelect
          className={className}
          selectedOption={selectedOption}
          onSelect={onSelectAccess}
          accessOptions={filteredAccesses || accessOptions}
          noBorder={noBorder}
          directionX="right"
          directionY="top"
          fixedDirection
          manualWidth="fit-content"
          isDefaultMode
          isAside={isMobileView}
          setIsOpenItemAccess={setIsOpenItemAccess}
          manualY="0px"
          withoutBackground={isMobileView}
          withBackground={!isMobileView}
          withBlur={isMobileView}
          isDisabled={isDisabled}
          isSelectionDisabled={isSelectionDisabled}
          selectionErrorText={selectionErrorText}
          availableAccess={availableAccess}
        />
      )}
    </StyledAccessSelector>
  );
};

export default inject<TStore>(({ settingsStore }) => {
  const { standalone } = settingsStore;

  return {
    standalone,
  };
})(observer(AccessSelector));
