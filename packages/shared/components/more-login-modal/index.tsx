// (c) Copyright Ascensio System SIA 2009-2024
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
import { ReactSVG } from "react-svg";

import SsoReactSvgUrl from "PUBLIC_DIR/images/sso.react.svg?url";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { PROVIDERS_DATA } from "@docspace/shared/constants";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { getProviderLabel } from "@docspace/shared/utils/common";

import { Modal, ProviderRow } from "./MoreLoginModal.styled";
import type {
  MoreLoginModalProps,
  ProvidersDataType,
} from "./MoreLoginModal.types";

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
    <Modal
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
    >
      <ModalDialog.Header>{t("Common:ContinueWith")}</ModalDialog.Header>
      <ModalDialog.Body>
        {ssoUrl && (
          <ProviderRow key="ProviderItemSSO">
            <ReactSVG src={SsoReactSvgUrl} />
            <Text
              fontSize="14px"
              fontWeight="600"
              className="provider-name"
              noSelect
            >
              {ssoLabel || getProviderLabel("sso-full", t)}
            </Text>
            <Button
              label={t("Common:ContinueButton")}
              className="signin-button"
              size={ButtonSize.small}
              onClick={() => (window.location.href = ssoUrl)}
            />
          </ProviderRow>
        )}
        {providers?.map((item) => {
          if (!PROVIDERS_DATA[item.provider as keyof ProvidersDataType]) return;

          const { icon, label } =
            PROVIDERS_DATA[item.provider as keyof ProvidersDataType];

          const IconComponent = icon;

          return (
            <ProviderRow key={`ProviderItem${label}`}>
              <IconComponent />
              <Text
                fontSize="14px"
                fontWeight="600"
                className="provider-name"
                noSelect
              >
                {getProviderLabel(label, t)}
              </Text>
              <Button
                label={t("Common:ContinueButton")}
                className="signin-button"
                size={ButtonSize.small}
                data-url={item.url}
                data-providername={item.provider}
                onClick={onSocialLoginClick}
              />
            </ProviderRow>
          );
        })}
      </ModalDialog.Body>
    </Modal>
  );
};

export default MoreLoginModal;
