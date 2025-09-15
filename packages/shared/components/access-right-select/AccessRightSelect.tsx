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

import React, { useState, useEffect, useCallback } from "react";
import classNames from "classnames";
import { ReactSVG } from "react-svg";

import { DropDownItem } from "../drop-down-item";
import { Badge } from "../badge";
import { ComboBox, TOption } from "../combobox";
import { toastr } from "../toast";

import styles from "./AccessRightSelect.module.scss";
import { AccessRightSelectProps } from "./AccessRightSelect.types";

export const AccessRightSelectPure = ({
  accessOptions,
  onSelect,
  advancedOptions,
  selectedOption,
  className,
  type,
  isSelectionDisabled,
  selectionErrorText,
  availableAccess,
  isDisabled,
  dataTestId,
  ...props
}: AccessRightSelectProps) => {
  const [currentItem, setCurrentItem] = useState(selectedOption);

  useEffect(() => {
    setCurrentItem(selectedOption);
  }, [selectedOption]);

  const onSelectCurrentItem = useCallback(
    (option: TOption) => {
      if (option) {
        if (isSelectionDisabled) {
          let isError =
            option.access && option.access !== selectedOption?.access;

          if (availableAccess && option.access) {
            isError = availableAccess.every((item) => item !== option.access);
          }

          if (isError) {
            toastr.error(selectionErrorText);
            return;
          }
        }

        setCurrentItem(option);
        onSelect?.(option);
      }
    },
    [
      availableAccess,
      isSelectionDisabled,
      onSelect,
      selectedOption?.access,
      selectionErrorText,
    ],
  );

  const formatToAccessRightItem = (data: TOption[]) => {
    const items = data.map((item: TOption) => {
      const isSelected = currentItem?.key === item?.key;
      return "isSeparator" in item && item.isSeparator ? (
        <DropDownItem key={item.key} isSeparator />
      ) : (
        <DropDownItem
          className="access-right-item"
          key={item.key}
          data-key={item.key}
          isSelected={isSelected}
          isActive={isSelected}
          onClick={() => onSelectCurrentItem(item)}
          testId={`access_right_option_${item.key.toString().toLowerCase()}`}
          disabled={item?.disabled}
          tooltip={item?.tooltip}
        >
          <div className={styles.item}>
            {item.icon && typeof item.icon === "string" ? (
              <ReactSVG
                className={classNames(styles.itemIcon, {
                  [styles.isShortenIcon]: type === "onlyIcon",
                })}
                src={item.icon}
              />
            ) : null}

            <div className={styles.itemContent}>
              <div className={styles.itemTitle}>
                {item.label}
                {item.quota ? (
                  <Badge
                    label={item.quota}
                    backgroundColor={item.color}
                    fontSize="9px"
                    isPaidBadge
                    noHover
                  />
                ) : null}
              </div>
              <div className={styles.itemDescription}>{item.description}</div>
            </div>
          </div>
        </DropDownItem>
      );
    });

    return <div style={{ display: "contents" }}>{items}</div>;
  };

  const formattedOptions =
    advancedOptions ?? formatToAccessRightItem(accessOptions);

  // console.log(formattedOptions);

  return (
    <ComboBox
      className={classNames(styles.wrapper, className, {
        [styles.descriptive]: type === "descriptive",
        [styles.onlyIcon]: type === "onlyIcon",
        [styles.isDisabled]: isDisabled,
      })}
      type={type}
      isDisabled={isDisabled}
      advancedOptions={formattedOptions}
      onSelect={onSelectCurrentItem}
      options={[]}
      selectedOption={
        {
          icon: currentItem?.icon,
          key: currentItem?.key,
          label: type === "onlyIcon" ? "" : currentItem?.label,
          description: type === "onlyIcon" ? "" : currentItem?.description,
        } as TOption
      }
      forceCloseClickOutside
      dropDownClassName={styles.accessRightSelectDropdown}
      dataTestId={dataTestId}
      useImageIcon
      {...props}
    />
  );
};

const AccessRightSelect = React.memo(AccessRightSelectPure);

export { AccessRightSelect };
