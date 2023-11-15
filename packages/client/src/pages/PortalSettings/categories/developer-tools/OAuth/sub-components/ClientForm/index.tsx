import React from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  IClientProps,
  IClientReqDTO,
} from "@docspace/common/utils/oauth/interfaces";

import BasicBlock from "./components/BasicBlock";
import ClientBlock from "./components/ClientBlock";
import SupportBlock from "./components/SupportBlock";
import OAuthBlock from "./components/OAuthBlock";
import ScopesBlock from "./components/ScopesBlock";
import ButtonsBlock from "./components/ButtonsBlock";

import { StyledContainer } from "./ClientForm.styled";

import { ClientFormProps, ClientStore } from "./ClientForm.types";
import ClientFormLoader from "./Loader";

const ClientForm = ({
  id,

  client,

  scopeList,

  fetchClient,
  fetchScopes,

  saveClient,
  updateClient,

  regenerateSecret,

  currentDeviceType,
}: ClientFormProps) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRequestRunning, setIsRequestRunning] =
    React.useState<boolean>(false);

  const [initialClient, setInitialClient] = React.useState<IClientProps>(
    {} as IClientProps
  );
  const [form, setForm] = React.useState<IClientReqDTO>({
    name: "",
    logo: "",
    website_url: "",
    description: "",

    redirect_uris: [],
    allowed_origins: [],
    logout_redirect_uri: "",

    terms_url: "",
    policy_url: "",

    authentication_method: "client_secret_post",

    scopes: [],
  });
  const { t } = useTranslation(["OAuth", "Common"]);

  const [clientId, setClientId] = React.useState<string>("");
  const [clientSecret, setClientSecret] = React.useState<string>("");

  const isEdit = !!id;

  const onSaveClick = async () => {
    try {
      if (!id) {
        setIsRequestRunning(true);

        await saveClient?.(form);
      } else {
        await updateClient?.(clientId, form);
      }

      onCancelClick();
    } catch (e) {
      console.log(e);
    }
  };

  const onCancelClick = () => {
    navigate("/portal-settings/developer-tools/oauth");
  };

  const onResetClick = React.useCallback(async () => {
    if (!regenerateSecret) return;
    const newSecret = await regenerateSecret(clientId);

    setClientSecret(newSecret);
  }, [clientId, regenerateSecret]);

  const onChangeForm = (name: string, value: string) => {
    setForm((val) => {
      const newVal = { ...val };

      if (newVal[name as keyof IClientReqDTO] instanceof Array) {
        if (newVal[name as keyof IClientReqDTO].includes(value)) {
          newVal[name as keyof IClientReqDTO] = newVal[
            name as keyof IClientReqDTO
            //@ts-ignore
          ].filter((v: string) => v !== value);
        } else {
          //@ts-ignore
          newVal[name as keyof IClientReqDTO].push(value);
        }
      } else {
        //@ts-ignore
        newVal[name as keyof IClientReqDTO] = value;
      }

      return { ...newVal };
    });
  };

  const getClientData = React.useCallback(async () => {
    if (!fetchScopes || !fetchClient) return;

    const actions = [];

    if (id && !client) {
      actions.push(fetchClient(id));
    }

    if (scopeList?.length === 0) actions.push(fetchScopes());

    const [fetchedClient, ...rest] = await Promise.all(actions);

    if (id) {
      setForm({
        name: fetchedClient?.name || client?.name || "",
        logo: fetchedClient?.logo || client?.logo || "",
        website_url: fetchedClient?.websiteUrl || client?.websiteUrl || "",
        description: fetchedClient?.description || client?.description || "",

        redirect_uris:
          fetchedClient?.redirectUris || client?.redirectUris || [],
        allowed_origins:
          fetchedClient?.allowedOrigins || client?.allowedOrigins || [],
        logout_redirect_uri:
          fetchedClient?.logoutRedirectUri || client?.logoutRedirectUri || "",

        terms_url: fetchedClient?.termsUrl || client?.termsUrl || "",
        policy_url: fetchedClient?.policyUrl || client?.policyUrl || "",

        authentication_method:
          fetchedClient?.authenticationMethod ||
          client?.authenticationMethod ||
          "",

        scopes: fetchedClient?.scopes || client?.scopes || [],
      });

      setClientId(fetchedClient?.clientId || client?.clientId || "");
      setClientSecret(
        fetchedClient?.clientSecret || client?.clientSecret || ""
      );

      setInitialClient(client || fetchedClient || ({} as IClientProps));
    }

    setIsLoading(false);
  }, [id, fetchScopes]);

  React.useEffect(() => {
    setIsLoading(true);
    getClientData();
  }, [getClientData, fetchScopes]);

  const compareAndValidate = () => {
    let isValid = true;

    if (isEdit) {
      return (
        form.name !== initialClient.name ||
        form.logo !== initialClient.logo ||
        form.description !== initialClient.description
      );
    }

    for (let key in form) {
      switch (key) {
        case "name":
          isValid = isValid && !!form[key];

          break;
        case "logo":
          isValid = isValid && !!form[key];

          break;
        case "description":
          isValid = isValid && !!form[key];

          break;
        case "website_url":
          isValid = isValid && !!form[key];

          break;
        case "redirect_uris":
          isValid = isValid && form[key].length > 0;

          break;
        case "allowed_origins":
          isValid = isValid && form[key].length > 0;

          break;
        case "logout_redirect_uris":
          isValid = isValid;

          break;
        case "terms_url":
          isValid = isValid && !!form[key];
          break;
        case "policy_url":
          isValid = isValid && !!form[key];
          break;
        case "authentication_method":
          isValid = isValid;
          break;
        case "scopes":
          isValid = isValid && form[key].length > 0;
          break;
      }
    }

    return isValid;
  };

  const isValid = compareAndValidate();

  return (
    <StyledContainer>
      {isLoading ? (
        <ClientFormLoader
          isEdit={isEdit}
          currentDeviceType={currentDeviceType}
        />
      ) : (
        <>
          <BasicBlock
            t={t}
            nameValue={form.name}
            websiteUrlValue={form.website_url}
            descriptionValue={form.description}
            logoValue={form.logo}
            changeValue={onChangeForm}
            isEdit={isEdit}
          />
          {isEdit && (
            <ClientBlock
              t={t}
              idValue={clientId}
              secretValue={clientSecret}
              onResetClick={onResetClick}
            />
          )}
          <OAuthBlock
            t={t}
            redirectUrisValue={form.redirect_uris}
            allowedOriginsValue={form.allowed_origins}
            changeValue={onChangeForm}
            isEdit={isEdit}
          />
          <ScopesBlock
            t={t}
            scopes={scopeList || []}
            selectedScopes={form.scopes}
            onAddScope={onChangeForm}
            isEdit={isEdit}
          />
          <SupportBlock
            t={t}
            policyUrlValue={form.policy_url}
            termsUrlValue={form.terms_url}
            changeValue={onChangeForm}
            isEdit={isEdit}
          />
          <ButtonsBlock
            saveLabel={t("Common:SaveButton")}
            cancelLabel={t("Common:CancelButton")}
            onSaveClick={onSaveClick}
            onCancelClick={onCancelClick}
            isRequestRunning={isRequestRunning}
            saveButtonDisabled={!isValid}
            cancelButtonDisabled={isRequestRunning}
            currentDeviceType={currentDeviceType || ""}
          />
        </>
      )}
    </StyledContainer>
  );
};

export default inject(
  ({ oauthStore, auth }: ClientStore, { id }: ClientFormProps) => {
    const {
      clientList,
      scopeList,

      fetchClient,
      fetchScopes,

      saveClient,
      updateClient,

      regenerateSecret,
    } = oauthStore;

    const { currentDeviceType } = auth.settingsStore;

    const props: ClientFormProps = {
      scopeList,

      fetchClient,
      fetchScopes,

      saveClient,
      updateClient,

      regenerateSecret,
      currentDeviceType,
    };

    if (id) {
      const client = clientList.find(
        (client: IClientProps) => client.clientId === id
      );

      props.client = client;
    }

    return { ...props };
  }
)(observer(ClientForm));
