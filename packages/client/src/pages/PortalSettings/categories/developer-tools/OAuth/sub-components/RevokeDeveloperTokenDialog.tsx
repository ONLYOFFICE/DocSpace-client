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
import { InputBlock } from "@docspace/shared/components/input-block";
import { InputSize, InputType } from "@docspace/shared/components/text-input";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
import { UserStore } from "@docspace/shared/store/UserStore";

const StyledContainer = styled.div`
  p {
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

  const [requestRunning, setRequestRunning] = React.useState(false);

  const onRevoke = async () => {
    if (!token || !client || requestRunning) return;

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

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
          <Text>Warning text</Text>
          <InputBlock
            value={token}
            scale
            placeholder="Enter developer token"
            type={InputType.text}
            size={InputSize.base}
            onChange={onChange}
          />
        </StyledContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label="Revoke"
          primary
          scale
          onClick={onRevoke}
          isDisabled={!token}
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
