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

import OAuthStore from "SRC_DIR/store/OAuthStore";

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
  const [secret, setSecret] = React.useState("");
  const [requestRunning, setRequestRunning] = React.useState(false);

  const timerRef = React.useRef<null | NodeJS.Timeout>(null);

  const onRevoke = async () => {
    if (!token || !isValidToken || !client || requestRunning) return;

    try {
      const { clientId } = client;

      setRequestRunning(true);

      await api.oauth.revokeDeveloperToken(token, clientId, secret);

      setRequestRunning(false);

      setToken("");
      setRevokeDeveloperTokenDialogVisible?.(false);

      toastr.success(t("OAuth:TokenRevokedSuccessfully"));
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
              testId="revoke_token_input"
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
          isDisabled={!token || !isValidToken || !secret}
          isLoading={requestRunning}
          size={ButtonSize.normal}
          testId="revoke_token_button"
        />
        <Button
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          size={ButtonSize.normal}
          isDisabled={requestRunning}
          testId="revoke_token_cancel_button"
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
