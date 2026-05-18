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
