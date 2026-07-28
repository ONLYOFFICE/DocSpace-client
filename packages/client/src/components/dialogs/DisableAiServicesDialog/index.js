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
import PropTypes from "prop-types";
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Button } from "@docspace/ui-kit/components/button";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";

import styles from "./DisableAiServicesDialog.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const DisableAiServicesDialogComponent = ({
  visible,
  onClose,
  onContinue,
  isLoading,
  isAiToolsServiceOn = false,
  aiServiceBalance = 0,
  aiServiceCodeCurrency = "USD",
  formatAiServiceCurrency = (amount) => `${amount}`,
}) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const effectVars = {
    productName: getBrandName("ProductName"),
    aiSettings: t("AISettings"),
    aiServices: t("Common:AIServices"),
    aiAgents: t("Common:AIAgents"),
  };

  const effects = [
    t("DisableAiServicesSettingsHidden", effectVars),
    t("DisableAiServicesServicesDisabled", effectVars),
    t("DisableAiServicesAgentsDisabled", effectVars),
  ];

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType="modal"
      autoMaxHeight
      data-testid="disable_ai_services_dialog"
    >
      <ModalDialog.Header>
        {t("DisableAiServices", {
          aiServices: t("Common:AIServices"),
        })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text
          fontSize="13px"
          fontWeight={400}
          className={styles.description}
          lineHeight="20px"
        >
          {t("DisableAiServicesDescription", {
            organizationName: getBrandName("OrganizationName"),
          })}
        </Text>
        <Text fontSize="13px" fontWeight={400} as="div">
          <ul className={styles.effectsList}>
            {effects.map((text) => (
              <li key={text} className={styles.effectItem}>
                <span className={styles.effectBullet}>
                  •
                </span>
                {text}
              </li>
            ))}
          </ul>
        </Text>
        {isAiToolsServiceOn && (
          <Text fontSize="13px" fontWeight={400} className={styles.balance}>
            <Trans
              t={t}
              i18nKey="DisableAiServicesBalance"
              values={{
                balance: formatAiServiceCurrency(
                  aiServiceBalance,
                  3,
                  aiServiceCodeCurrency,
                ),
                aiServices: t("Common:AIServices"),
              }}
              components={{
                1: <strong key="balance-strong" />,
              }}
            />
          </Text>
        )}
        <Text
          fontSize="13px"
          fontWeight={isAiToolsServiceOn ? 700 : 400}
          className={styles.confirm}
        >
          {t("DisableAiServicesConfirm", {
            aiServices: t("Common:AIServices"),
          })}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size="normal"
          label={t("Common:ContinueButton")}
          scale
          onClick={onContinue}
          isLoading={isLoading}
          testId="disable_ai_services_continue_button"
        />
        <Button
          size="normal"
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          isDisabled={isLoading}
          testId="disable_ai_services_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

DisableAiServicesDialogComponent.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isAiToolsServiceOn: PropTypes.bool,
  aiServiceBalance: PropTypes.number,
  aiServiceCodeCurrency: PropTypes.string,
  formatAiServiceCurrency: PropTypes.func,
};

const DisableAiServicesDialog = inject(({ servicesStore, paymentStore }) => {
  const { aiServiceBalance, aiServiceCodeCurrency, formatAiServiceCurrency } =
    servicesStore;
  const { isAiToolsServiceOn } = paymentStore;

  return {
    isAiToolsServiceOn,
    aiServiceBalance,
    aiServiceCodeCurrency,
    formatAiServiceCurrency,
  };
})(observer(DisableAiServicesDialogComponent));

export default DisableAiServicesDialog;
