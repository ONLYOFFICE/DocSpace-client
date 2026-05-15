/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Portal } from "@docspace/ui-kit/components/portal";

import { Guid } from "./sub-components/Guid";
import {
  GuidanceStep,
  GuidanceRefKey,
  GuidanceProps,
  ClippedPosition,
} from "./sub-components/Guid.types";
import { getGuidPosition } from "./sub-components/Guid.utils";
import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";

const Guidance = ({
  viewAs,
  onClose,
  getRefElement,
  config,
}: GuidanceProps) => {
  const [sectionWidth, setSectionWidth] = useState<number>(0);
  const [positions, setPositions] = useState<ClippedPosition[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentGuidance, setCurrentGuidance] = useState<GuidanceStep | null>(
    null,
  );

  const { t } = useTranslation(["FormFillingTipsDialog", "Common"]);
  const { isRTL } = useInterfaceDirection();

  useEffect(() => {
    const updatePositions = () => {
      if (!currentGuidance?.position) return;

      const calculatePositions = () => {
        const newPositions: ClippedPosition[] = currentGuidance.position
          .map((pos) => {
            const element = getRefElement(pos.refKey as GuidanceRefKey);

            if (!element) return null;

            const clientRects = element.getClientRects?.();
            if (!clientRects || clientRects.length === 0) return null;

            return getGuidPosition(
              {
                ...pos,
                rects: clientRects[0],
              },
              viewAs,
              isRTL,
            );
          })
          .filter((pos): pos is ClippedPosition => pos !== null);

        setPositions(newPositions);

        const section = document.getElementById("section");
        if (section) {
          setSectionWidth(section.clientWidth);
        }
      };

      const timeoutId = setTimeout(calculatePositions, 0);

      return () => clearTimeout(timeoutId);
    };

    updatePositions();
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("resize", updatePositions);
    };
  }, [currentGuidance, viewAs, isRTL, getRefElement]);

  const isStepValid = useCallback(
    (stepIndex: number) => {
      const stepConfig = config[stepIndex];
      if (!stepConfig) return false;

      return (
        !stepConfig.position ||
        stepConfig.position.some((pos) => {
          const element = getRefElement(pos.refKey as GuidanceRefKey);
          if (!element) return false;

          const clientRects = element.getClientRects?.();
          if (!clientRects || clientRects.length === 0) return false;

          return clientRects[0].width > 0;
        })
      );
    },
    [config, getRefElement],
  );

  const handleNext = () => {
    if (currentStepIndex < config.length - 1) {
      let nextStepIndex = currentStepIndex + 1;
      while (nextStepIndex < config.length && !isStepValid(nextStepIndex)) {
        console.warn(`Skipping step ${nextStepIndex} - no valid elements`);
        nextStepIndex += 1;
      }

      if (nextStepIndex < config.length) {
        setCurrentStepIndex(nextStepIndex);
      } else {
        onClose?.();
      }
    } else {
      onClose?.();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      let prevStepIndex = currentStepIndex - 1;
      while (prevStepIndex >= 0 && !isStepValid(prevStepIndex)) {
        console.warn(`Skipping step ${prevStepIndex} - no valid elements`);
        prevStepIndex -= 1;
      }

      if (prevStepIndex >= 0) {
        setCurrentStepIndex(prevStepIndex);
      }
    }
  };

  useEffect(() => {
    const currentConfig = config[currentStepIndex];
    if (currentConfig) {
      setCurrentGuidance(currentConfig);
    } else {
      setCurrentGuidance(null);
    }
  }, [currentStepIndex, config]);

  if (!currentGuidance || !config.length) return null;

  const hasValidPositions = positions.some(
    (pos) => pos.height !== 0 && pos.top !== 0,
  );

  if (!hasValidPositions) return null;

  return (
    <Portal
      element={
        <Guid
          viewAs={viewAs}
          currentGuidance={currentGuidance}
          positions={positions}
          sectionWidth={sectionWidth}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={onClose}
          currentStep={currentStepIndex}
          totalSteps={config.length}
          isRTL={isRTL}
          guidanceConfig={config}
          t={t}
        />
      }
    />
  );
};

export { Guidance };
