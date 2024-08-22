import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

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

import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { UserStore } from "@docspace/shared/store/UserStore";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
import { introspectDeveloperToken } from "@docspace/shared/api/oauth";
import { FieldContainer } from "@docspace/shared/components/field-container";

const StyledContainer = styled.div`
  .warning-text {
    margin-bottom: 16px;
  }
`;

type GenerateDeveloperTokenDialogProps = {
  client?: IClientProps;

  setRevokeDeveloperTokenDialogVisible?: (value: boolean) => void;
};

const GenerateDeveloperTokenDialog = ({
  client,

  setRevokeDeveloperTokenDialogVisible,
}: GenerateDeveloperTokenDialogProps) => {
  // const {} = useTranslation(["OAuth", "Common"]);

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

      toastr.success("Revoked");
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
        setTokenError("Invalid token");
      } catch (err) {
        setIsValidToken(false);
        setTokenError("Invalid token");
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
      <ModalDialog.Header>Revoke developer token</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledContainer>
          <Text className="warning-text">Warning text</Text>
          <FieldContainer
            hasError={!!tokenError}
            errorMessage={tokenError}
            removeMargin
          >
            <TextInput
              value={token}
              scale
              placeholder="Enter developer token"
              type={InputType.text}
              size={InputSize.base}
              onChange={onChange}
              maxLength={10000}
              hasError={!!tokenError}
            />
          </FieldContainer>
        </StyledContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label="Revoke"
          primary
          scale
          onClick={onRevoke}
          isDisabled={!token || !isValidToken}
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
