import React, { useRef, useState } from "react";

import SettingsDeskReactSvgUrl from "PUBLIC_DIR/images/settings.desc.react.svg?url";

import { DropDown } from "../../drop-down";
import { Checkbox } from "../../checkbox";

import { StyledTableSettings, StyledSettingsIcon } from "../Table.styled";
import { TTableColumn, TableSettingsProps } from "../Table.types";

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
    <StyledTableSettings
      className="table-container_header-settings-icon"
      ref={ref}
    >
      <StyledSettingsIcon
        size={12}
        isFill
        iconName={SettingsDeskReactSvgUrl}
        onClick={onClick}
        isDisabled={disableSettings}
      />
      <DropDown
        className="table-container_settings"
        directionX="right"
        open={isOpen}
        clickOutsideAction={clickOutsideAction}
        forwardedRef={ref}
        withBackdrop={false}
      >
        {columns.map((column: TTableColumn) => {
          if (column.isDisabled) return;

          const onChange = () => column.onChange?.(column.key);

          return (
            column.onChange && (
              <Checkbox
                className="table-container_settings-checkbox not-selectable"
                isChecked={column.enable}
                onChange={onChange}
                key={column.key}
                label={column.title}
              />
            )
          );
        })}
      </DropDown>
    </StyledTableSettings>
  );
};

export { TableSettings };
