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

import React, { useRef, useState } from "react";
import classNames from "classnames";

import SettingsDeskReactSvgUrl from "PUBLIC_DIR/images/settings.desc.react.svg?url";

import { IconButton } from "../../../icon-button";
import { DropDown } from "../../../drop-down";
import { Checkbox } from "../../../checkbox";

import { TTableColumn, TableSettingsProps } from "../../Table.types";
import styles from "./TableSettings.module.scss";

const TableSettings = ({ columns, disableSettings }: TableSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  const onClick = () => {
    if (!disableSettings) setIsOpen((s) => !s);
  };

  const clickOutsideAction = (e: Event) => {
    const path = e.composedPath && e.composedPath();
    const dropDownItem = path
      ? path.find((x: EventTarget) => x === ref.current)
      : null;
    if (dropDownItem) return;

    setIsOpen(false);
  };

  return (
    <div
      className={styles.tableSettings}
      ref={ref}
      data-testid="table-settings"
    >
      <IconButton
        className={classNames(styles.tableSettingsIcon, {
          [styles.isDisabled]: disableSettings,
        })}
        size={12}
        isFill
        iconName={SettingsDeskReactSvgUrl}
        onClick={onClick}
        isDisabled={disableSettings}
        dataTestId="table-settings-button"
      />
      <DropDown
        directionX="left"
        open={isOpen}
        clickOutsideAction={clickOutsideAction}
        forwardedRef={ref}
        withBackdrop={false}
        eventTypes={["click", "mousedown"]}
      >
        {columns.map((column: TTableColumn) => {
          if (column.isDisabled) return;

          const onChange = () => column.onChange?.(column.key);

          return (
            column.onChange && (
              <Checkbox
                className={classNames(
                  styles.tableSettingsCheckbox,
                  "table-container_settings-checkbox not-selectable",
                )}
                isChecked={column.enable}
                onChange={onChange}
                key={column.key}
                label={column.title}
                dataTestId={`table_settings_${column.key}`}
              />
            )
          );
        })}
      </DropDown>
    </div>
  );
};

export { TableSettings };
