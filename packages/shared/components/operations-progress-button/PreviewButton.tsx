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

import React, { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames";

import { Text } from "../text";
import { HelpButton } from "../help-button";
import { FloatingButton, FloatingButtonIcons } from "../floating-button";

import styles from "./OperationsProgressButton.module.scss";

interface PreviewButtonProps {
  dropTargetFolderName: string | null;
  isDragging: boolean;
  clearDropPreviewLocation?: () => void;
}

const PreviewButton: React.FC<PreviewButtonProps> = ({
  dropTargetFolderName,
  isDragging,
  clearDropPreviewLocation,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [animationState, setAnimationState] = useState<
    "idle" | "raising" | "dropping"
  >("raising");
  const [lastKnownTitle, setLastKnownTitle] = useState<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDropPreviewLocation = useRef(dropTargetFolderName);

  const clearTimers = useCallback(() => {
    if (previewHideTimerRef.current) {
      clearTimeout(previewHideTimerRef.current);
      previewHideTimerRef.current = null;
    }
    if (tooltipHideTimerRef.current) {
      clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const prev = prevDropPreviewLocation.current;
    const current = dropTargetFolderName;

    if (previewHideTimerRef.current) {
      clearTimeout(previewHideTimerRef.current);
      previewHideTimerRef.current = null;
    }
    if (tooltipHideTimerRef.current) {
      clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = null;
    }

    if (current) {
      setLastKnownTitle(current);
    } else if (!current && lastKnownTitle) {
      tooltipHideTimerRef.current = setTimeout(() => {
        setLastKnownTitle(null);
      }, 100);
    }

    if (isDragging) {
      setIsVisible(true);

      if (!prev && current) {
        setAnimationState("raising");
      }

      if (!current) {
        previewHideTimerRef.current = setTimeout(() => {
          if (!dropTargetFolderName) {
            setAnimationState("dropping");
            setTimeout(() => {
              setIsVisible(false);
              setAnimationState("idle");
            }, 300);
          }
        }, 200);
      }
    } else {
      setAnimationState("dropping");
      previewHideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setAnimationState("idle");
      }, 300);
    }

    prevDropPreviewLocation.current = current;
  }, [isDragging, dropTargetFolderName, lastKnownTitle]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const handlePreviewAnimationEnd = useCallback(
    (e: globalThis.AnimationEvent) => {
      const animation = e.animationName;

      if (animation.includes("dropPreviewButton") && !isDragging) {
        clearDropPreviewLocation?.();
      }
    },
    [clearDropPreviewLocation, isDragging],
  );

  useEffect(() => {
    const previewContainer = previewContainerRef.current;

    if (!isVisible || !previewContainer) return;

    previewContainer.addEventListener(
      "animationend",
      handlePreviewAnimationEnd as EventListener,
    );

    return () => {
      previewContainer.removeEventListener(
        "animationend",
        handlePreviewAnimationEnd as EventListener,
      );
    };
  }, [handlePreviewAnimationEnd, isVisible]);

  // console.log("PreviewButton isVisible:", isVisible);
  // console.log("PreviewButton dropTargetFolderName:", dropTargetFolderName);
  // console.log("PreviewButton lastKnownTitle:", lastKnownTitle);

  if (!isVisible) return null;

  return (
    <div
      className={styles.previewFloatingButtonContainer}
      style={{ zIndex: "200" }}
    >
      <HelpButton
        place="bottom"
        tooltipContent={
          dropTargetFolderName || lastKnownTitle ? (
            <Text fontWeight={600}>
              {`Moved to: ${dropTargetFolderName || lastKnownTitle}`}
            </Text>
          ) : null
        }
        isOpen
        noUserSelect
      >
        <FloatingButton
          ref={previewContainerRef}
          className={classNames(styles.previewFloatingButton, {
            [styles.raising]: animationState === "raising",
            [styles.dropping]: animationState === "dropping",
          })}
          icon={FloatingButtonIcons.upload}
          withoutProgress
        />
      </HelpButton>
    </div>
  );
};

export default PreviewButton;
