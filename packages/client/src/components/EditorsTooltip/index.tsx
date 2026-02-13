// (c) Copyright Ascensio System SIA 2009-2026
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

import React, { useMemo, useId } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { IconButton } from "@docspace/shared/components/icon-button";
import { AvatarSize } from "@docspace/shared/components/avatar";
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
