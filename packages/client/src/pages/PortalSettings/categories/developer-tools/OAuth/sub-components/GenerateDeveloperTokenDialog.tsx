import React from "react";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";
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
import { globalColors } from "@docspace/shared/themes";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
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
  const { i18n: i18nParam } = useTranslation(["OAuth", "Common"]);

  const theme = useTheme();
  const [token, setToken] = React.useState("");
  const [dates, setDates] = React.useState({
    created: getDate(new Date(), i18nParam),
    expires: getDate(new Date(), i18nParam),
  });
  const [requestRunning, setRequestRunning] = React.useState(false);

  const onGenerate = async () => {
    if (token || !client || requestRunning) return;

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
        toastr.success("Copied");
      }
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  const onCopyClick = async () => {
    copy(token);
    toastr.success("Copied");
  };

  const onClose = () => {
    if (requestRunning) return;

    setGenerateDeveloperTokenDialogVisible?.(false);
  };
  return (
    <ModalDialog
      visible
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
      scale
    >
      <ModalDialog.Header>Generate developer token</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledGenerateDevelopTokenContainer>
          <Text>
            By generating an developer access token, you will be able to make
            API calls for your own account without going through the
            authorization flow. To obtain access tokens for other users, use the
            standard OAuth flow.
          </Text>
          <Text>
            For scoped apps, the token will have the same scope as the app.
          </Text>
          {token ? (
            <>
              <Text
                color={
                  theme.isBase
                    ? globalColors.lightErrorStatus
                    : globalColors.darkErrorStatus
                }
              >
                This access token can be used to access your account ({email})
                via the API. Don`t share your access token with anyone.
              </Text>
              <InputBlock
                value={token}
                scale
                isReadOnly
                isDisabled
                size={InputSize.base}
                iconName={CopyReactSvgUrl}
                onIconClick={onCopyClick}
                type={InputType.text}
                maxLength={10000}
              />
              <Text className="dates">
                Created: {dates.created}
                <br />
                Expires: {dates.expires}{" "}
              </Text>
            </>
          ) : null}
        </StyledGenerateDevelopTokenContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label="Generate developer token"
          primary
          scale
          onClick={onGenerate}
          isDisabled={!!token}
          isLoading={requestRunning}
          size={ButtonSize.small}
        />
        <Button
          label="Cancel"
          scale
          onClick={onClose}
          size={ButtonSize.small}
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
    oauthStore: OAuthStoreProps;
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
