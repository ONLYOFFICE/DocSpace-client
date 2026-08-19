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

import React from "react";
import { Portal } from "@docspace/ui-kit/components/portal";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { AvatarSize } from "@docspace/ui-kit/components/avatar";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";

import { EditorsList } from "./EditorsList";
import type { EditorsTooltipMobileProps } from "../EditorsTooltip.types";
import styles from "../EditorsTooltip.module.scss";

const EditorsTooltipMobile = ({
  visible,
  editors,
  onClose,
  t,
  height,
}: EditorsTooltipMobileProps) => {
  if (!visible || editors.length === 0) return null;

  const content = (
    <>
      <Backdrop
        visible={visible}
        onClick={onClose}
        withBackground
        zIndex={310}
      />
      <div
        className={styles.mobileContainer}
        style={{ height: `${height}px` }}
        data-testid="editors-tooltip-mobile"
        onClick={(e) => e.stopPropagation()}
      >
        <Scrollbar autoHide={false}>
          <div className={styles.tooltipHeader}>
            {t("Common:FileCurrentlyEditedBy")}
          </div>
          <EditorsList
            editors={editors}
            avatarSize={AvatarSize.min}
            isMobile={true}
          />
        </Scrollbar>
      </div>
    </>
  );

  return (
    <>
      <Portal element={content} visible={visible} />
    </>
  );
};

export default EditorsTooltipMobile;
