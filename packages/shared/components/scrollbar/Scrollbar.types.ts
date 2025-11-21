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

import {
  ScrollbarProps as ScrollbarLibraryProps,
  Scrollbar as CustomScrollbar,
} from "./custom-scrollbar";

type PickedScrollbarLibraryProps = Pick<
  ScrollbarLibraryProps,
  | "id"
  | "className"
  | "style"
  | "noScrollY"
  | "noScrollX"
  | "createContext"
  | "translateContentSizeYToHolder"
  | "translateContentSizeXToHolder"
  | "translateContentSizesToHolder"
  | "rtl"
>;

export type ScrollbarProps = PickedScrollbarLibraryProps & {
  /** Ref to access the DOM element or React component instance */
  ref?: React.Ref<CustomScrollbar | null>;
  /** This class will be placed on scroller element */
  scrollClass?: string;
  /** This class will be placed on scroller body element */
  scrollBodyClassName?: string;
  /** Enable tracks auto hiding.  */
  autoHide?: boolean;
  /** Fix scrollbar size. */
  fixedSize?: boolean;
  /** Set focus on scroll content element after first render */
  autoFocus?: boolean;
  /** Set scroll body tabindex */
  tabIndex?: number | null;
  /** Add padding bottom to scroll-body */
  paddingAfterLastItem?: string;
  /** Add custom padding-inline-end to scroll-body. */
  paddingInlineEnd?: string;
  /** Add onScroll handler */
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  /** Add children */
  children?: React.ReactNode;
};

export type CustomScrollbarsVirtualListProps = Pick<
  ScrollbarProps,
  | "style"
  | "onScroll"
  | "children"
  | "className"
  | "autoFocus"
  | "scrollClass"
  | "paddingAfterLastItem"
> & {
  forwardedRef?: React.ForwardedRef<unknown>;
  contentRef?: React.RefObject<HTMLDivElement | null>;
};
