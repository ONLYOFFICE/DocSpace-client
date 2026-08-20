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
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import TickSvg from "PUBLIC_DIR/images/icons/12/tick.svg";
import QuestionReactSvgUrl from "PUBLIC_DIR/images/help.center.react.svg?url";

import styles from "../Dashboard.module.scss";

export type ModuleItem = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  installed: boolean;
  /** Label of the card's action button — each app words its own. */
  buttonLabel: string;
  /**
   * The app's section. Not what the action button does (see `onAction`) — it is
   * where the tour has to run, so taking the tour navigates here regardless of
   * whether the button creates something or opens the section.
   */
  href: string;
  /**
   * The card's primary action, worded by `buttonLabel`: opening the section for
   * Files, or the create dialog for an app whose entry point is creation. Falls
   * back to navigating to `href` for a user without the create right, in which
   * case `buttonLabel` reads "Open" instead.
   */
  onAction: () => void;
};

type ModuleCardProps = {
  mod: ModuleItem;
  /**
   * Starts the app's onboarding tour, which used to be offered by the promo
   * modal's "Take a tour" button. Left out for an app that has no tour — the
   * help icon is then not rendered at all.
   */
  onTakeTour?: () => void;
};

export const ModuleCard = ({ mod, onTakeTour }: ModuleCardProps) => {
  const { t } = useTranslation(["Common"]);

  return (
    <div
      data-tour-id={`dashboard-app-card-${mod.id}`}
      className={styles.moduleCard}
    >
      <div className={styles.moduleHeader}>
        <span className={styles.moduleIcon}>{mod.icon}</span>
        <Text as="p" className={styles.moduleTitle}>
          {mod.title}
        </Text>
        {mod.installed ? (
          <Text as="span" className={styles.moduleInstalledBadge}>
            <TickSvg />
            {t("Common:Installed")}
          </Text>
        ) : null}
      </div>

      <Text as="p" className={styles.moduleDescription}>
        {mod.description}
      </Text>

      <div className={styles.moduleFooter}>
        <Button
          size={ButtonSize.small}
          label={mod.buttonLabel}
          onClick={mod.onAction}
          scale
          testId={`dashboard-app-open-${mod.id}`}
        />
        {onTakeTour ? (
          <IconButton
            className={styles.moduleTourButton}
            iconName={QuestionReactSvgUrl}
            size={16}
            isClickable
            title={t("Common:WelcomeStartTour")}
            onClick={onTakeTour}
            dataTestId={`dashboard-app-tour-${mod.id}`}
          />
        ) : null}
      </div>
    </div>
  );
};

