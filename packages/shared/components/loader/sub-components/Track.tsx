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

import React from "react";
import styled from "styled-components";

import { useId } from "../../../utils";

import { BaseLoaderProps } from "../Loader.types";

const StyledTrack = styled.svg<BaseLoaderProps>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  color: ${({ color }) => color || "currentColor"};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  transition: opacity 0.3s ease;
`;

const ANIMATION_DURATION = "1300ms";
const STROKE_WIDTH = "40";
const SCALE = "0.75";
const VIEW_BOX = "-10 -10 220 220";

interface GradientConfig {
  id: number;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  startOpacity: number;
  endOpacity: number;
  path: string;
}

const gradientConfigs: GradientConfig[] = [
  {
    id: 1,
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1",
    startOpacity: 0,
    endOpacity: 0.2,
    path: "M 0,-100 A 100,100 0 0,1 86.6,-50",
  },
  {
    id: 2,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1",
    startOpacity: 0.2,
    endOpacity: 0.4,
    path: "M 86.6,-50 A 100,100 0 0,1 86.6,50",
  },
  {
    id: 3,
    x1: "1",
    y1: "0",
    x2: "0",
    y2: "1",
    startOpacity: 0.4,
    endOpacity: 0.6,
    path: "M 86.6,50 A 100,100 0 0,1 0,100",
  },
  {
    id: 4,
    x1: "1",
    y1: "1",
    x2: "0",
    y2: "0",
    startOpacity: 0.6,
    endOpacity: 0.8,
    path: "M 0,100 A 100,100 0 0,1 -86.6,50",
  },
  {
    id: 5,
    x1: "0",
    y1: "1",
    x2: "0",
    y2: "0",
    startOpacity: 0.8,
    endOpacity: 1,
    path: "M -86.6,50 A 100,100 0 0,1 -86.6,-50",
  },
  {
    id: 6,
    x1: "0",
    y1: "1",
    x2: "1",
    y2: "0",
    startOpacity: 1,
    endOpacity: 1,
    path: "M -86.6,-50 A 100,100 0 0,1 0,-100",
  },
];

const AnimatedPath: React.FC<{ d: string; gradientId: string }> = ({
  d,
  gradientId,
}) => (
  <path d={d} stroke={gradientId}>
    <animateTransform
      from="0 0 0"
      to="360 0 0"
      attributeName="transform"
      type="rotate"
      repeatCount="indefinite"
      dur={ANIMATION_DURATION}
    />
  </path>
);

export const Track = React.forwardRef<SVGSVGElement, BaseLoaderProps>(
  ({ size, color = "", label, primary, isDisabled = false }, ref) => {
    const id = useId();

    return (
      <StyledTrack
        ref={ref}
        viewBox={VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
        size={size}
        color={color}
        primary={primary}
        isDisabled={isDisabled}
        role="status"
        aria-busy="true"
        aria-label={label}
        data-primary={primary ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
      >
        <defs>
          {gradientConfigs.map(
            ({ id: gradientId, x1, y1, x2, y2, startOpacity, endOpacity }) => (
              <linearGradient
                key={gradientId}
                id={`spinner-color-${id}-${gradientId}`}
                gradientUnits="objectBoundingBox"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              >
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  stopOpacity={startOpacity}
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity={endOpacity}
                />
              </linearGradient>
            ),
          )}
        </defs>
        <g
          fill="none"
          strokeWidth={STROKE_WIDTH}
          transform={`translate(100,100) scale(${SCALE})`}
        >
          {gradientConfigs.map(({ id: gradientId, path }) => (
            <AnimatedPath
              key={gradientId}
              d={path}
              gradientId={`url(#spinner-color-${id}-${gradientId})`}
            />
          ))}
        </g>
      </StyledTrack>
    );
  },
);

Track.displayName = "Track";
