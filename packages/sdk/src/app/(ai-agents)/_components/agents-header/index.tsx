// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React, { useMemo } from "react";
import classnames from "classnames";

import Navigation from "@docspace/ui-kit/components/navigation";
import type {
  TNavigationItem,
  TOnNavigationItemClick,
} from "@docspace/ui-kit/components/navigation/Navigation.types";
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
};

const AgentsHeader = ({
  title,
  isEmptyList = false,
  navigationItems = [],
  onBackToParentFolder,
  onClickFolder,
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
          getContextOptionsFolder={() => []}
          onClickFolder={handleClickFolder}
          isTrashFolder={false}
          isEmptyPage={isEmptyList}
          isEmptyFilesList={isEmptyList}
          onBackToParentFolder={handleBack}
          showRootFolderTitle={false}
          withMenu={false}
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
