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

import { useTranslation } from "react-i18next";
import classNames from "classnames";

import TriangleNavigationDownReactSvgUrl from "PUBLIC_DIR/images/triangle.navigation.down.react.svg?url";
import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";
import CrossIconSvgUrl from "PUBLIC_DIR/images/icons/16/cross.react.svg?url";

import { Text } from "../../text";
import { Checkbox } from "../../checkbox";
import { ComboBox, TOption } from "../../combobox";
import { IconButton } from "../../icon-button";
import { Scrollbar } from "../../scrollbar";

import { GroupMenuItem } from "../sub-components/group-menu-item";

import { TableGroupMenuProps } from "../Table.types";
import styles from "./TableGroupMenu.module.scss";

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
    withComboBox = true,
    headerLabel,
    isCloseable,
    onCloseClick,
    onClick,
  } = props;

  const onCheckboxChange = () => {
    onChange?.(!isChecked);
  };
  const { t } = useTranslation("Common");

  const toggleIconColor = isInfoPanelVisible ? "accent" : undefined;

  return (
    <div
      className={classNames(
        styles.tableGroupMenu,
        "table-container_group-menu",
      )}
      style={
        {
          "--table-group-menu-checkbox-margin": checkboxMargin,
        } as React.CSSProperties
      }
      onClick={onClick}
      data-testid="table-group-menu"
    >
      {headerLabel ? (
        <Text
          fontSize="14px"
          lineHeight="16px"
          fontWeight={600}
          className={styles.labelElement}
        >
          {headerLabel}
        </Text>
      ) : (
        <Checkbox
          id="menu-checkbox_selected-all-file"
          dataTestId="table_group_menu_checkbox"
          className={classNames(
            styles.checkbox,
            "table-container_group-menu-checkbox",
          )}
          onChange={onCheckboxChange}
          isChecked={isChecked}
          isIndeterminate={isIndeterminate}
          title={t("Common:MainHeaderSelectAll")}
        />
      )}

      {withComboBox ? (
        <ComboBox
          id="menu-combobox"
          comboIcon={TriangleNavigationDownReactSvgUrl}
          noBorder
          advancedOptions={checkboxOptions}
          className={classNames(styles.combobox, "not-selectable")}
          options={[]}
          selectedOption={{} as TOption}
          manualY="42px"
          manualX="-32px"
          title={t("Common:TitleSelectFile")}
          isMobileView={isMobileView}
          onSelect={() => {}}
          dataTestId="table_group_menu_combobox"
          withBackground={isMobileView}
        />
      ) : null}
      <div
        className={classNames(
          styles.separator,
          "table-container_group-menu-separator",
        )}
      />
      <Scrollbar className={styles.scrollBar}>
        {headerMenu.map((item) => (
          <GroupMenuItem
            key={item.id || item.label}
            item={item}
            isBlocked={isBlocked}
            dataTestId={`table_group_menu_item_${item.id}`}
          />
        ))}
      </Scrollbar>
      {isCloseable ? (
        <div className={styles.tableHeaderIcon}>
          <IconButton
            className={styles.tableHeaderIconButton}
            size={16}
            onClick={onCloseClick}
            iconName={CrossIconSvgUrl}
            isFill
            dataTestId="close-button"
          />
        </div>
      ) : null}
      {!withoutInfoPanelToggler ? (
        <div
          className={classNames(
            styles.infoPanelToggleWrapper,
            styles.tableHeaderIcon,
            {
              [styles.isInfoPanelVisible]: isInfoPanelVisible,
            },
          )}
        >
          <div
            className={classNames(
              styles.infoPanelToggleBg,
              "info-panel-toggle-bg",
            )}
          >
            <IconButton
              id="info-panel-toggle--open"
              className={classNames(
                styles.infoPanelToggle,
                styles.tableHeaderIconButton,
                "info-panel-toggle",
              )}
              iconName={PanelReactSvgUrl}
              size={16}
              isFill
              onClick={toggleInfoPanel}
              color={toggleIconColor}
              hoverColor={toggleIconColor}
              dataTestId="info-panel-toggle-button"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { TableGroupMenu };
