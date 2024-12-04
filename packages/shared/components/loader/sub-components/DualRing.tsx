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

/* eslint-disable react/no-unknown-property */
import React from "react";
import { StyledDualRing } from "../Loader.styled";
import { BaseLoaderProps } from "../Loader.types";

export const DualRing = React.forwardRef<SVGSVGElement, BaseLoaderProps>(
  ({ size = "40px", color, label, primary, isDisabled, ...rest }, ref) => (
    <StyledDualRing
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
      data-primary={primary ? "true" : undefined}
      data-disabled={isDisabled ? "true" : undefined}
      role="status"
      aria-label={label}
      aria-busy="true"
      {...rest}
    >
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        strokeLinecap="round"
        strokeWidth="8"
        stroke={color}
        strokeDasharray="62.83185307179586 62.83185307179586"
        transform="rotate(32.3864 50 50)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          calcMode="linear"
          values="0 50 50;360 50 50"
          keyTimes="0;1"
          dur="1.1s"
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="none"
        strokeLinecap="round"
        strokeWidth="4"
        stroke={color}
        strokeDasharray="29.845130209103033 29.845130209103033"
        strokeDashoffset="29.845130209103033"
        transform="rotate(-360 -8.10878e-8 -8.10878e-8)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          calcMode="linear"
          values="0 50 50;-360 50 50"
          keyTimes="0;1"
          dur="1.1s"
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>
    </StyledDualRing>
  ),
);

DualRing.displayName = "DualRing";
