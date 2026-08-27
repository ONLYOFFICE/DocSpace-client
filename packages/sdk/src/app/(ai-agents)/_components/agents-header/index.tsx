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

"use client";

import React, { useMemo } from "react";
import classnames from "classnames";

import Navigation from "@docspace/ui-kit/components/navigation";
import type {
  TNavigationItem,
  TOnNavigationItemClick,
} from "@docspace/ui-kit/components/navigation/Navigation.types";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";

import useDeviceType from "@/hooks/useDeviceType";
import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";

// Thin agents-only wrapper around ui-kit <Navigation>. Same shape as
// client/Home Section/Header but trimmed to the props the AI-agents flow
// actually uses — no FilesStore / NavigationStore / SelectedFolderStore
// dependency.
//
// Pass `navigationItems` to render the breadcrumb chain (path-parts). The
// items array is ordered from the IMMEDIATE PARENT to the root, like the
// client's `navigationPath` — so for an agent at `/ai-agents/123`, the
// single parent entry is `{ id: "ai-agents", title: "AI Agents", … }`.
//
// `onBackToParentFolder` is the back-arrow handler (defaults to navigating
// to the first item in `navigationItems`); `onClickFolder` fires when the
// user clicks a specific breadcrumb item.

type AgentsHeaderProps = {
  title: string;
  isEmptyList?: boolean;
  navigationItems?: TNavigationItem[];
  onBackToParentFolder?: () => void;
  onClickFolder?: TOnNavigationItemClick;
  getContextOptions?: () => ContextMenuModel[];
};

const noOptions = () => [];

const AgentsHeader = ({
  title,
  isEmptyList = false,
  navigationItems = [],
  onBackToParentFolder,
  onClickFolder,
  getContextOptions,
}: AgentsHeaderProps) => {
  const { currentDeviceType } = useDeviceType();
  const { headerOffset } = useFrameHeaderConfig();

  const isRootFolder = navigationItems.length === 0;

  const { outerOffsetStyle, innerOffsetStyle } = useMemo(() => {
    if (!headerOffset) {
      return {
        outerOffsetStyle: undefined as React.CSSProperties | undefined,
        innerOffsetStyle: undefined as React.CSSProperties | undefined,
      };
    }
    return {
      outerOffsetStyle: { alignSelf: "stretch" } as React.CSSProperties,
      innerOffsetStyle: {
        position: "relative",
        marginInlineStart: `${headerOffset}px`,
        height: "100%",
      } as React.CSSProperties,
    };
  }, [headerOffset]);

  const noop = React.useCallback(() => {}, []);

  const handleClickFolder = React.useCallback<TOnNavigationItemClick>(
    (id, isRootRoom, isRootTemplates) => {
      if (onClickFolder) onClickFolder(id, isRootRoom, isRootTemplates);
      else if (onBackToParentFolder) onBackToParentFolder();
    },
    [onClickFolder, onBackToParentFolder],
  );

  const handleBack = React.useCallback(() => {
    if (onBackToParentFolder) onBackToParentFolder();
    else if (navigationItems.length > 0 && onClickFolder) {
      const first = navigationItems[0];
      onClickFolder(first.id, first.isRootRoom, first.isRootTemplates);
    }
  }, [navigationItems, onBackToParentFolder, onClickFolder]);

  return (
    <div className={classnames(styles.headerContainer)} style={outerOffsetStyle}>
      <div className="header-container" style={innerOffsetStyle}>
        <Navigation
          showText
          isRootFolder={isRootFolder}
          canCreate={false}
          title={title}
          rootRoomTitle=""
          isDesktop={false}
          navigationItems={navigationItems}
          getContextOptionsPlus={() => []}
          getContextOptionsFolder={getContextOptions ?? noOptions}
          onClickFolder={handleClickFolder}
          isTrashFolder={false}
          isEmptyPage={isEmptyList}
          isEmptyFilesList={isEmptyList}
          onBackToParentFolder={handleBack}
          showRootFolderTitle={false}
          withMenu={!!getContextOptions}
          isContextButtonVisible={!!getContextOptions}
          currentDeviceType={currentDeviceType}
          titleIcon=""
          titleIconTooltip=""
          showNavigationButton={false}
          isCurrentFolderInfo={false}
          showTitle
          isRoom={false}
          isInfoPanelVisible={false}
          toggleInfoPanel={noop}
          withLogo=""
          burgerLogo=""
          onLogoClick={noop}
          hideInfoPanel={noop}
          clearTrash={noop}
          showFolderInfo={noop}
        />
      </div>
    </div>
  );
};

export default AgentsHeader;
