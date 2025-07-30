// (c) Copyright Ascensio System SIA 2009-2025
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
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";
import { i18n } from "i18next";
import { useTranslation, Trans } from "react-i18next";
import copy from "copy-to-clipboard";

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
import { getCorrectDate } from "@docspace/shared/utils";
import { copyShareLink } from "@docspace/shared/utils/copy";

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import OAuthStore from "SRC_DIR/store/OAuthStore";
import { StyledGenerateDevelopTokenContainer } from "../OAuth.styled";

type GenerateDeveloperTokenDialogProps = {
  client?: IClientProps;

  email?: string;

  setGenerateDeveloperTokenDialogVisible?: (value: boolean) => void;
};

const getDate = (date: Date, i18nArg: i18n) => {
  return getCorrectDate(i18nArg.language, date);
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
  const [secret, setSecret] = React.useState("");

  const onCopyClick = React.useCallback(async () => {
    copy(token);
    toastr.success(t("DeveloperTokenCopied"));
  }, [t, token]);

  const onClose = async () => {
    if (requestRunning) return;

    setGenerateDeveloperTokenDialogVisible?.(false);
  };

  const onRevoke = async () => {
    if (requestRunning || !token) return;

    setRequestRunning(true);

    await api.oauth.revokeDeveloperToken(token, client!.clientId, secret);

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

    setRequestRunning(true);

    const { clientSecret } = await api.oauth.getClient(client.clientId);

    api.oauth
      .generateDevelopToken(client.clientId, clientSecret, client.scopes)
      ?.then((data) => {
        setRequestRunning(false);

        if (!data) return;

        const { access_token: accessToken, expires_in: expiresIn } = data;

        copyShareLink(accessToken);
        toastr.success(t("DeveloperTokenCopied"));

        const created = new Date();
        // convert sec to ms
        const expires = new Date(created.getTime() + expiresIn * 1000);

        if (accessToken) {
          setToken(accessToken);
          setDates({
            created: getDate(created, i18nParam),
            expires: getDate(expires, i18nParam),
          });
        }
      })
      .catch((e) => {
        toastr.error(e as TData);
      });
  };

  React.useEffect(() => {
    const fecthClient = async () => {
      const { clientSecret } = await api.oauth.getClient(client!.clientId);

      setSecret(clientSecret);
    };

    fecthClient();
  }, [client?.clientId]);

  return (
    <ModalDialog
      visible
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
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
              </Text>{" "}
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
                        dataTestId="generate_token_email_link"
                      />
                    ),
                  }}
                >
                  {`This token can be used to access your account (<1>{{supportEmail}}</1>) via API calls. Don't share it with anyone. Make sure you copy this token now as you won't see it again.`}
                </Trans>
              </Text>
              <Text style={{ marginBottom: "16px" }} noSelect>
                <Trans t={t} i18nKey="GenerateTokenNote" ns="OAuth" />
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
                testId="generate_token_input"
              />
              <Text dataTestId="generate_token_dates" className="dates">
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
              ? `${t("Common:Copy")} & ${t("Common:CloseButton")}`
              : t("Webhooks:Generate")
          }
          primary
          scale
          onClick={onGenerate}
          isLoading={requestRunning}
          size={ButtonSize.normal}
          testId={
            token ? "copy_generate_token_button" : "generate_token_button"
          }
        />
        <Button
          label={token ? t("Revoke") : t("Common:CancelButton")}
          scale
          onClick={token ? onRevoke : onClose}
          size={ButtonSize.normal}
          isDisabled={requestRunning || !secret}
          testId={
            token ? "revoke_token_button" : "generate_token_cancel_button"
          }
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
