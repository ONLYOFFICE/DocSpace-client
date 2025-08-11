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
import { useTranslation } from "react-i18next";

import { Text } from "../text";
import { HelpButton } from "../help-button";
import { FloatingButton, FloatingButtonIcons } from "../floating-button";

import styles from "./OperationsProgressButton.module.scss";

interface PreviewButtonProps {
  dropTargetFolderName: string | null;
  isDragging: boolean;
  allOperationsLength: boolean;
  setHideMainButton: (flag: boolean) => void;
  setShowSeveralOperationsIcon: (flag: boolean) => void;
  hasUploadOperationByDrag: () => boolean;
  clearDropPreviewLocation?: () => void;
}

const PreviewButton: React.FC<PreviewButtonProps> = ({
  dropTargetFolderName,
  isDragging,
  clearDropPreviewLocation,
  hasUploadOperationByDrag,
  setHideMainButton,
  allOperationsLength,
  setShowSeveralOperationsIcon,
}) => {
  const { t } = useTranslation("Common");

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [animationState, setAnimationState] = useState<
    "raising" | "dropping" | "hidingUnder"
  >("raising");
  const [lastKnownTitle, setLastKnownTitle] = useState<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewMainContainerRef = useRef<HTMLDivElement>(null);
  const previewHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previewFirstHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDropPreviewLocation = useRef<string | null>(null);
  const hadOperationsBeforeDrag = useRef<boolean>(false);
  const previewButtonWasVisible = useRef<boolean>(false);
  const shouldShowDotsAfterAnimation = useRef<boolean>(false);

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
    if (previewFirstHideTimerRef.current) {
      clearTimeout(previewFirstHideTimerRef.current);
      previewFirstHideTimerRef.current = null;
    }

    if (tooltipHideTimerRef.current) {
      clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = null;
    }

    if (!current && !prev) {
      if (isVisible) {
        setAnimationState("dropping");

        previewFirstHideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 300);
      }
      return;
    }

    if (current) {
      setLastKnownTitle(current);
    } else if (!current && lastKnownTitle) {
      tooltipHideTimerRef.current = setTimeout(() => {
        setLastKnownTitle(null);
      }, 100);
    }

    if (!isDragging) return;

    // Track if operations existed before dragging started
    if (!previewButtonWasVisible.current) {
      hadOperationsBeforeDrag.current = allOperationsLength;
      previewButtonWasVisible.current = true;
    }
    shouldShowDotsAfterAnimation.current = false;

    setIsVisible(true);
    // Reset animation state when dragging starts to interrupt any ongoing animations
    if (animationState === "hidingUnder" || animationState === "dropping") {
      setAnimationState("raising");
    }

    if (!prev && current) {
      setAnimationState("raising");
    }

    if (!current) {
      previewHideTimerRef.current = setTimeout(() => {
        if (!dropTargetFolderName) {
          setAnimationState("dropping");
          setTimeout(() => {
            setIsVisible(false);
          }, 300);
        }
      }, 200);
    }

    prevDropPreviewLocation.current = current;
  }, [
    isDragging,
    dropTargetFolderName,
    lastKnownTitle,
    allOperationsLength,
    isVisible,
    animationState,
  ]);

  useEffect(() => {
    if (isDragging) return;

    const shouldHideUnder = hasUploadOperationByDrag();
    const animationType = shouldHideUnder ? "hidingUnder" : "dropping";

    setAnimationState(animationType);

    if (previewButtonWasVisible.current) {
      // Dragging stopped
      const hadOperationsBefore = hadOperationsBeforeDrag.current;
      const hasUploadNow = shouldHideUnder;

      if (!hadOperationsBefore && hasUploadNow) {
        // If there were no operations before and upload operation appeared,
        // hide main button during PreviewButton transition
        // The button will be shown again

        setHideMainButton(true);
      } else if (hadOperationsBefore && hasUploadNow) {
        // If there were operations before and upload operation appeared,
        // delay showing several operations icon until PreviewButton animation completes
        shouldShowDotsAfterAnimation.current = true;
      }

      previewButtonWasVisible.current = false;
      hadOperationsBeforeDrag.current = false;
    }
  }, [isDragging, hasUploadOperationByDrag, setHideMainButton]);

  useEffect(() => {
    return () => {
      clearTimers();
      clearDropPreviewLocation?.();
    };
  }, [clearTimers, clearDropPreviewLocation]);

  const handlePreviewAnimationEnd = useCallback(
    (e: globalThis.AnimationEvent) => {
      const animation = e.animationName;

      if (animation.includes("dropPreviewButton") && !isDragging) {
        clearDropPreviewLocation?.();
        setIsVisible(false);
      }
    },
    [clearDropPreviewLocation, isDragging],
  );

  const onHideAnimationComplete = useCallback(() => {
    if (shouldShowDotsAfterAnimation.current) {
      setShowSeveralOperationsIcon(true);
      shouldShowDotsAfterAnimation.current = false;
    }
    setIsVisible(false);
    setHideMainButton(false);
    clearDropPreviewLocation?.();
  }, [
    clearDropPreviewLocation,
    setHideMainButton,
    setShowSeveralOperationsIcon,
  ]);

  const handlePreviewMainAnimationEnd = useCallback(
    (e: globalThis.AnimationEvent) => {
      const animation = e.animationName;
      const target = e.target as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;

      if (target !== currentTarget) {
        return;
      }

      if (
        (animation.includes("hideUnderProgressBar") ||
          animation.includes("hideUnderProgressBarMobile") ||
          animation.includes("hideUnderProgressBarTablet")) &&
        !isDragging
      ) {
        onHideAnimationComplete();
      }
    },
    [isDragging, onHideAnimationComplete],
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

  useEffect(() => {
    const previewContainer = previewMainContainerRef.current;

    if (!isVisible || !previewContainer) return;

    previewContainer.addEventListener(
      "animationend",
      handlePreviewMainAnimationEnd as EventListener,
    );

    return () => {
      previewContainer.removeEventListener(
        "animationend",
        handlePreviewMainAnimationEnd as EventListener,
      );
    };
  }, [handlePreviewMainAnimationEnd, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={classNames(styles.previewFloatingButtonContainer, {
        [styles.hidingUnder]: animationState === "hidingUnder",
      })}
      style={{ zIndex: "200" }}
      ref={previewMainContainerRef}
    >
      <HelpButton
        place="bottom"
        tooltipContent={
          animationState !== "hidingUnder" &&
          animationState !== "dropping" &&
          (dropTargetFolderName || lastKnownTitle) ? (
            <Text fontWeight={600} fontSize="14px">
              {t("Common:DropToLocation", {
                folderName: dropTargetFolderName || lastKnownTitle,
              })}
            </Text>
          ) : null
        }
        isOpen
        noUserSelect
        isClickable={false}
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
