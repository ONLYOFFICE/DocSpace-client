// (c) Copyright Ascensio System SIA 2009-2024
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

export interface BoxProps {
  /** Sets the tag through which to render the component */
  as?: React.ElementType;
  /** Sets the distribution of space between and around content items
   * along a flexbox's cross-axis or a grid's block axis */
  alignContent?: string;
  /** Sets the align-self value on all direct children as a group.
   * In Flexbox, it controls the alignment of items on the Cross Axis.
   * In Grid Layout, it controls the alignment of items on the Block Axis
   * within their grid area.  */
  alignItems?: string;
  /** Overrides a grid or flex item's align-items value. In Grid,
   * it aligns the item inside the grid area. In Flexbox, it aligns
   * the item on the cross axis. */
  alignSelf?: string;
  /** Sets all background style properties at once, such as color,
   * image, origin and size, or repeat method.  */
  backgroundProp?: string;
  /** Sets the element's border. It sets the values of border-width,
   * border-style, and border-color. */
  borderProp?:
    | string
    | { style: string; width: string; color: string; radius?: string };
  /** Sets whether the element is treated as a block or inline element and
   * the layout used for its children, such as flow layout, grid or flex. */
  displayProp?: string;
  /** Sets the initial main size of the flex item. It sets the size of the content
   * box unless otherwise set with box-sizing. */
  flexBasis?: string;
  /** Sets how flex items are placed in the flex container defining the main axis and
   * the direction (normal or reversed) */
  flexDirection?: string;
  /** Sets how the flex item will grow or shrink to fit the space available in its
   * flex container. It is a shorthand for flex-grow, flex-shrink, and flex-basis. */
  flexProp?: string;
  /** Sets whether flex items are forced onto one line or can wrap onto multiple lines.
   * If wrapping is allowed, it sets the direction that lines are stacked. */
  flexWrap?: string;
  /** Is a shorthand property for grid-row-start, grid-column-start, grid-row-end and
   * grid-column-end, specifying the size of the grid item and location within the grid by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * Thereby specifying the edges of its grid area. */
  gridArea?: string;
  /** Defines the height of the border of the element area. */
  heightProp?: string;
  /** Defines how the browser distributes space between and around content items along
   * the main-axis of a flex container, and the inline axis of a grid container */
  justifyContent?: string;
  /** Defines the default justify-self for all items of the box, giving them all
   * a default way of justifying each box along the appropriate axis. */
  justifyItems?: string;
  /** Sets the way the box is justified inside its alignment container along the appropriate axis. */
  justifySelf?: string;
  /** Sets the margin area on all four sides of an element. It is a shorthand for margin-top,
   * margin-right, margin-bottom, and margin-left. */
  marginProp?: string;
  /** Sets what to do when an element's content is too big to fit in its block formatting context. */
  overflowProp?: string;
  /** Sets the padding area on all four sides of the element. It is a shorthand for padding-top,
   * padding-right, padding-bottom, and padding-left */
  paddingProp?: string;
  /** Sets the horizontal alignment of a block element or table-cell box.
   * This means it works like vertical-align but in the horizontal direction  */
  textAlign?: string;
  /** Defines the border width of the element area. */
  widthProp?: string;

  /** Sets gap to flex, and grid containers. */
  gapProp?: string;

  children?: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;

  onClick?: () => void;
}
