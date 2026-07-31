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

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import { Text } from "@docspace/ui-kit/components/text";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { InputBlock } from "@docspace/ui-kit/components/input-block";
import { toastr } from "@docspace/ui-kit/components/toast";

import styles from "./MetadataUrlField.module.scss";

const MetadataUrlField = ({
  labelText,
  name,
  placeholder,
  tooltipContent,
  tooltipClass,
  dataTestId,
}) => {
  const { t } = useTranslation("Translations");

  const onCopyClick = () => {
    copy(placeholder);
    toastr.success(t("Common:LinkCopySuccess"));
  };

  return (
    <div className={styles.styledWrapper}>
      <Text className={styles.label} fontSize="13px" as="div" fontWeight={600}>
        {labelText}
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={tooltipContent}
          className={tooltipClass}
          dataTestId={dataTestId ? `${dataTestId}_help_button` : undefined}
        />
      </Text>
      <InputBlock
        className={styles.input}
        iconButtonClassName={name}
        isDisabled
        name={name}
        placeholder={placeholder}
        iconName={CopyReactSvgUrl}
        iconSize={16}
        onIconClick={onCopyClick}
        testId={dataTestId ? `${dataTestId}_input` : undefined}
      />
    </div>
  );
};

export default observer(MetadataUrlField);
