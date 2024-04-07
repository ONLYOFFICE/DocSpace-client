import React, { useEffect, useState } from "react";

import { ComboBoxSize, TOption } from "../../combobox";
import { AccessSelectorProps, TAccessRight } from "../Selector.types";
import { isMobile } from "../../../utils";
import { StyledAccessSelector, StyledComboBox } from "../Selector.styled";
import { SelectorAccessRightsMode } from "../Selector.enums";

const SELECTOR_PADDINGS = 32;

const AccessSelector = (props: AccessSelectorProps) => {
  const {
    onAccessRightsChange,
    accessRights,
    selectedAccessRight,
    footerRef,
    accessRightsMode = SelectorAccessRightsMode.Compact,
  } = props;

  const [width, setWidth] = useState(0);

  const isMobileView = isMobile();

  const onSelect = (opt?: TOption) =>
    onAccessRightsChange?.({ ...opt } as TAccessRight);

  useEffect(() => {
    const footerWidth = footerRef?.current?.offsetWidth;
    if (!footerWidth) return;

    setWidth(footerWidth - SELECTOR_PADDINGS);
  }, [footerRef]);

  return accessRightsMode === SelectorAccessRightsMode.Compact ? (
    <StyledComboBox
      onSelect={onSelect}
      options={accessRights as TOption[]}
      size={ComboBoxSize.content}
      scaled={false}
      manualWidth="fit-content"
      selectedOption={selectedAccessRight as TOption}
      showDisabledItems
      directionX="right"
      directionY="top"
      forceCloseClickOutside
    />
  ) : (
    <StyledAccessSelector
      className=""
      selectedOption={selectedAccessRight as TOption}
      onSelect={onSelect}
      accessOptions={accessRights as TOption[]}
      size={ComboBoxSize.content}
      scaled={false}
      directionX="right"
      directionY="top"
      fixedDirection={isMobileView}
      manualWidth={isMobileView ? "fit-content" : `${width}px`}
      isAside={isMobileView}
      manualY={isMobileView ? "0px" : undefined}
      withoutBackground={isMobileView}
      withBackground={!isMobileView}
      withBlur={isMobileView}
    />
  );
};

export default AccessSelector;
