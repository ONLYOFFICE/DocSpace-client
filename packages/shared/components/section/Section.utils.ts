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

import React from "react";
import {
  SECTION_HEADER_NAME,
  SECTION_FILTER_NAME,
  SECTION_BODY_NAME,
  SECTION_FOOTER_NAME,
  SECTION_INFO_PANEL_BODY_NAME,
  SECTION_INFO_PANEL_HEADER_NAME,
  SECTION_WARNING_NAME,
  SECTION_SUBMENU_NAME,
} from "./Section.constants";

export const parseChildren = (children: React.JSX.Element[]) => {
  let sectionHeaderContent: React.JSX.Element | null = null;
  let sectionFilterContent: React.JSX.Element | null = null;
  let sectionBodyContent: React.JSX.Element | null = null;
  let sectionFooterContent: React.JSX.Element | null = null;
  let infoPanelBodyContent: React.JSX.Element | null = null;
  let infoPanelHeaderContent: React.JSX.Element | null = null;
  let sectionWarningContent: React.JSX.Element | null = null;
  let sectionSubmenuContent: React.JSX.Element | null = null;

  React.Children.forEach(children, (child: React.JSX.Element) => {
    if (!React.isValidElement(child)) return;

    const type = child.type as { displayName?: string; name?: string };

    const childType = type?.displayName || type?.name || "";

    const props = child.props as { children: React.JSX.Element };

    switch (childType) {
      case SECTION_HEADER_NAME:
        sectionHeaderContent = props.children;
        break;
      case SECTION_FILTER_NAME:
        sectionFilterContent = props.children;
        break;
      case SECTION_BODY_NAME:
        sectionBodyContent = props.children;
        break;
      case SECTION_FOOTER_NAME:
        sectionFooterContent = props.children;
        break;
      case SECTION_INFO_PANEL_BODY_NAME:
        infoPanelBodyContent = props.children;
        break;
      case SECTION_INFO_PANEL_HEADER_NAME:
        infoPanelHeaderContent = props.children;
        break;
      case SECTION_WARNING_NAME:
        sectionWarningContent = props.children;
        break;
      case SECTION_SUBMENU_NAME:
        sectionSubmenuContent = props.children;
        break;
      default:
        break;
    }
  });

  const arr = [
    sectionHeaderContent,
    sectionFilterContent,
    sectionBodyContent,
    sectionFooterContent,
    sectionWarningContent,
    infoPanelBodyContent,
    infoPanelHeaderContent,
    sectionSubmenuContent,
  ];

  return arr;
};
