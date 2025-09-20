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

import { useState } from "react";
import classNames from "classnames";
import { isMobile } from "@docspace/shared/utils";

import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";

import { IconButton } from "@docspace/shared/components/icon-button";
import { Text } from "@docspace/shared/components/text";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import { LinkRolesDropdownItem } from "./LinkRolesDropdownItem";
import { TOption } from "@docspace/shared/components/combobox";
import styles from "./LinkRolesDropdown.module.scss";
import { LinkRolesDropdownProps } from "../LinkSettingsPanel.types";

const LinkRolesDropdown = ({
  currentAccess,
  accesses,
  linkSelectedAccess,
  setLinkSelectedAccess,
}: LinkRolesDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // const [heightList, setHeightList] = useState(null);
  const heightList = null;

  const roomTypes = accesses.map((access: TOption) => (
    <LinkRolesDropdownItem
      key={access.key}
      item={access}
      currentItem={linkSelectedAccess}
      setCurrentItem={(access) => {
        setLinkSelectedAccess(access);
        setIsOpen(false);
      }}
    />
  ));

  return (
    <div className={styles.linkRolesDropdown}>
      <div
        title={currentAccess?.label}
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(styles.linkRoles, styles.dropDownButton, {
          [styles.isOpen]: isOpen,
        })}
      >
        <div className="choose_access-info_wrapper">
          <div className="choose_access-title">
            <Text className="choose_access-title-text">
              {currentAccess?.label}
            </Text>
          </div>
          <Text className="choose_access-description">
            {currentAccess?.description}
          </Text>
        </div>

        <IconButton
          className={classNames(styles.chooseAccessButton, {
            [styles.isOpen]: isOpen,
          })}
          iconName={ArrowReactSvgUrl}
          size={16}
        />
      </div>
      {isMobile() ? (
        <>
          {/* <DropdownMobile
          t={t}
          open={isOpen}
          onClose={toggleDropdown}
          chooseRoomType={chooseRoomType}
          forceHideDropdown={forceHideDropdown}
        /> */}
        </>
      ) : (
        <>
          {/*         <DropdownDesktop
           t={t}  open={isOpen}  chooseRoomType={chooseRoomType} 
        /> */}
          <div
            className={classNames(
              styles.linkRolesDropdownContainer,
              "dropdown-content-wrapper",
              {
                [styles.isOpen]: isOpen,
              },
            )}
          >
            <div
              className={classNames("dropdown-content", styles.dropdownContent)}
              // ref={dropdownRef}
            >
              {heightList ? (
                <Scrollbar
                  paddingInlineEnd="0"
                  paddingAfterLastItem="0"
                  style={{ height: heightList, width: "100%" }}
                >
                  {roomTypes}
                </Scrollbar>
              ) : (
                roomTypes
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LinkRolesDropdown;
