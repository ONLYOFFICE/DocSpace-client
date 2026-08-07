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

import React from "react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import GithubLightIcon from "PUBLIC_DIR/images/thirdparties/github.light.react.svg";
import GithubDarkIcon from "PUBLIC_DIR/images/thirdparties/github.dark.react.svg";

import type { AppPromoDialogProps } from "./AppPromoDialog.types";
import styles from "./AppPromoDialog.module.scss";

/**
 * Generic, reusable "introduce this app" promo modal. It owns only the layout
 * (heading + feature list on the left, illustration on the right, the footer
 * actions); every app passes its own `content`. Shown every time a user opens an
 * app from the dashboard — visibility is driven by `useAppPromo`, not here.
 *
 * This is also where a section's onboarding tour is offered: "Take a tour"
 * opens the app and walks the user through it, and is left out when no tour
 * can run (see `onTakeTour`).
 */
const AppPromoDialog = ({
  visible,
  content,
  onClose,
  onOpen,
  onTakeTour,
}: AppPromoDialogProps) => {
  const { isBase } = useTheme();

  const {
    title,
    subtitle,
    description,
    features,
    IllustrationLight,
    IllustrationDark,
    openLabel,
    tourLabel,
    githubLabel,
    githubUrl,
  } = content;

  const Illustration = isBase ? IllustrationLight : IllustrationDark;
  const GithubIcon = isBase ? GithubLightIcon : GithubDarkIcon;

  const onGithubClick = React.useCallback(() => {
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  }, [githubUrl]);

  if (!visible) return null;

  return (
    <ModalDialog
      className={styles.dialog}
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      isHuge
      autoMaxHeight
    >
      <ModalDialog.Header>{title}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.body}>
          <div className={styles.header}>
            <Text as="h3" className={styles.subtitle}>
              {subtitle}
            </Text>
            <Text as="p" className={styles.description}>
              {description}
            </Text>
          </div>

          <div className={styles.columns}>
            <ul className={styles.featureList}>
              {features.map(({ Icon, title: featureTitle, description: d }) => (
                <li key={featureTitle} className={styles.featureItem}>
                  <span className={styles.featureIconWrap} aria-hidden="true">
                    <Icon className={styles.featureIcon} />
                  </span>
                  <div className={styles.featureTexts}>
                    <Text as="span" className={styles.featureTitle}>
                      {featureTitle}
                    </Text>
                    <Text as="span" className={styles.featureDescription}>
                      {d}
                    </Text>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.illustrationWrap} aria-hidden="true">
              <Illustration className={styles.illustration} />
            </div>
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={openLabel}
          onClick={onOpen}
          testId="app-promo-open"
        />
        {onTakeTour && tourLabel ? (
          <Button
            size={ButtonSize.normal}
            label={tourLabel}
            onClick={onTakeTour}
            testId="app-promo-take-tour"
          />
        ) : null}
        {/* Icon-only: the repo link is a tertiary action, so it gets the mark
            alone. `githubLabel` stays as its accessible name / hover title. */}
        <IconButton
          className={styles.githubButton}
          iconNode={<GithubIcon />}
          size={20}
          isClickable
          isFill={false}
          title={githubLabel}
          onClick={onGithubClick}
          dataTestId="app-promo-github"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default AppPromoDialog;

