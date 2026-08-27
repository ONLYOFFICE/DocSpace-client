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
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getBrandName } from "@docspace/shared/constants/brands";

import CheckIcon from "@docspace/ui-kit/assets/check.react.svg";
import GithubLightIcon from "PUBLIC_DIR/images/thirdparties/github.light.react.svg";
import GithubDarkIcon from "PUBLIC_DIR/images/thirdparties/github.dark.react.svg";

import type { IntegrationPlatform } from "./integrations-catalog";
import styles from "./IntegrationsCard.module.scss";

// A disabled <button> fires no mouse events, so the tooltip anchors on the
// wrapper around it rather than on the button itself.
const CREATE_INSTANCE_ANCHOR = "integration-create-instance-anchor";

type IntegrationDialogProps = {
  platform: IntegrationPlatform | null;
  onClose: () => void;
  onInstanceAction: () => void;
  // Docs Connect sits under the portal's developer tools, so only admins and
  // the owner can act on this button — everyone else sees it disabled.
  isInstanceActionDisabled?: boolean;
  /**
   * Whether the portal already has a Docs Connect instance: step 1 is then
   * done, and the button manages the instance instead of creating one.
   */
  hasInstance?: boolean;
  /** Drops the button entirely — the Docs Connect page passes this. */
  hideInstanceAction?: boolean;
};

export const IntegrationDialog = ({
  platform,
  onClose,
  onInstanceAction,
  isInstanceActionDisabled = false,
  hasInstance = false,
  hideInstanceAction = false,
}: IntegrationDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  if (!platform) return null;

  const { name, subtitle, steps, url, githubUrl, docsApiUrl } = platform;
  const GithubIcon = isBase ? GithubLightIcon : GithubDarkIcon;

  // The instance step is the only one this dialog can see the state of, so it
  // is the only one that ever renders as done.
  const isStepDone = (stepId: string) => hasInstance && stepId === "instance";

  // "Your own platform": nothing to provision and no connector repo, so the
  // footer collapses to a single secondary button to the API reference.
  const renderFooter = () =>
    docsApiUrl ? (
      <Button
        size={ButtonSize.normal}
        label={t("Common:DocsApiReference", {
          organizationName: getBrandName("OrganizationName"),
          docsName: getBrandName("ProductEditorsName"),
        })}
        onClick={() => window.open(docsApiUrl, "_blank", "noopener")}
        testId={`integration-docs-api-${platform.id}`}
      />
    ) : (
      <div className={styles.integrationDialogFooter}>
        <div className={styles.integrationDialogFooterButtons}>
          {hideInstanceAction ? null : (
            <span
              id={CREATE_INSTANCE_ANCHOR}
              className={styles.integrationDialogCreateAnchor}
            >
              <Button
                primary
                size={ButtonSize.normal}
                label={
                  hasInstance
                    ? t("Common:ManageInstance")
                    : t("Common:CreateInstance")
                }
                onClick={onInstanceAction}
                isDisabled={isInstanceActionDisabled}
                testId={`integration-create-instance-${platform.id}`}
              />
            </span>
          )}
          {isInstanceActionDisabled && !hideInstanceAction ? (
            <Tooltip
              id={`${CREATE_INSTANCE_ANCHOR}-tooltip`}
              anchorSelect={`#${CREATE_INSTANCE_ANCHOR}`}
              place="top"
              getContent={() => (
                <div className={styles.restrictionTooltip}>
                  <Text fontWeight={700} fontSize="12px">
                    {t("Common:YouDontHaveEnoughPermission")}
                  </Text>
                  <Text fontSize="12px">
                    {t("Common:ContactAdminForPermissions")}
                  </Text>
                </div>
              )}
            />
          ) : null}
          {githubUrl ? (
            <Button
              size={ButtonSize.normal}
              label={getBrandName("GitHub")}
              icon={<GithubIcon />}
              onClick={() => window.open(githubUrl, "_blank", "noopener")}
              testId={`integration-github-${platform.id}`}
            />
          ) : null}
        </div>
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
      </div>
    );

  return (
    <ModalDialog
      visible
      onClose={onClose}
      displayType={ModalDialogType.modal}
      className={styles.integrationDialog}
      isLarge
      autoMaxHeight
      dataTestId={`integration-dialog-${platform.id}`}
    >
      <ModalDialog.Header>{name}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.integrationDialogBody}>
          <Text as="h3" className={styles.integrationDialogSubtitle}>
            {subtitle}
          </Text>

          <ol className={styles.integrationDialogSteps}>
            {steps.map((step, index) => {
              const done = isStepDone(step.id);

              return (
                <li
                  key={step.id}
                  className={styles.integrationDialogStep}
                  data-testid="integration-step"
                  data-done={done ? "true" : undefined}
                >
                  <Text as="span" className={styles.integrationDialogStepLabel}>
                    {t("Common:StepNumber", { number: index + 1 })}
                  </Text>
                  <Text as="span" className={styles.integrationDialogStepText}>
                    {step.text}
                    {done ? (
                      <span
                        className={styles.integrationDialogStepDone}
                        aria-hidden="true"
                      >
                        <CheckIcon />
                      </span>
                    ) : null}
                  </Text>
                </li>
              );
            })}
          </ol>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>{renderFooter()}</ModalDialog.Footer>
    </ModalDialog>
  );
};

export default IntegrationDialog;

