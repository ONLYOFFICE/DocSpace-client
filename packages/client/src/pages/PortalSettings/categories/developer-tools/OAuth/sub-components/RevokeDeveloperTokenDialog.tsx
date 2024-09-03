import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { introspectDeveloperToken } from "@docspace/shared/api/oauth";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { IClientProps } from "@docspace/shared/utils/oauth/types";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";

import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { UserStore } from "@docspace/shared/store/UserStore";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

type GenerateDeveloperTokenDialogProps = {
  client?: IClientProps;

  setRevokeDeveloperTokenDialogVisible?: (value: boolean) => void;
};

const GenerateDeveloperTokenDialog = ({
  client,

  setRevokeDeveloperTokenDialogVisible,
}: GenerateDeveloperTokenDialogProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const [token, setToken] = React.useState("");
  const [isValidToken, setIsValidToken] = React.useState(false);
  const [tokenError, setTokenError] = React.useState("");

  const [requestRunning, setRequestRunning] = React.useState(false);

  const timerRef = React.useRef<null | NodeJS.Timeout>(null);

  const onRevoke = async () => {
    if (!token || !isValidToken || !client || requestRunning) return;

    try {
      const { clientId, clientSecret } = client;

      setRequestRunning(true);

      await api.oauth.revokeDeveloperToken(token, clientId, clientSecret);

      setRequestRunning(false);

      setToken("");
      setRevokeDeveloperTokenDialogVisible?.(false);

      toastr.success(t("OAuth:TokenSuccessfullyRemoved"));
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!value) {
      setIsValidToken(false);
      setTokenError("");
      setToken("");
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const data = await introspectDeveloperToken(value);

        if (!data) return;

        const { active, client_id: clientId } = data;

        if (active && clientId === client?.clientId) {
          setIsValidToken(true);
          setTokenError("");
          return;
        }

        setIsValidToken(false);
        setTokenError(t("OAuth:InvalidToken"));
      } catch (err) {
        setIsValidToken(false);
        setTokenError(t("OAuth:InvalidToken"));
        toastr.warning(err as unknown as string);
      }
    }, 200);

    setToken(value);
  };

  const onClose = () => {
    if (requestRunning) return;

    setRevokeDeveloperTokenDialogVisible?.(false);
  };

  return (
    <ModalDialog
      visible
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
      scale
    >
      <ModalDialog.Header>{t("OAuth:RevokeDialogHeader")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div>
          <Text style={{ marginBottom: "16px" }} noSelect>
            {t("OAuth:RevokeDialogDescription")}
          </Text>
          <Text style={{ marginBottom: "16px" }} noSelect>
            {t("OAuth:RevokeDialogEnterToken")}
          </Text>
          <FieldContainer
            hasError={!!tokenError}
            errorMessage={tokenError}
            removeMargin
          >
            <TextInput
              value={token}
              scale
              placeholder={t("OAuth:EnterToken")}
              type={InputType.text}
              size={InputSize.base}
              onChange={onChange}
              maxLength={10000}
              hasError={!!tokenError}
            />
          </FieldContainer>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("OAuth:Revoke")}
          primary
          scale
          onClick={onRevoke}
          isDisabled={!token || !isValidToken}
          isLoading={requestRunning}
          size={ButtonSize.normal}
        />
        <Button
          label={t("Common:Cancel")}
          scale
          onClick={onClose}
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
    oauthStore: OAuthStoreProps;
    userStore: UserStore;
  }) => {
    const { setRevokeDeveloperTokenDialogVisible, bufferSelection } =
      oauthStore;

    const { user } = userStore;

    return {
      setRevokeDeveloperTokenDialogVisible,
      client: bufferSelection,

      email: user?.email,
    };
  },
)(observer(GenerateDeveloperTokenDialog));
