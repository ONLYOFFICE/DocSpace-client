// (c) Copyright Ascensio System SIA 2009-2026
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
