import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation, WithTranslation, Trans } from "react-i18next";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkType } from "@docspace/shared/components/link";
import WelcomeAuthSocial from "PUBLIC_DIR/images/welcome-social_auth.png";
import {
  StyledBodyContent,
  StyledInfoRow,
  StyledModalDialog,
} from "./StyledSocialAuthWelcome";
import { useNavigate } from "react-router";

interface SocialAuthWelcomeDialogProps extends WithTranslation {
  visible: boolean;
  onClose: () => void;
  tenantAlias?: string;
  baseDomain?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

const SocialAuthWelcomeDialogComponent = ({
  t,
  visible,
  onClose,
  tenantAlias,
  baseDomain,
  user,
}: SocialAuthWelcomeDialogProps) => {
  const navigate = useNavigate();

  const onContinueClick = (): void => {
    onClose();
  };

  const onProfileClick = (): void => {
    onClose();
    navigate("/profile");
  };

  const onChangeDomainClick = (): void => {
    onClose();
    navigate("/portal-settings/customization/general/dns-settings");
  };

  return (
    <StyledModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        {t("SocialAuthWelcomeDialog:ThanksJoining", {
          productName: t("Common:ProductName"),
        })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent>
          <div className="welcome-image">
            <img
              src={WelcomeAuthSocial}
              className="welcome-auth-social-image"
              alt="auth-welcome-preview"
            />
          </div>

          <Text textAlign="center">
            {t("SocialAuthWelcomeDialog:ReviewAccountDetails")}
          </Text>

          <div className="account-details">
            <StyledInfoRow>
              <Text>
                {t("SocialAuthWelcomeDialog:ProductNameDetail", {
                  productName: t("Common:ProductName"),
                })}
              </Text>
              <div className="info-value">
                <Text
                  fontWeight="600"
                  truncate
                >{`${tenantAlias}.${baseDomain}`}</Text>
                <Link
                  isHovered
                  className="change-domain_link"
                  type={LinkType.page}
                  fontWeight={600}
                  fontSize="13px"
                  onClick={onChangeDomainClick}
                >
                  {t("Common:ChangeButton")}
                </Link>
              </div>
            </StyledInfoRow>

            <StyledInfoRow>
              <Text>{t("Common:Name")}</Text>
              <Text
                fontWeight="600"
                truncate
              >{`${user?.firstName} ${user?.lastName}`}</Text>
            </StyledInfoRow>

            <StyledInfoRow>
              <Text>{t("Common:Email")}</Text>
              <Text fontWeight="600" truncate>
                {user?.email}
              </Text>
            </StyledInfoRow>

            <StyledInfoRow>
              <Text truncate>
                {t("SocialAuthWelcomeDialog:GeneratedPassword")}
              </Text>
              <Text fontWeight="600">********</Text>
            </StyledInfoRow>

            <StyledInfoRow className="no-gap">
              <Text>{""}</Text>
              <Link
                isHovered
                className="change-profile_link"
                type={LinkType.page}
                fontWeight={600}
                fontSize="13px"
                onClick={onProfileClick}
              >
                {t("SocialAuthWelcomeDialog:ChangeData")}
              </Link>
            </StyledInfoRow>
          </div>

          <Text textAlign="center" lineHeight="20px">
            <Trans
              t={t}
              i18nKey="SocialAuthWelcomeDialog:ClickButtonBelow"
              ns="SocialAuthWelcomeDialog"
            />
          </Text>
        </StyledBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="continue-to-docspace"
          className="auth-social-button"
          label={t("SocialAuthWelcomeDialog:ContinueToProduct", {
            productName: t("Common:ProductName"),
          })}
          primary
          onClick={onContinueClick}
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

const SocialAuthWelcomeDialog = withTranslation([
  "SocialAuthWelcomeDialog",
  "Common",
])(SocialAuthWelcomeDialogComponent);

export default inject(
  ({
    dialogsStore,
    settingsStore,
    userStore,
  }: {
    dialogsStore: DialogsStore;
    settingsStore: {
      tenantAlias: string;
      baseDomain: string;
    };
    userStore: {
      user: { firstName?: string; lastName?: string; email?: string };
    };
  }) => {
    const {
      socialAuthWelcomeDialogVisible: visible,
      setSocialAuthWelcomeDialogVisible: setVisible,
    } = dialogsStore;

    const { tenantAlias, baseDomain } = settingsStore;
    const { user } = userStore;

    return {
      visible,
      onClose: () => setVisible(false),
      tenantAlias,
      baseDomain,
      user,
    };
  },
)(observer(SocialAuthWelcomeDialog));
