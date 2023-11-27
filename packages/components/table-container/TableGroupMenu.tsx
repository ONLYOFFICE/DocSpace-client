import React from "react";
import PropTypes from "prop-types";
import Checkbox from "../checkbox";
import {
  StyledTableGroupMenu,
  StyledScrollbar,
  StyledInfoPanelToggleColorThemeWrapper,
} from "./StyledTableContainer";
import ComboBox from "../combobox";
import GroupMenuItem from "./GroupMenuItem";
import { useTranslation } from "react-i18next";
import IconButton from "../icon-button";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/triangle.nav... Remove this comment to see the full error message
import TriangleNavigationDownReactSvgUrl from "PUBLIC_DIR/images/triangle.navigation.down.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/panel.react.... Remove this comment to see the full error message
import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";
import { ThemeType } from "../ColorTheme";

const TableGroupMenu = (props: any) => {
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
  const onCheckboxChange = (e: any) => {
    onChange && onChange(e.target && e.target.checked);
  };
  const { t } = useTranslation("Common");
  return <>
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
        // @ts-expect-error TS(2322): Type '{ id: string; comboIcon: any; noBorder: true... Remove this comment to see the full error message
        id="menu-combobox"
        comboIcon={TriangleNavigationDownReactSvgUrl}
        noBorder
        advancedOptions={checkboxOptions}
        className="table-container_group-menu-combobox not-selectable"
        options={[]}
        selectedOption={{}}
        manualY="42px"
        manualX="-32px"
        title={t("Common:TitleSelectFile")}
        isMobileView={isMobileView}
      />
      <div className="table-container_group-menu-separator" />
      // @ts-expect-error TS(2769): No overload matches this call.
      <StyledScrollbar>
        {headerMenu.map((item: any, index: any) => (
          // @ts-expect-error TS(2322): Type '{ key: any; item: any; isBlocked: any; }' is... Remove this comment to see the full error message
          <GroupMenuItem key={index} item={item} isBlocked={isBlocked} />
        ))}
      </StyledScrollbar>
      {!withoutInfoPanelToggler && (
        // @ts-expect-error TS(2769): No overload matches this call.
        <StyledInfoPanelToggleColorThemeWrapper
          themeId={ThemeType.InfoPanelToggle}
          isInfoPanelVisible={isInfoPanelVisible}
        >
          <div className="info-panel-toggle-bg">
            <IconButton
              // @ts-expect-error TS(2322): Type '{ id: string; className: string; iconName: a... Remove this comment to see the full error message
              id="info-panel-toggle--open"
              className="info-panel-toggle"
              iconName={PanelReactSvgUrl}
              size="16"
              isFill={true}
              onClick={toggleInfoPanel}
            />
          </div>
        </StyledInfoPanelToggleColorThemeWrapper>
      )}
    </StyledTableGroupMenu>
  </>;
};
TableGroupMenu.propTypes = {
  isChecked: PropTypes.bool,
  isIndeterminate: PropTypes.bool,
  headerMenu: PropTypes.arrayOf(PropTypes.object).isRequired,
  checkboxOptions: PropTypes.any.isRequired,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  checkboxMargin: PropTypes.string,
  withoutInfoPanelToggler: PropTypes.bool,
};
export default TableGroupMenu;
