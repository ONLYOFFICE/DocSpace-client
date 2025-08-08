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
import { TabsTypes } from "./Tabs.enums";

export type TTabItem = {
  /** Element id. */
  id: string;
  /** Tab text. */
  name: string | React.ReactNode;
  /** Content that is shown when you click on the tab. */
  content: React.ReactNode;
  /** State of tab inclusion. State only works for tabs with a secondary theme. */
  isDisabled?: boolean;
  /** Sets a callback function that is triggered when the tab is selected */
  onClick?: () => void;
  /** Badge shown after tab. Only for primary tabs type */
  badge?: React.ReactNode;

  value?: number;
  /** Icon name. Only for secondary tabs type */
  iconName?: string;
};

export type TabsProps = {
  /** Child elements. */
  items: TTabItem[];
  /** Selected item of tabs. */
  selectedItemId: number | string;
  /** Theme for displaying tabs. */
  type?: TabsTypes;
  /** Tab indentation for sticky positioning. */
  stickyTop?: string;
  /** Sets a tab class name */
  className?: string;
  /** Sets a callback function that is triggered when the tab is selected. */
  onSelect?: (element: TTabItem) => void;
  withoutStickyIntend?: boolean;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** If set, this component will animate changes to its layout. Additionally, when a new element enters the DOM and an element already exists with a matching layoutId, it will animate out from the previous element's size/position. */
  layoutId?: string;
  /** Is loading */
  isLoading?: boolean;
  /** Scales tabs to container width */
  scaled?: boolean;
  /** Unique identifier for hotkey functionality */
  hotkeysId?: string;
  id?: string;
  withAnimation?: boolean;
};

export type TTabsHotkey = {
  /** Determines whether keyboard hotkeys are enabled for tab navigation */
  enabledHotkeys: boolean;
  /** Sets the active state of hotkeys */
  setHotkeysIsActive: (focusedTabIndex: boolean) => void;
  /** Tab items to be rendered */
  items: TTabItem[];
  /** Index of the currently focused tab */
  focusedTabIndex: number;
  /** Sets the index of the focused tab */
  setFocusedTabIndex: (focusedTabIndex: number) => void;
  /**  Scrolls to bring a specific tab into view */
  scrollToTab: (index: number) => void;
  /** Sets a callback function that is triggered when the tab is selected */
  onSelect?: (element: TTabItem) => void;
  /** Unique identifier for hotkey functionality */
  hotkeysId?: string;
};
