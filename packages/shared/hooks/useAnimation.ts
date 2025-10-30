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

import { useState, useEffect, useRef } from "react";

export const AnimationEvents = {
  END_ANIMATION: "ANIMATION_END",
  ANIMATION_STARTED: "ANIMATION_STARTED",
  ANIMATION_ENDED: "ANIMATION_ENDED",
  Forced_Animation: "FORCED_ANIMATION",
};

export type UseAnimationReturn = {
  animationPhase: "none" | "start" | "progress" | "finish";
  isAnimationReady: boolean;
  animationElementRef: React.RefObject<HTMLDivElement | null>;
  parentElementRef: React.RefObject<HTMLDivElement | null>;
  endWidth: number;
  triggerAnimation: () => void;
};

export const useAnimation = (isActive: boolean): UseAnimationReturn => {
  // Animation state management
  const [animationPhase, setAnimationPhase] = useState<
    "none" | "start" | "progress" | "finish"
  >("none");
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [endWidth, setEndWidth] = useState(90);

  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const animationElementRef = useRef<HTMLDivElement>(null);
  const parentElementRef = useRef<HTMLDivElement>(null);

  // Function to start animation (CSS-based)
  const startAnimation = () => {
    window.dispatchEvent(new CustomEvent(AnimationEvents.ANIMATION_STARTED));

    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    // Start the animation sequence
    setIsAnimationReady(false);
    setAnimationPhase("progress");

    // CSS animation will handle the progress from 10% to 90%
    // No JavaScript interval needed
  };

  // Function to trigger animation with ready state
  const triggerAnimation = () => {
    // First show empty state
    setIsAnimationReady(true);
    // Start animation after a brief delay to show the empty state
    startAnimation();
  };

  // Handle active state changes
  useEffect(() => {
    if (!isActive) {
      // Reset everything when item becomes inactive
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setAnimationPhase("none");
      setIsAnimationReady(false);
    }
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

  // Event listener for ending animation
  useEffect(() => {
    const onEndAnimation = () => {
      if (animationPhase === "progress") {
        // Clear the interval
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }

        if (
          animationElementRef.current?.offsetWidth &&
          parentElementRef.current?.offsetWidth
        ) {
          setEndWidth(
            (animationElementRef.current.offsetWidth /
              parentElementRef.current.offsetWidth) *
              100,
          );
        }
        // Set to finish phase and complete the animation
        setAnimationPhase("finish");
        // Reset after a brief moment
        setTimeout(() => {
          setAnimationPhase("none");
          setIsAnimationReady(false);
          window.dispatchEvent(
            new CustomEvent(AnimationEvents.ANIMATION_ENDED),
          );
        }, 400);
      }
    };

    window.addEventListener(AnimationEvents.END_ANIMATION, onEndAnimation);

    return () => {
      window.removeEventListener(AnimationEvents.END_ANIMATION, onEndAnimation);
    };
  }, [animationPhase]);

  return {
    animationPhase,
    isAnimationReady,
    animationElementRef,
    parentElementRef,
    endWidth,
    triggerAnimation,
  };
};
