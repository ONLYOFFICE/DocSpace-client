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

import React, { useMemo } from "react";
import classnames from "classnames";

import Navigation from "@docspace/ui-kit/components/navigation";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";

import useDeviceType from "@/hooks/useDeviceType";

// Thin agents-only header. Mirrors (docspace)/_components/header structure
// (same SectionHeader.module.scss + ui-kit <Navigation>) so the title
// typography, vertical alignment and frame-header offset match
// (personal-files) 1-to-1, without pulling docspace's NavigationStore /
// FilesSelectionStore / FilesListStore (the AI-agents list is flat — no
// breadcrumbs, no selection state, no folder traversal).

type AgentsHeaderProps = {
  title: string;
  isEmptyList?: boolean;
  headerOffset?: number;
};

const AgentsHeader = ({
  title,
  isEmptyList = false,
  headerOffset = 0,
}: AgentsHeaderProps) => {
  const { currentDeviceType } = useDeviceType();

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

  return (
    <div className={classnames(styles.headerContainer)} style={outerOffsetStyle}>
      <div className="header-container" style={innerOffsetStyle}>
        <Navigation
          showText
          isRootFolder
          canCreate={false}
          title={title}
          rootRoomTitle=""
          isDesktop={false}
          navigationItems={[]}
          getContextOptionsPlus={() => []}
          getContextOptionsFolder={() => []}
          onClickFolder={noop}
          isTrashFolder={false}
          isEmptyPage={isEmptyList}
          isEmptyFilesList={isEmptyList}
          onBackToParentFolder={noop}
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
