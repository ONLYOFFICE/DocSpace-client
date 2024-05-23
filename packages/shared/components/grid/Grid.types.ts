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

export type TColumnProp = string | string[] | { count: string; size: string };
export type TAreaProp =
  | string[][]
  | { start: number[]; end: number[]; name: string }[];

export interface GridProps {
  /** Sets the tag through which to render the component */
  as?: string;
  /** Sets the distribution of space between and around content items along a flexbox's cross-axis or a grid's block axis */
  alignContent?: string;
  /** Sets the align-self value on all direct children as a group. In Flexbox, it controls the alignment of items on the Cross Axis.
   * In Grid Layout, it controls the alignment of items on the Block Axis within their grid area. */
  alignItems?: string;
  /** Overrides a grid or flex item's align-items value. In Grid, it aligns the item inside the grid area.
   * In Flexbox, it aligns the item on the cross axis. */
  alignSelf?: string;
  /** 	Specifies named grid areas. Takes value as array of string arrays that specify named grid areas.
   * Or objects array, that contains names and coordinates of areas. */
  areasProp?: TAreaProp;
  /** Defines the sizing of the grid columns. Specifying a single string will repeat several columns of this size.
   * Specifying an object allows you to specify the number of repetitions and the size of the column.
   * Or you can specify an array with column sizes. The column size can be specified as an array of minimum and maximum widths. */
  columnsProp?: TColumnProp;
  /** Is a shorthand property for grid-row-start, grid-column-start, grid-row-end and grid-column-end, specifying a grid item’s size and
   * location within the grid by contributing a line, a span, or nothing (automatic) to its grid placement,
   *  thereby specifying the edges of its grid area. */
  gridArea?: string;
  /** Sets the size of the gap (gutter) between an element's columns. */
  gridColumnGap?: string;
  /** Sets the gaps (gutters) between rows and columns. It is a shorthand for row-gap and column-gap. */
  gridGap?: string;
  /** Sets the size of the gap (gutter) between an element's grid rows. */
  gridRowGap?: string;
  /** Defines the height of the border of the element area. */
  heightProp?: string;
  /** Defines how the browser distributes space between and around content items along the main-axis of a flex container,
   * and the inline axis of a grid container. */
  justifyContent?: string;
  /** Defines the default justify-self for all items of the box, giving them all a default way of justifying each box along the appropriate axis. */
  justifyItems?: string;
  /** Sets the way a box is justified inside its alignment container along the appropriate axis. */
  justifySelf?: string;
  /** Sets the margin area on all four sides of an element. It is a shorthand for margin-top, margin-right, margin-bottom, and margin-left */
  marginProp?: string;
  /** Sets the padding area on all four sides of an element. It is a shorthand for padding-top, padding-right, padding-bottom, and padding-left */
  paddingProp?: string;
  /** Defines the sizing of the grid rows. Specifying a single string will repeat several rows of this size. Or you can specify an array with rows sizes.
   * The row size can be specified as an array of minimum and maximum heights. */
  rowsProp?: string | string[];
  /** Sets the tag through which to render the component */
  tag?: string;
  /** Defines the width of the border of the element area. */
  widthProp?: string;
}
