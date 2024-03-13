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
              label={t("Common:LoginButton")}
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

          return (
            <ProviderRow key={`ProviderItem${label}`}>
              <ReactSVG src={icon} />
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
