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
import { ReactSVG } from "react-svg";

import SsoReactSvgUrl from "PUBLIC_DIR/images/sso.react.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import { PROVIDERS_DATA } from "../../constants";
import { ModalDialog, ModalDialogType } from "@docspace/ui-kit/components/modal-dialog";
import { getProviderLabel } from "../../utils/common";

import type {
  MoreLoginModalProps,
  ProvidersDataType,
} from "./MoreLoginModal.types";

import styles from "./MoreLoginModal.module.scss";

const MoreLoginModal: React.FC<MoreLoginModalProps> = (props) => {
  const {
    t,
    visible,
    onClose,
    providers,
    onSocialLoginClick,
    ssoLabel,
    ssoUrl,
  } = props;

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
      withoutPadding
    >
      <ModalDialog.Header>{t("Common:ContinueWith")}</ModalDialog.Header>
      <ModalDialog.Body>
        {ssoUrl ? (
          <div
            className={styles.providerRow}
            key="ProviderItemSSO"
            onClick={() => (window.location.href = ssoUrl)}
          >
            <ReactSVG className={styles.providerIcon} src={SsoReactSvgUrl} />
            <Text
              fontSize="14px"
              fontWeight="600"
              className={styles.providerName}
              noSelect
            >
              {ssoLabel || getProviderLabel("sso-full", t)}
            </Text>
          </div>
        ) : null}
        {providers?.map((item) => {
          if (!PROVIDERS_DATA[item.provider as keyof ProvidersDataType]) return;

          const { icon, label } =
            PROVIDERS_DATA[item.provider as keyof ProvidersDataType];

          const IconComponent = icon;

          return (
            <div
              className={styles.providerRow}
              key={`ProviderItem${label}`}
              data-url={item.url}
              data-providername={item.provider}
              onClick={onSocialLoginClick}
              data-testid={`more-login-provider-item-${label}`}
            >
              <div className={styles.providerIcon}>
                <IconComponent />
              </div>
              <Text
                fontSize="14px"
                fontWeight="600"
                className={styles.providerName}
                noSelect
              >
                {getProviderLabel(label, t)}
              </Text>
            </div>
          );
        })}
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default MoreLoginModal;
