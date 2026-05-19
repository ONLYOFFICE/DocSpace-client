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

import React, { useMemo, useId } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { AvatarSize } from "@docspace/ui-kit/components/avatar";
import { classNames, isMobile as isMobileUtils } from "@docspace/shared/utils";

import FileActionsConvertEditDocReactSvg from "PUBLIC_DIR/images/file.actions.convert.edit.doc.react.svg";

import { useEditorsData } from "./hooks/useEditorsData";
import {
  calculateTooltipDimensions,
  calculateMobileTooltipHeight,
} from "./utils/tooltipCalculations";
import { EditorsList } from "./sub-components/EditorsList";
import EditorsTooltipMobile from "./sub-components/EditorsTooltipMobile";

import styles from "./EditorsTooltip.module.scss";
import badgesStyles from "@docspace/shared/components/badges/Badges.module.scss";
import type { EditorsTooltipProps } from "./EditorsTooltip.types";

const EditorsTooltip = ({ item, currentUserId }: EditorsTooltipProps) => {
  const { editingBy, activeEditors } = item;
  const isMobile = isMobileUtils();
  const { t } = useTranslation("Common");

  const uniqueId = useId();
  const tooltipId = `editors-tooltip-${uniqueId}`;

  const { editors, isOpen, openTooltip, closeTooltip } = useEditorsData({
    activeEditors,
    editingBy,
    currentUserId,
  });

  const tooltipDimensions = useMemo(
    () => calculateTooltipDimensions(editors),
    [editors],
  );

  const mobileTooltipHeight = useMemo(
    () => calculateMobileTooltipHeight(editors),
    [editors],
  );

  const iconEdit = <FileActionsConvertEditDocReactSvg />;

  const handleIconClick = () => {
    if (isMobile) {
      openTooltip();
    }
  };

  const renderTooltipContent = () => {
    if (editors.length === 0) return null;

    return (
      <div
        data-testid="editors-tooltip"
        style={{
          width: `${tooltipDimensions.width}px`,
          height: `${tooltipDimensions.height}px`,
          minWidth: "200px",
        }}
      >
        <Scrollbar autoHide={false}>
          <div className={styles.tooltipHeader}>
            {t("FileCurrentlyEditedBy")}
          </div>
          <EditorsList editors={editors} avatarSize={AvatarSize.extraSmall} />
        </Scrollbar>
      </div>
    );
  };

  return (
    <>
      <IconButton
        data-tooltip-id={tooltipId}
        iconNode={iconEdit}
        className={classNames(
          badgesStyles.iconBadge,
          "badge icons-group is-editing tablet-badge tablet-edit",
        )}
        color="accent"
        hoverColor="accent"
        onClick={handleIconClick}
      />
      {isMobile ? (
        <EditorsTooltipMobile
          editors={editors}
          visible={isOpen}
          onClose={closeTooltip}
          t={t}
          height={mobileTooltipHeight}
        />
      ) : (
        <Tooltip
          tooltipStyle={{
            padding: "12px",
            paddingInlineEnd: "0px",
            maxWidth: "fit-content",
          }}
          id={tooltipId}
          getContent={renderTooltipContent}
          place="bottom-start"
          offset={10}
          clickable
          afterShow={openTooltip}
          afterHide={closeTooltip}
        />
      )}
    </>
  );
};

export default EditorsTooltip;
