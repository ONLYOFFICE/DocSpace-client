import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import { getAccessOptions } from "../utils";
import { StyledAccessSelector } from "../StyledInvitePanel";

import { isMobile } from "@docspace/components/utils/device";
import AccessRightSelect from "@docspace/components/access-right-select";

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
    standalone
  );

  const selectedOption = accessOptions.filter(
    (access) => access.access === +defaultAccess
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

export default inject(({ auth }) => {
  const { standalone } = auth.settingsStore;

  return {
    standalone,
  };
})(observer(AccessSelector));
