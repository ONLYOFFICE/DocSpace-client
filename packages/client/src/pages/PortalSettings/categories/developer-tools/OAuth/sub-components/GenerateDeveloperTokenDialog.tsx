import React from "react";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";
import { i18n } from "i18next";
import { useTranslation, Trans } from "react-i18next";
import copy from "copy-to-clipboard";
import moment from "moment-timezone";

import api from "@docspace/shared/api";
import { IClientProps } from "@docspace/shared/utils/oauth/types";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { InputBlock } from "@docspace/shared/components/input-block";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
import { UserStore } from "@docspace/shared/store/UserStore";
import { Link } from "@docspace/shared/components/link";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

import OAuthStore from "SRC_DIR/store/OAuthStore";
import { StyledGenerateDevelopTokenContainer } from "../OAuth.styled";

type GenerateDeveloperTokenDialogProps = {
  client?: IClientProps;

  email?: string;

  setGenerateDeveloperTokenDialogVisible?: (value: boolean) => void;
};

const getDate = (date: Date, i18nArg: i18n) => {
  return moment(date)
    .locale(i18nArg.language)
    .tz(window.timezone)
    .format("MMM D, YYYY, h:mm:ss A");
};

const GenerateDeveloperTokenDialog = ({
  client,
  email,

  setGenerateDeveloperTokenDialogVisible,
}: GenerateDeveloperTokenDialogProps) => {
  const { i18n: i18nParam, t } = useTranslation([
    "OAuth",
    "Common",
    "Webhooks",
    "Files",
  ]);
  const theme = useTheme();

  const [token, setToken] = React.useState("");
  const [dates, setDates] = React.useState({
    created: getDate(new Date(), i18nParam),
    expires: getDate(new Date(), i18nParam),
  });
  const [requestRunning, setRequestRunning] = React.useState(false);

  const onCopyClick = async () => {
    copy(token);
    toastr.success(t("DeveloperTokenCopied"));
  };

  const onClose = async () => {
    if (requestRunning) return;

    setGenerateDeveloperTokenDialogVisible?.(false);
  };

  const onRevoke = async () => {
    if (requestRunning || !token) return;

    setRequestRunning(true);

    await api.oauth.revokeDeveloperToken(
      token,
      client!.clientId,
      client!.clientSecret,
    );

    setRequestRunning(false);

    toastr.success(t("TokenRevokedSuccessfully"));

    setToken("");

    onClose();
  };

  const onGenerate = async () => {
    if (!client || requestRunning) return;

    if (token) {
      onCopyClick();
      onClose();

      return;
    }

    try {
      const { clientId, clientSecret, scopes } = client;

      setRequestRunning(true);

      const data = await api.oauth.generateDevelopToken(
        clientId,
        clientSecret,
        scopes,
      );

      setRequestRunning(false);

      if (!data) return;

      const { access_token: accessToken, expires_in: expiresIn } = data;

      const created = new Date();
      // convert sec to ms
      const expires = new Date(created.getTime() + expiresIn * 1000);

      if (accessToken) {
        setToken(accessToken);
        copy(accessToken);
        setDates({
          created: getDate(created, i18nParam),
          expires: getDate(expires, i18nParam),
        });
        toastr.success(t("DeveloperTokenCopied"));
      }
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  return (
    <ModalDialog
      visible
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
      scale
    >
      <ModalDialog.Header>
        {token ? t("Token") : t("GenerateToken")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <StyledGenerateDevelopTokenContainer>
          {!token ? (
            <>
              <Text style={{ marginBottom: "16px" }} noSelect>
                {t("OAuth:GenerateTokenDescription")}
              </Text>
              <Text style={{ marginBottom: "16px" }} noSelect>
                {t("OAuth:GenerateTokenScope")}
              </Text>
              <Text noSelect>
                <Trans t={t} i18nKey="GenerateTokenNote" ns="OAuth" />
              </Text>
            </>
          ) : (
            <>
              <Text style={{ marginBottom: "16px" }}>
                <Trans
                  t={t}
                  ns="OAuth"
                  i18nKey="GenerateTokenWarning"
                  values={{
                    supportEmail: email,
                  }}
                  components={{
                    1: (
                      <Link
                        href={`mailto:${email}`}
                        color={theme?.currentColorScheme?.main?.accent}
                      />
                    ),
                  }}
                >
                  {`This token can be used to access your account (<1>{{supportEmail}}</1>) via API calls. Don't share it with anyone. Make sure you copy this token now as you won't see it again.`}
                </Trans>
              </Text>
              <InputBlock
                value={token}
                scale
                isReadOnly
                size={InputSize.base}
                iconName={CopyReactSvgUrl}
                onIconClick={onCopyClick}
                type={InputType.text}
                maxLength={10000}
              />
              <Text className="dates">
                <strong>{t("Files:ByCreation")}</strong>: {dates.created}
                <br />
                <strong>{t("Expires")}</strong>: {dates.expires}
              </Text>
            </>
          )}
        </StyledGenerateDevelopTokenContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={
            token
              ? `${t("Common:Copy")} & ${t("Common:CancelButton")}`
              : t("Webhooks:Generate")
          }
          primary
          scale
          onClick={onGenerate}
          isLoading={requestRunning}
          size={ButtonSize.normal}
        />
        <Button
          label={token ? t("Revoke") : t("Common:CancelButton")}
          scale
          onClick={token ? onRevoke : onClose}
          size={ButtonSize.normal}
          isDisabled={requestRunning}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    oauthStore,
    userStore,
  }: {
    oauthStore: OAuthStore;
    userStore: UserStore;
  }) => {
    const { setGenerateDeveloperTokenDialogVisible, bufferSelection } =
      oauthStore;

    const { user } = userStore;

    return {
      setGenerateDeveloperTokenDialogVisible,
      client: bufferSelection,

      email: user?.email,
    };
  },
)(observer(GenerateDeveloperTokenDialog));
