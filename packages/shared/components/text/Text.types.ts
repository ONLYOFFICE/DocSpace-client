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

export type TextProps = {
  /** Ref to access the DOM element or React component instance */
  ref?: React.RefObject<HTMLDivElement | null>;
  /** Sets the tag through which the component is rendered */
  as?: React.ElementType;
  /** Accepts the tag id */
  tag?: string;
  /** Sets background color */
  backgroundColor?: string;
  /** Specifies the text color */
  color?: string;
  /** Sets the 'display' property */
  display?: string;
  /** Sets the font size */
  fontSize?: string;
  /** Sets the font weight */
  fontWeight?: number | string;
  /** Sets font weight value to bold */
  isBold?: boolean;
  /** Sets the 'display: inline-block' property */
  isInline?: boolean;
  /** Sets the font style to italic */
  isItalic?: boolean;
  /** Sets the line height */
  lineHeight?: string;
  /** Disables text selection */
  noSelect?: boolean;
  /** Sets the 'text-align' property */
  textAlign?: "left" | "center" | "right" | "justify";
  /** Title attribute for hover tooltip */
  title?: string;
  /** Sets the class name */
  className?: string;
  /** Disables word wrapping */
  truncate?: boolean;
  /** HTML id attribute */
  id?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Text direction */
  dir?: "ltr" | "rtl" | "auto";
  /** Child elements */
  children?: React.ReactNode;
  /** Click event handler */
  onClick?: (e: React.MouseEvent<Element>) => void;
  /** For label association */
  htmlFor?: string;
  /** Visual style variant */
  view?: string;
  /** Link href */
  href?: string;
  /** Used as HTML `rel` property */
  rel?: string;
  /** Used as HTML `tabindex` property */
  tabIndex?: number;
  /** Used in container component */
  containerWidth?: string;
  /** Used in container component */
  containerMinWidth?: string;
  /** Test id */
  dataTestId?: string;
};

export type StyledTextProps = {
  /** Font size property */
  fontSizeProp?: string;
  /** Font weight property */
  fontWeightProp?: string | number;
  /** Text color property */
  colorProp?: string;
  /** Text alignment */
  textAlign?: string;
  /** Visual style variant */
  view?: string;
  /** Background color */
  backgroundColor?: string;
  /** Inline display mode */
  isInline?: boolean;
  /** Line height */
  lineHeight?: string;
  /** Disable text selection */
  noSelect?: boolean;
  /** Italic style */
  isItalic?: boolean;
  /** Bold style */
  isBold?: boolean;
  /** Truncate text */
  truncate?: boolean;
};
