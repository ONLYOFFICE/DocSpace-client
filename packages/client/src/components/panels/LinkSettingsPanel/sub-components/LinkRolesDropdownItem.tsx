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

import classNames from "classnames";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Badge } from "@docspace/shared/components/badge";
import { LinkRolesDropdownItemProps } from "../LinkSettingsPanel.types";
import styles from "./LinkRolesDropdown.module.scss";

const LinkRolesDropdownItem = ({
  item,
  currentItem,
  setCurrentItem,
}: LinkRolesDropdownItemProps) => {
  const isSelected = currentItem?.key === item?.key;

  return (
    <div
      title={item.title}
      // onClick={onClick}
      // data-selected-id={selectedId}
      className={classNames(styles.dropDownItem, {
        // [styles.isOpen]: isOpen,
      })}
    >
      {item.isSeparator ? (
        <DropDownItem key={item.key} isSeparator />
      ) : (
        <DropDownItem
          className="access-right-item"
          key={item.key}
          data-key={item.key}
          isSelected={isSelected}
          isActive={isSelected}
          onClick={() => setCurrentItem?.(item)}
          disabled={item?.disabled}
          tooltip={item?.tooltip}
        >
          <div className={styles.item}>
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
      )}
    </div>
  );
};

export { LinkRolesDropdownItem };
