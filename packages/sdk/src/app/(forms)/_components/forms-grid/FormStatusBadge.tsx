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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@docspace/ui-kit/components/badge";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { FileFillingFormStatus } from "@docspace/shared/enums";
import { FILLING_FORM_STATUS_COLORS } from "@docspace/shared/constants";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import {
  getFillingStatusLabel,
  getFillingStatusTitle,
} from "@docspace/shared/utils";
import type { TFile } from "@docspace/shared/api/files/types";
import FormFillIcon from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import PencilIcon from "PUBLIC_DIR/images/pencil.react.svg?url";

type FormStatusBadgeProps = {
  file: TFile;
};

const FormStatusBadge = ({ file }: FormStatusBadgeProps) => {
  const { t } = useTranslation(["Common"]);

  if (file.isFillingPreparing) {
    return (
      <div className="badges">
        <Badge
          noHover
          isVersionBadge
          backgroundColor={globalColors.gray}
          color={globalColors.white}
          label={t("Common:Preparing")}
          title={t("Common:Preparing")}
          borderRadius="50px"
          fontSize="9px"
          fontWeight={800}
          maxWidth="max-content"
        />
      </div>
    );
  }

  if (file.formFillingStatus && !file.isFillingPreparing) {
    const label = getFillingStatusLabel(file.formFillingStatus, t);
    const title = getFillingStatusTitle(file.formFillingStatus, t);
    const color = FILLING_FORM_STATUS_COLORS[file.formFillingStatus];

    return (
      <div className="badges">
        <Badge
          noHover
          isVersionBadge
          backgroundColor={color}
          label={label}
          title={title}
        />
      </div>
    );
  }

  if (file.startFilling) {
    return (
      <div className="badges">
        <div className="badge">
          <IconButton
            size={16}
            iconName={FormFillIcon}
            title={t("Common:ReadyToFillOut")}
            color="accent"
            hoverColor="accent"
            isClickable={false}
          />
        </div>
      </div>
    );
  }

  if (!file.startFilling && file.security?.Edit && file.isForm) {
    return (
      <div className="badges">
        <div className="badge">
          <IconButton
            size={16}
            iconName={PencilIcon}
            title={t("Common:EditButton")}
            isClickable={false}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default React.memo(FormStatusBadge);
