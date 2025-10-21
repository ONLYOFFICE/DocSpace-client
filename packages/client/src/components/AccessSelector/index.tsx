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

import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import { isMobile } from "@docspace/shared/utils";
import { AccessRightSelect } from "@docspace/shared/components/access-right-select";
import { TOption } from "@docspace/shared/components/combobox";
import { TTranslation } from "@docspace/shared/types";
import { RoomsType } from "@docspace/shared/enums";
import {
  getAccessOptions,
  AccessOptionType,
} from "@docspace/shared/utils/getAccessOptions";

import StyledAccessSelector from "./AccessSelector.styled";

interface AccessSelectorProps {
  t: TTranslation;
  roomType: RoomsType | -1;
  onSelectAccess: (access: TOption) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  defaultAccess: number;
  isOwner: boolean;
  isAdmin: boolean;
  withRemove?: boolean;
  filteredAccesses?: any[];
  setIsOpenItemAccess?: React.Dispatch<React.SetStateAction<boolean>>;
  className: string;
  standalone?: boolean;
  isMobileView: boolean;
  noBorder?: boolean;
  manualWidth?: number;
  isDisabled?: boolean;
  directionX?: string;
  directionY?: string;
  isSelectionDisabled?: boolean;
  selectionErrorText?: React.ReactNode;
  availableAccess?: number[];
  scaledOptions?: boolean;
  dataTestId?: string;
}

const AccessSelector: React.FC<AccessSelectorProps> = ({
  t,
  roomType,
  onSelectAccess,
  containerRef,
  defaultAccess,
  isOwner,
  isAdmin,
  withRemove = false,
  filteredAccesses,
  setIsOpenItemAccess,
  className,
  standalone,
  isMobileView,
  noBorder = false,
  manualWidth,
  isDisabled,
  directionX = "left",
  directionY = "bottom",
  isSelectionDisabled,
  selectionErrorText,
  availableAccess,
  scaledOptions,
  dataTestId,
}) => {
  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [width, setWidth] = useState(manualWidth || 0);

  useEffect(() => {
    const offsetWidth = containerRef?.current?.offsetWidth;

    if (typeof offsetWidth !== "number") {
      return;
    }

    setWidth(offsetWidth - 32);
  }, [containerRef, containerRef?.current?.offsetWidth]);

  const accessOptions = getAccessOptions(
    t,
    roomType as RoomsType,
    withRemove,
    true,
    isOwner,
    isAdmin,
    standalone,
  );

  const selectedOption = accessOptions.filter(
    (access) => "access" in access && access?.access === +defaultAccess,
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
      {!(isMobile() && !isMobileHorizontalOrientation) ? (
        <AccessRightSelect
          className={className}
          selectedOption={selectedOption as unknown as TOption}
          onSelect={onSelectAccess}
          accessOptions={
            (filteredAccesses || accessOptions) as unknown as TOption[]
          }
          noBorder={noBorder}
          directionX={directionX as "right" | "left"}
          directionY={directionY as "bottom" | "top" | "both" | undefined}
          fixedDirection
          manualWidth={`${width}px`}
          isDefaultMode={false}
          isAside={false}
          setIsOpenItemAccess={setIsOpenItemAccess}
          isDisabled={isDisabled}
          isSelectionDisabled={isSelectionDisabled}
          selectionErrorText={selectionErrorText}
          availableAccess={availableAccess}
          scaledOptions={scaledOptions}
          dataTestId={dataTestId}
          showDisabledItems={true}
        />
      ) : null}

      {isMobile() && !isMobileHorizontalOrientation ? (
        <AccessRightSelect
          className={className}
          selectedOption={selectedOption as unknown as TOption}
          onSelect={onSelectAccess}
          accessOptions={
            (filteredAccesses || accessOptions) as unknown as TOption[]
          }
          noBorder={noBorder}
          directionX="right"
          directionY="top"
          fixedDirection
          manualWidth="auto"
          isDefaultMode
          isAside={isMobileView}
          setIsOpenItemAccess={setIsOpenItemAccess}
          manualY="0px"
          withBackground={isMobileView}
          withBlur={isMobileView}
          isDisabled={isDisabled}
          isSelectionDisabled={isSelectionDisabled}
          selectionErrorText={selectionErrorText}
          availableAccess={availableAccess}
          scaledOptions={scaledOptions}
          dataTestId={dataTestId}
          showDisabledItems={true}
        />
      ) : null}
    </StyledAccessSelector>
  );
};

export default inject<TStore>(({ settingsStore }) => {
  const { standalone } = settingsStore;

  return {
    standalone,
  };
})(observer(AccessSelector));
