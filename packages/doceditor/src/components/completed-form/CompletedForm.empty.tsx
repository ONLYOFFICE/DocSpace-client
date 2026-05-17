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

import Image from "next/image";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import CompletedFormDarkIcon from "PUBLIC_DIR/images/completedForm/completed.form.icon.dark.svg?url";
import CompletedFormLightIcon from "PUBLIC_DIR/images/completedForm/completed.form.icon.light.svg?url";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getBgPattern, getLogoUrl } from "@docspace/shared/utils/common";
import { mobile, mobileMore } from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { Text } from "@docspace/ui-kit/components/text";

import styles from "./completed-form.module.scss";

export const CompletedFormEmpty = () => {
  const { isBase, currentColorScheme } = useTheme();
  const { t } = useTranslation(["CompletedForm"]);

  const bgPattern = getBgPattern(currentColorScheme?.id);

  const logoUrl = getLogoUrl(WhiteLabelLogoType.LoginPage, !isBase);
  const smallLogoUrl = getLogoUrl(WhiteLabelLogoType.LightSmall, !isBase);

  const iconUrl = isBase ? CompletedFormLightIcon : CompletedFormDarkIcon;

  const bgBlockStyle = {
    "--bg-pattern": bgPattern,
  } as React.CSSProperties;

  return (
    <section
      className={styles.container}
      style={bgBlockStyle}
      data-testid="completed_form_empty_container"
    >
      <div
        className={classNames(
          styles.completedFormLayout,
          "completed-form__default-layout",
        )}
      >
        <picture className="completed-form__logo">
          <source media={mobile} srcSet={smallLogoUrl} />
          <source media={mobileMore} srcSet={logoUrl} />
          <img src={logoUrl} alt="logo" />
        </picture>
        <Image
          priority
          src={iconUrl}
          className="completed-form__icon"
          alt="icon"
          width={416}
          height={200}
        />
        <section
          className={classNames(styles.textWrapper, "completed-form__empty")}
        >
          <Heading level={HeadingLevel.h1}>{t("CompletedForm:CompletedFormTitle")}</Heading>
          <Text>{t("CompletedForm:CompletedFormDescription")}</Text>
        </section>
      </div>
    </section>
  );
};
