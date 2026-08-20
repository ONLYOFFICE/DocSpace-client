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
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getBrandName } from "@docspace/shared/constants/brands";

import GithubLightIcon from "PUBLIC_DIR/images/thirdparties/github.light.react.svg";
import GithubDarkIcon from "PUBLIC_DIR/images/thirdparties/github.dark.react.svg";

import type { IntegrationPlatform } from "./integrations-catalog";
import styles from "../Dashboard.module.scss";

type IntegrationDialogProps = {
  platform: IntegrationPlatform | null;
  onClose: () => void;
  onCreateInstance: () => void;
};

export const IntegrationDialog = ({
  platform,
  onClose,
  onCreateInstance,
}: IntegrationDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  if (!platform) return null;

  const { name, subtitle, steps, url, githubUrl } = platform;
  const GithubIcon = isBase ? GithubLightIcon : GithubDarkIcon;

  return (
    <ModalDialog
      visible
      onClose={onClose}
      displayType={ModalDialogType.modal}
      isLarge
      autoMaxHeight
    >
      <ModalDialog.Header>{name}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.integrationDialogBody}>
          <Text as="h3" className={styles.integrationDialogSubtitle}>
            {subtitle}
          </Text>

          <ol className={styles.integrationDialogSteps}>
            {steps.map((step, index) => (
              <li key={step.id} className={styles.integrationDialogStep}>
                <Text as="span" className={styles.integrationDialogStepLabel}>
                  {t("Common:StepNumber", { number: index + 1 })}
                </Text>
                <Text as="span" className={styles.integrationDialogStepText}>
                  {step.text}
                </Text>
              </li>
            ))}
          </ol>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:CreateInstance")}
          onClick={onCreateInstance}
          testId={`integration-create-instance-${platform.id}`}
        />
        {githubUrl ? (
          <Button
            size={ButtonSize.normal}
            label={getBrandName("GitHub")}
            icon={<GithubIcon />}
            onClick={() => window.open(githubUrl, "_blank", "noopener")}
            testId={`integration-github-${platform.id}`}
          />
        ) : null}
        {url ? (
          <Link
            className={styles.integrationDialogLearnMore}
            type={LinkType.action}
            href={url}
            target={LinkTarget.blank}
            isHovered
            fontSize="13px"
            fontWeight={600}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default IntegrationDialog;

