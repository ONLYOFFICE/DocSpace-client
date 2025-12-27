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

"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import CompletedFormDarkIcon from "PUBLIC_DIR/images/completedForm/completed.form.icon.dark.svg?url";
import CompletedFormLightIcon from "PUBLIC_DIR/images/completedForm/completed.form.icon.light.svg?url";

import { useTheme } from "@docspace/shared/hooks/useTheme";
import { getBgPattern, getLogoUrl } from "@docspace/shared/utils/common";
import { mobile, mobileMore } from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { Heading, HeadingLevel } from "@docspace/shared/components/heading";
import { Text } from "@docspace/shared/components/text";

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
          <Heading level={HeadingLevel.h1}>{t("CompletedForm:Title")}</Heading>
          <Text>{t("CompletedForm:Description")}</Text>
        </section>
      </div>
    </section>
  );
};
