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

import React from "react";
import classNames from "classnames";
import { ReactSVG } from "react-svg";
import PropTypes from "prop-types";

import { Badge } from "@docspace/ui-kit/components/badge";
import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

import MenuIcon from "PUBLIC_DIR/images/menu.react.svg";

import styles from "./nav-item.module.scss";

const NavItem = React.memo((props) => {
  const {
    separator,
    opened,
    active,
    iconName,
    iconUrl,
    children,
    badgeNumber,
    onClick,
    onBadgeClick,
    url,
    noHover,
    dashed,
    ...rest
  } = props;

  return separator ? (
    <div
      className={classNames(styles.navItemSeparator, { [styles.dashed]: dashed })}
      {...rest}
    />
  ) : (
    <Link
      className={classNames(styles.navItemWrapper, {
        [styles.active]: active,
        [styles.noHover]: noHover,
      })}
      data-icon-url={iconUrl || undefined}
      href={url}
      onClick={onClick}
      {...rest}
    >
      {iconUrl ? (
        <ReactSVG src={iconUrl} beforeInjection={() => {}} />
      ) : (
        <>
          {iconName === "MenuIcon" ? (
            <div className={styles.versionBadge}>BETA</div>
          ) : null}
          <MenuIcon
            className={classNames(styles.menuIcon, { [styles.active]: active })}
          />
        </>
      )}
      {children ? (
        <Text
          className={classNames(styles.navItemLabel, {
            [styles.opened]: opened,
            [styles.active]: active,
          })}
          fontSize="16px"
          fontWeight="bold"
          truncate
        >
          {children}
        </Text>
      ) : null}
      <Badge
        className={classNames(styles.navItemBadge, { [styles.opened]: opened })}
        label={badgeNumber}
        onClick={onBadgeClick}
      />
    </Link>
  );
});

NavItem.displayName = "NavItem";

NavItem.propTypes = {
  active: PropTypes.bool,
  badgeNumber: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  url: PropTypes.string,
  iconName: PropTypes.string,
  iconUrl: PropTypes.string,
  onBadgeClick: PropTypes.func,
  onClick: PropTypes.func,
  opened: PropTypes.bool,
  separator: PropTypes.bool,
  noHover: PropTypes.bool,
  dashed: PropTypes.bool,
};

export default NavItem;
