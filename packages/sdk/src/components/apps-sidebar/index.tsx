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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { NavMenu } from "@docspace/ui-kit/components/nav-menu";
import type { NavMenuGroup } from "@docspace/ui-kit/components/nav-menu";
import articleStyles from "@docspace/ui-kit/components/article/Article.module.scss";
import { DeviceType } from "@docspace/shared/enums";

import styles from "./AppsSidebar.module.scss";

export type AppsSidebarProps = {
  groups: NavMenuGroup[];
  activeId?: string;
  defaultExpandedId?: string;
  showText: boolean;
  toggleShowText: () => void;
  isOpen: boolean;
  currentDeviceType: DeviceType;
  tooltipId?: string;
};

const AppsSidebar = ({
  groups,
  activeId,
  defaultExpandedId,
  showText,
  toggleShowText,
  isOpen,
  currentDeviceType,
  tooltipId = "apps-sidebar-toggle-tooltip",
}: AppsSidebarProps) => {
  const { t } = useTranslation(["Common"]);
  const isMobile = currentDeviceType === DeviceType.mobile;

  return (
    <div
      id="article-container"
      className={`${articleStyles.article} ${styles.articleFlex}`}
      data-show-text={showText ? "true" : "false"}
      data-open="true"
      data-with-main-button="false"
      data-sidebar-open={isOpen ? "true" : "false"}
      aria-hidden={isMobile && !isOpen}
    >
      <div style={{ height: "16px", flexShrink: 0 }} />
      <Scrollbar
        className={`article-body__scrollbar ${styles.scrollbar}`}
        scrollClass="article-scroller"
      >
        <NavMenu
          groups={groups}
          activeItemId={activeId}
          defaultExpandedId={defaultExpandedId}
        />
      </Scrollbar>
      <div
        className={styles.borderToggle}
        onClick={toggleShowText}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleShowText();
          }
        }}
        data-tooltip-id={tooltipId}
        data-tooltip-content={
          showText ? t("Common:HideArticleMenu") : t("Common:ShowArticleMenu")
        }
      />
      <Tooltip id={tooltipId} place="right" float />
    </div>
  );
};

export default AppsSidebar;
