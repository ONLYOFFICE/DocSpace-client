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

import { getAccessOptions } from "../utils";
import { StyledAccessSelector } from "../StyledInvitePanel";

import { isMobile } from "@docspace/shared/utils";
import { AccessRightSelect } from "@docspace/shared/components/access-right-select";

const AccessSelector = ({
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
}) => {
  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef?.current?.offsetWidth) return;

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

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const checkWidth = () => {
    if (!isMobile()) return;

    if (!isMobile()) {
      setHorizontalOrientation(true);
    } else {
      setHorizontalOrientation(false);
    }
  };

  const isMobileHorizontalOrientation = isMobile() && horizontalOrientation;

  return (
    <StyledAccessSelector className="invite-panel_access-selector">
      {!(isMobile() && !isMobileHorizontalOrientation) && (
        <AccessRightSelect
          className={className}
          selectedOption={selectedOption}
          onSelect={onSelectAccess}
          accessOptions={filteredAccesses ? filteredAccesses : accessOptions}
          noBorder={noBorder}
          directionX="right"
          directionY="bottom"
          fixedDirection={true}
          manualWidth={width + "px"}
          isDefaultMode={false}
          isAside={false}
          setIsOpenItemAccess={setIsOpenItemAccess}
          hideMobileView={isMobileHorizontalOrientation}
        />
      )}

      {isMobile() && !isMobileHorizontalOrientation && (
        <AccessRightSelect
          className={className}
          selectedOption={selectedOption}
          onSelect={onSelectAccess}
          accessOptions={filteredAccesses ? filteredAccesses : accessOptions}
          noBorder={noBorder}
          directionX="right"
          directionY="top"
          fixedDirection={true}
          manualWidth={"fit-content"}
          isDefaultMode={true}
          isAside={isMobileView}
          setIsOpenItemAccess={setIsOpenItemAccess}
          manualY={"0px"}
          withoutBackground={isMobileView}
          withBackground={!isMobileView}
          withBlur={isMobileView}
        />
      )}
    </StyledAccessSelector>
  );
};

export default inject(({ settingsStore }) => {
  const { standalone } = settingsStore;

  return {
    standalone,
  };
})(observer(AccessSelector));
