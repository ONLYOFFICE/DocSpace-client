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
import { TLogo } from "../../api/rooms/types";

export type ContextMenuRefType = {
  show: (e: React.MouseEvent | MouseEvent) => void;
  hide: (
    e:
      | React.MouseEvent
      | MouseEvent
      | Event
      | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  toggle: (
    e:
      | React.MouseEvent
      | MouseEvent
      | Event
      | React.ChangeEvent<HTMLInputElement>,
  ) => boolean | undefined;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

export type TContextMenuValueTypeOnClick =
  | {
      originalEvent: React.MouseEvent | React.ChangeEvent<HTMLInputElement>;
      action?: string | boolean;
      item?: ContextMenuType;
    }
  | React.MouseEvent
  | React.ChangeEvent<HTMLInputElement>;

export type ContextMenuTypeOnClick = (
  value: TContextMenuValueTypeOnClick,

  item?: ContextMenuType,
) => void;

export type ContextMenuType = {
  id?: string;
  key: string | number;
  label: string | React.ReactNode;
  icon?: string;
  disabled?: boolean;
  onClick?: ContextMenuTypeOnClick;
  isSeparator?: undefined;
  url?: string;
  items?: ContextMenuModel[];
  action?: string;
  className?: string;
  disableColor?: string;
  style?: React.CSSProperties;
  target?: string;
  isLoader?: boolean;
  isHeader?: boolean;
  onLoad?: () => Promise<ContextMenuModel[]>;
  template?: unknown;
  isOutsideLink?: boolean;
  withToggle?: boolean;
  checked?: boolean;
  badgeLabel?: string;
  isPaidBadge?: boolean;
  preventNewTab?: boolean;
  dataTestId?: string;
};

export type SeparatorType = {
  id?: string;
  key: string | number;
  isSeparator: boolean;
  disabled?: boolean;
  className?: string;
  disableColor?: string;
  isLoader?: boolean;
  style?: React.CSSProperties;
  dataTestId?: string;
};

export type HeaderType =
  | (TLogo & {
      title: string;
      avatar?: string;
      logo?: string;
      icon?: string;
      badgeUrl?: string;
    })
  | { title: string; icon: string; badgeUrl?: string };

export type ContextMenuModel = ContextMenuType | SeparatorType;

export type TMobileMenuStackItem = {
  items: ContextMenuModel[];
  header: string;
};

export type TOnMobileItemClick = (
  e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  label: string,
  items?: ContextMenuModel[],
  loadFunc?: () => Promise<ContextMenuModel[]>,
) => void;

export type TGetContextMenuModel = () => ContextMenuModel[];

export interface ContextMenuProps {
  /** Unique identifier of the element */
  id?: string;
  /** An array of menuitems */
  model: ContextMenuModel[];
  /** An object of header with icon and label */
  header?: HeaderType;
  /** Inline style of the component */
  style?: React.CSSProperties;
  /** Style class of the component */
  className?: string;
  /** Attaches the menu to document instead of a particular item */
  global?: boolean;
  /** Sets the context menu to be rendered with a backdrop */
  withBackdrop?: boolean;
  /** Ignores changeView restrictions for rendering backdrop */
  ignoreChangeView?: boolean;
  /** Sets zIndex layering value automatically */
  autoZIndex?: boolean;
  /** Sets automatic layering management */
  baseZIndex?: number;
  /** DOM element instance where the menu is mounted */
  appendTo?: HTMLElement;
  /** Specifies a callback function that is invoked when a popup menu is shown */
  onShow?: (
    e:
      | React.MouseEvent
      | MouseEvent
      | Event
      | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  /** Specifies a callback function that is invoked when a popup menu is hidden */
  onHide?: (
    e?:
      | React.MouseEvent
      | MouseEvent
      | Event
      | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  /** Displays a reference to another component */
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /** Scales width by the container component */
  scaled?: boolean;
  /** Fills the icons with default colors */
  fillIcon?: boolean;
  /** Function that returns an object containing the elements of the context menu */
  getContextModel?: TGetContextMenuModel;
  /** Specifies the offset  */
  leftOffset?: number;
  rightOffset?: number;
  isRoom?: boolean;
  isArchive?: boolean;
  ref?: React.RefObject<ContextMenuRefType | null>;
  badgeUrl?: string;
  headerOnlyMobile?: boolean;
  dataTestId?: string;
}

export type TContextMenuRef = {
  show: (e: React.MouseEvent) => void;
  hide: (e: React.MouseEvent) => object | void;
};
