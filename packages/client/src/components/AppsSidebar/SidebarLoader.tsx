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

import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import styles from "./SidebarLoader.module.scss";

// Mirrors the NavMenu geometry: a 36px-tall row per item with a 16px icon and,
// when text is shown, a label rectangle filling the remaining width.
const NavItemSkeleton = ({ showText }: { showText: boolean }) => (
  <div className={styles.navItem}>
    <RectangleSkeleton width="16px" height="16px" borderRadius="3px" />
    {showText ? (
      <RectangleSkeleton
        className={styles.navItemText}
        width="100%"
        height="14px"
        borderRadius="3px"
      />
    ) : null}
  </div>
);

type NavMenuLoaderProps = {
  showText: boolean;
  // Number of nav rows to render. Defaults to the Overview item + a few apps.
  count?: number;
};

// Skeleton for the navigation list (Overview + apps) while the apps list loads.
export const NavMenuLoader = ({ showText, count = 6 }: NavMenuLoaderProps) => (
  <div
    className={styles.navMenu}
    data-show-text={showText ? "true" : "false"}
    data-testid="apps-sidebar-nav-loader"
  >
    {/* Overview lives in its own group with a 16px gap below it. */}
    <NavItemSkeleton showText={showText} />
    <div className={styles.navGroup}>
      {Array.from({ length: count - 1 }, (_, index) => (
        <NavItemSkeleton key={index} showText={showText} />
      ))}
    </div>
  </div>
);
