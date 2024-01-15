import React from "react";
import { useTranslation } from "react-i18next";

import TriangleNavigationDownReactSvgUrl from "PUBLIC_DIR/images/triangle.navigation.down.react.svg?url";
import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";

import { Checkbox } from "../checkbox";
import { ComboBox, TOption } from "../combobox";
import { IconButton } from "../icon-button";
import { ThemeId } from "../color-theme";

import {
  StyledTableGroupMenu,
  StyledScrollbar,
  StyledInfoPanelToggleColorThemeWrapper,
} from "./Table.styled";

import { TableGroupMenuProps } from "./Table.types";

import { GroupMenuItem } from "./sub-components/GroupMenuItem";

const TableGroupMenu = (props: TableGroupMenuProps) => {
  const {
    isChecked,
    isIndeterminate,
    headerMenu,
    onChange,
    checkboxOptions,
    checkboxMargin,
    isInfoPanelVisible,
    toggleInfoPanel,
    withoutInfoPanelToggler,
    isMobileView,
    isBlocked,
    ...rest
  } = props;
  const onCheckboxChange = () => {
    onChange?.(isChecked);
  };
  const { t } = useTranslation("Common");
  return (
    <StyledTableGroupMenu
      className="table-container_group-menu"
      checkboxMargin={checkboxMargin}
      {...rest}
    >
      <Checkbox
        id="menu-checkbox_selected-all-file"
        className="table-container_group-menu-checkbox"
        onChange={onCheckboxChange}
        isChecked={isChecked}
        isIndeterminate={isIndeterminate}
        title={t("Common:MainHeaderSelectAll")}
      />
      <ComboBox
        id="menu-combobox"
        comboIcon={TriangleNavigationDownReactSvgUrl}
        noBorder
        advancedOptions={checkboxOptions}
        className="table-container_group-menu-combobox not-selectable"
        options={[]}
        selectedOption={{} as TOption}
        manualY="42px"
        manualX="-32px"
        title={t("Common:TitleSelectFile")}
        isMobileView={isMobileView}
        onSelect={() => {}}
      />
      <div className="table-container_group-menu-separator" />
      <StyledScrollbar>
        {headerMenu.map((item) => (
          <GroupMenuItem
            key={item.id || item.label}
            item={item}
            isBlocked={isBlocked}
          />
        ))}
      </StyledScrollbar>
      {!withoutInfoPanelToggler && (
        <StyledInfoPanelToggleColorThemeWrapper
          themeId={ThemeId.InfoPanelToggle}
          isInfoPanelVisible={isInfoPanelVisible}
        >
          <div className="info-panel-toggle-bg">
            <IconButton
              id="info-panel-toggle--open"
              className="info-panel-toggle"
              iconName={PanelReactSvgUrl}
              size={16}
              isFill
              onClick={toggleInfoPanel}
            />
          </div>
        </StyledInfoPanelToggleColorThemeWrapper>
      )}
    </StyledTableGroupMenu>
  );
};

export { TableGroupMenu };
