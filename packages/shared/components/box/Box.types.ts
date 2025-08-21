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

/** CSS display property values */
type DisplayValue =
  | "block"
  | "inline"
  | "flex"
  | "grid"
  | "none"
  | "inline-block";

/** CSS flex direction values */
type FlexDirectionValue = "row" | "column" | "row-reverse" | "column-reverse";

/** CSS align and justify values */
type AlignValue =
  | "flex-start"
  | "flex-end"
  | "center"
  | "stretch"
  | "baseline"
  | "space-between"
  | "space-around"
  | "start"
  | "end";

/** CSS text align values */
export type TextAlignValue =
  | "left"
  | "right"
  | "center"
  | "justify"
  | "start"
  | "end";

/** CSS flex wrap values */
type FlexWrapValue = "nowrap" | "wrap" | "wrap-reverse";

/** CSS overflow values */
type OverflowValue = "visible" | "hidden" | "scroll" | "auto";

/** Border properties object type */
type BorderPropObject = {
  style: string;
  width: string;
  color: string;
  radius?: string;
};

/** ARIA boolean attribute values */
type AriaBoolean = boolean | "true" | "false";

/** Main Box component props */
export type BoxProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** Element type to render as */
  as?: React.ElementType;

  /** Layout props */
  displayProp?: DisplayValue;
  flexDirection?: FlexDirectionValue;
  flexBasis?: string;
  flexProp?: string;
  flexWrap?: FlexWrapValue;
  gridArea?: string;

  /** Alignment props */
  alignContent?: AlignValue;
  alignItems?: AlignValue;
  alignSelf?: AlignValue;
  justifyContent?: AlignValue;
  justifyItems?: AlignValue;
  justifySelf?: AlignValue;

  /** Spacing props */
  marginProp?: string;
  paddingProp?: string;
  gapProp?: string;

  /** Dimension props */
  widthProp?: string;
  heightProp?: string;

  /** Style props */
  backgroundProp?: string;
  borderProp?: string | BorderPropObject;
  overflowProp?: OverflowValue;
  textAlign?: TextAlignValue;

  /** React props */
  children?: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  onClick?: () => void;

  /** Accessibility props */
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
  "aria-expanded"?: AriaBoolean;
  "aria-hidden"?: AriaBoolean;
  "aria-controls"?: string;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-modal"?: AriaBoolean;

  /** Allow any data-* attributes */
  [key: `data-${string}`]: string | number | boolean;
};
