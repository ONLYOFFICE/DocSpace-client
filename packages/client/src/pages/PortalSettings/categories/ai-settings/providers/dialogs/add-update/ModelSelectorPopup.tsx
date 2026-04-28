/*
 * (c) Copyright Ascensio System SIA 2009-2026
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { isMobileDevice } from "@docspace/shared/utils";
import { getBrandName } from "@docspace/shared/constants/brands";

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";

import type { TProviderModelInfo } from "@docspace/shared/api/ai/types";

import styles from "./ModelSelectorPopup.module.scss";

const ROW_HEIGHT = 30;
const ROW_GAP = 2;
const SECTION_HEADER_HEIGHT = 36;
const POPUP_PADDING = 24;
const BOTTOM_SPACE = 88;
const MIN_BELOW_SPACE = 170;

type ModelSelectorPopupProps = {
  anchor: React.RefObject<HTMLDivElement | null>;
  recommended: TProviderModelInfo[];
  other: TProviderModelInfo[];
  selectedModelIds: Set<string>;
  isCustomProvider: boolean;
  isSettingsOpen: boolean;
  onToggle: (modelId: string) => void;
  onEditModel: (modelId: string) => void;
  onClose: () => void;
};

type ModelRowProps = {
  model: TProviderModelInfo;
  isSelected: boolean;
  showPencil: boolean;
  onToggle: (modelId: string) => void;
  onEdit: (modelId: string) => void;
};

const ModelRow = memo(
  ({ model, isSelected, showPencil, onToggle, onEdit }: ModelRowProps) => {
    return (
      <div
        className={styles.modelRow}
        onClick={() => onToggle(model.modelId)}
        data-testid={`model-row-${model.modelId}`}
      >
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox
            isChecked={isSelected}
            onChange={() => onToggle(model.modelId)}
          />
        </span>
        <span className={styles.modelLabel}>{model.displayName}</span>
        {showPencil ? (
          <IconButton
            className={styles.pencilIcon}
            iconName={AccessEditReactSvgUrl}
            size={16}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(model.modelId);
            }}
            dataTestId={`edit-model-${model.modelId}`}
          />
        ) : null}
      </div>
    );
  },
);

ModelRow.displayName = "ModelRow";

const calcContentHeight = (
  recommended: TProviderModelInfo[],
  other: TProviderModelInfo[],
  isCustomProvider: boolean,
): number => {
  if (isCustomProvider) {
    const totalModels = recommended.length + other.length;
    const gaps = totalModels > 1 ? (totalModels - 1) * ROW_GAP : 0;
    return totalModels * ROW_HEIGHT + gaps;
  }

  let height = 0;

  if (recommended.length > 0) {
    const gaps =
      recommended.length > 1 ? (recommended.length - 1) * ROW_GAP : 0;
    height += SECTION_HEADER_HEIGHT + recommended.length * ROW_HEIGHT + gaps;
  }

  if (other.length > 0) {
    const gaps = other.length > 1 ? (other.length - 1) * ROW_GAP : 0;
    height += SECTION_HEADER_HEIGHT + other.length * ROW_HEIGHT + gaps;
  }

  return height;
};

export const ModelSelectorPopup = ({
  anchor,
  recommended,
  other,
  selectedModelIds,
  isCustomProvider,
  isSettingsOpen,
  onToggle,
  onEditModel,
  onClose,
}: ModelSelectorPopupProps) => {
  const { t } = useTranslation(["AISettings", "Common"]);
  const isMobileHardware = isMobileDevice();

  const [windowSize, setWindowSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const handler = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isLandscape = windowSize.width > windowSize.height;
  const isMobilePortrait = isMobileHardware && !isLandscape;
  const isMobileLandscape = isMobileHardware && isLandscape;
  const isDesktop = !isMobileHardware;

  const desktopDirectionY = useMemo<"top" | "bottom">(() => {
    if (!isDesktop) return "bottom";
    const rect = anchor.current?.getBoundingClientRect();
    if (!rect) return "bottom";
    const availableBelow = windowSize.height - rect.bottom - BOTTOM_SPACE;
    return availableBelow < MIN_BELOW_SPACE ? "top" : "bottom";
  }, [isDesktop, anchor, windowSize]);

  useEffect(() => {
    if (isMobilePortrait || isSettingsOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-testid="model-selector-popup"]')) return;
      const addButton = anchor.current?.querySelector(
        '[data-testid="add-model-button"]',
      );
      if (addButton?.contains(target)) return;
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchor, isMobilePortrait, isSettingsOpen]);

  const scrollHeight = useMemo(
    () => calcContentHeight(recommended, other, isCustomProvider),
    [recommended, other, isCustomProvider],
  );

  const backdrop = isMobileHardware ? (
    <Backdrop
      visible
      withBackground
      shouldShowBackdrop
      onClick={onClose}
      zIndex={449}
    />
  ) : null;

  const mobilePortraitScrollMax = windowSize.height - 64 - POPUP_PADDING;

  const modelContent = isCustomProvider ? (
    <>
      <div className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>
          {t("AISettings:SelectModels")}
        </Text>
      </div>
      {[...recommended, ...other].map((model) => (
        <ModelRow
          key={model.modelId}
          model={model}
          isSelected={selectedModelIds.has(model.modelId)}
          showPencil
          onToggle={onToggle}
          onEdit={onEditModel}
        />
      ))}
    </>
  ) : (
    <>
      {recommended.length > 0 ? (
        <>
          <div className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              {t("AISettings:RecommendedModels")}
            </Text>
            <HelpButton
              tooltipContent={t("AISettings:RecommendedModelsTooltip", {
                productName: getBrandName("ProductName"),
              })}
              place="bottom"
              size={12}
            />
          </div>
          {recommended.map((model) => (
            <ModelRow
              key={model.modelId}
              model={model}
              isSelected={selectedModelIds.has(model.modelId)}
              showPencil={false}
              onToggle={onToggle}
              onEdit={onEditModel}
            />
          ))}
        </>
      ) : null}
      {other.length > 0 ? (
        <>
          <div
            className={classNames(
              styles.sectionHeader,
              styles.sectionHeaderOther,
            )}
          >
            <Text className={styles.sectionTitle}>
              {t("AISettings:OtherModels")}
            </Text>
            <HelpButton
              tooltipContent={t("AISettings:OtherModelsTooltip")}
              place="bottom"
              size={12}
            />
          </div>
          {other.map((model) => (
            <ModelRow
              key={model.modelId}
              model={model}
              isSelected={selectedModelIds.has(model.modelId)}
              showPencil
              onToggle={onToggle}
              onEdit={onEditModel}
            />
          ))}
        </>
      ) : null}
    </>
  );

  // Mobile portrait: own Scrollbar (DropDown's withDynamicScrollbar is off, fixedDirection skips height calc)
  // Desktop/landscape: flat content, DropDown's withDynamicScrollbar handles scroll
  const children = isMobilePortrait ? (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Scrollbar
        style={{
          height: Math.min(scrollHeight, mobilePortraitScrollMax),
        }}
      >
        <div className={styles.mobileScrollContent}>{modelContent}</div>
      </Scrollbar>
    </div>
  ) : (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {modelContent}
    </div>
  );

  return (
    <DropDown
      open
      isDefaultMode
      forwardedRef={anchor}
      directionY={isMobileLandscape ? "both" : desktopDirectionY}
      directionX="right"
      fixedDirection={isMobilePortrait}
      isMobileView={isMobilePortrait}
      withBackdrop={false}
      backDrop={backdrop}
      zIndex={450}
      className={classNames(styles.popup, {
        [styles.mobileView]: isMobilePortrait,
        [styles.popupTop]: !isMobilePortrait && desktopDirectionY === "top",
      })}
      withDynamicScrollbar={!isMobilePortrait}
      bottomSpace={BOTTOM_SPACE}
      topSpace={16}
      useFlexibleHeight
      dataTestId="model-selector-popup"
    >
      {children}
    </DropDown>
  );
};

