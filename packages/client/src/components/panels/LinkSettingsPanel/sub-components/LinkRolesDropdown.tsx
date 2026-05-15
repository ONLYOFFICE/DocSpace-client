/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { isMobile } from "@docspace/shared/utils";

import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";

import { LinkRolesDropdownItem } from "./LinkRolesDropdownItem";
import { TOption } from "@docspace/ui-kit/components/combobox";
import styles from "./LinkRolesDropdown.module.scss";
import { LinkRolesDropdownProps } from "../LinkSettingsPanel.types";
import { Portal } from "@docspace/ui-kit/components/portal";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";

const LinkRolesDropdown = ({
  currentAccess,
  accesses,
  linkSelectedAccess,
  setLinkSelectedAccess,
}: LinkRolesDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [heightList, setHeightList] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const onHeightCalculation = () => {
    if (!dropdownRef.current) return;

    const screenHeight = document.documentElement.clientHeight;
    const elementHeight = dropdownRef.current.getBoundingClientRect().bottom;
    const elementShadowHeight = 12;
    const buttonHeight = 73;
    const padding = 12;
    const showElementFullHeight =
      screenHeight -
        elementHeight -
        padding / 2 -
        elementShadowHeight -
        buttonHeight >=
      0;

    if (!showElementFullHeight) {
      const newHeightList =
        screenHeight -
        dropdownRef.current.getBoundingClientRect().y -
        elementShadowHeight -
        buttonHeight -
        padding;

      setHeightList(newHeightList);
    } else setHeightList(0);
  };

  useEffect(() => {
    if (isOpen) {
      onHeightCalculation();
      window.addEventListener("resize", onHeightCalculation);
    } else if (typeof heightList === "number") setHeightList(null);

    return () => {
      window.removeEventListener("resize", onHeightCalculation);
    };
  }, [isOpen, heightList]);

  const isMobileView = isMobile();

  return (
    <div className={styles.linkRolesDropdown} data-testid="link-roles-dropdown">
      <div
        title={
          typeof currentAccess?.label === "string"
            ? currentAccess.label
            : undefined
        }
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
      <Backdrop
        visible={isOpen}
        onClick={() => setIsOpen(false)}
        withBackground={!isMobileView}
        withoutBackground={!isMobileView}
        isAside
        zIndex={isMobileView ? 450 : 400}
      />
      {isMobileView ? (
        <Portal
          visible
          element={
            <>
              <div
                className={classNames(
                  styles.linkRolesDropdownMobileContainer,
                  "dropdown-mobile-content-wrapper",
                  {
                    [styles.isOpen]: isOpen,
                  },
                )}
              >
                {roomTypes}
              </div>
            </>
          }
        />
      ) : (
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
            ref={dropdownRef}
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
      )}
    </div>
  );
};

export default LinkRolesDropdown;
