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

export enum GuidanceElementType {
  Content = "content", // Regular content element
  Expandable = "expandable", // Element that can expand
  Mixed = "mixed",
}

export enum GuidanceRefKey {
  Pdf = "pdf",
  Ready = "ready",
  Share = "share",
  Uploading = "uploading",
  MainButton = "mainButton",
}

export type GuidancePlacement = "side" | "bottom" | "dynamic";

export interface GuidancePosition {
  type: GuidanceElementType;
  placement?: GuidancePlacement;
  refKey?: GuidanceRefKey;
  size?: number;
  offset?: {
    value?: number;
    row?: number;
    rtl?: number;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
  };
  smallBorder?: boolean;
  rects?: DOMRect;
}

export interface GuidanceStep {
  id: number;
  header: string;
  description: string;
  key: string;
  placement: GuidancePlacement;
  position: GuidancePosition[];
}

export interface ClippedPosition {
  width: number;
  height: number;
  left: number;
  top: number;
  bottom: number;
  right: number;
}

export interface GuidanceProps {
  viewAs: string;
  onClose: () => void;
  getRefElement: (key: GuidanceRefKey) => HTMLElement | null;
  config: GuidanceStep[];
}

export interface GuidProps {
  guidanceConfig: GuidanceStep[];
  currentGuidance: GuidanceStep;
  positions: ClippedPosition[];
  sectionWidth: number;
  currentStep: number;
  totalSteps: number;
  isRTL: boolean;
  viewAs: string;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  t: (key: string) => string;
}
