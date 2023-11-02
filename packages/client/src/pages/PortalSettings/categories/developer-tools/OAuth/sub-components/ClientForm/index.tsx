import React from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  IClientProps,
  IClientReqDTO,
  IScope,
} from "@docspace/common/utils/oauth/interfaces";

import BasicBlock from "./components/BasicBlock";
import ClientBlock from "./components/ClientBlock";
import SupportBlock from "./components/SupportBlock";
import OAuthBlock from "./components/OAuthBlock";
import ScopesBlock from "./components/ScopesBlock";
import ButtonsBlock from "./components/ButtonsBlock";

import { StyledContainer } from "./ClientForm.styled";

import { ClientFormProps, ClientStore } from "./ClientForm.types";

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
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRequestRunning, setIsRequestRunning] =
    React.useState<boolean>(false);

  const [initClient, setInitClient] = React.useState<IClientProps | null>(null);

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

    authentication_method: "zxc",

    scopes: [],
  });

  const [clientId, setClientId] = React.useState<string>("");
  const [clientSecret, setClientSecret] = React.useState<string>("");

  const isEdit = !!id || !!client;

  // const onInputChange = React.useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const { name, value } = e.target;

  //     setForm((v) => {
  //       v[name] = value;

  //       return { ...v };
  //     });
  //   },
  //   []
  // );

  // const onCheckboxChange = React.useCallback(
  //   (name: string) => {
  //     const idx = checkedScopes.findIndex((scope) => scope === name);

  //     if (idx === -1) {
  //       setCheckedScopes((val) => [...val, name]);
  //     } else {
  //       setCheckedScopes((val) => val.filter((scope) => scope !== name));
  //     }
  //   },
  //   [checkedScopes]
  // );

  const onSaveClick = async () => {
    if (!id) {
      if (!saveClient) return;

      await saveClient(form);

      onCancelClick();
    }
    // } else {
    //   if (!updateClient) return;
    //   await updateClient(clientId, newClient);
    // }

    // onCancelClick();
  };

  const onCancelClick = () => {
    navigate("/portal-settings/developer-tools/oauth");
  };

  // const onResetClick = React.useCallback(async () => {
  //   if (!regenerateSecret) return;
  //   const newSecret = await regenerateSecret(clientId);

  //   setSecret(newSecret);
  // }, [clientId, regenerateSecret]);

  // const getClient = React.useCallback(async () => {
  //   if (!fetchClient || !id) return;

  //   const client = await fetchClient(id);

  //   setClient(client);
  // }, [id, fetchClient]);

  // const setClient = React.useCallback(async (client: ClientProps) => {
  //   setForm({
  //     appName: client.name,
  //     appIcon: client.logoUrl || "",
  //     description: client.description,

  //     redirectUrl: client.redirectUri,
  //     privacyURL: client.policyUrl,
  //     termsUrl: client.termsUrl,
  //     logoutRedirectUrl: client.logoutRedirectUri,

  //     authenticationMethod: client.authenticationMethod,
  //   });

  //   setSecret(client.secret);

  //   setCheckedScopes([...client.scopes]);

  //   setInitClient({ ...client, scopes: [...client.scopes] });

  //   setIsLoading(false);
  // }, []);

  // React.useEffect(() => {
  //   setIsLoading(true);
  // }, []);

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

  const getScopeList = React.useCallback(async () => {
    if (!fetchScopes) return;

    await fetchScopes();
    setIsLoading(false);
  }, [fetchScopes]);

  React.useEffect(() => {
    if (scopeList && scopeList?.length !== 0) return;

    setIsLoading(true);
    getScopeList();
  }, [id, scopeList, getScopeList, fetchScopes]);

  // React.useEffect(() => {

  //   if (id) {
  //     setClientId(id);
  //     if (!client) {
  //       getClient();
  //     } else {
  //       setClient(client);
  //     }
  //   }
  // }, [id, client, fetchClient, getClient, setClient]);

  const compareAndValidate = () => {
    let isValid = true;

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
        <div> Loading...</div>
      ) : (
        <>
          <BasicBlock
            t={t}
            nameValue={form.name}
            websiteUrlValue={form.website_url}
            descriptionValue={form.description}
            logoValue={form.logo}
            changeValue={onChangeForm}
          />
          {isEdit && (
            <ClientBlock t={t} idValue={clientId} secretValue={clientSecret} />
          )}
          <OAuthBlock
            t={t}
            redirectUrisValue={form.redirect_uris}
            allowedOriginsValue={form.allowed_origins}
            changeValue={onChangeForm}
          />
          <ScopesBlock
            t={t}
            scopes={scopeList || []}
            selectedScopes={[]}
            onAddScope={onChangeForm}
          />
          <SupportBlock
            t={t}
            policyUrlValue={form.policy_url}
            termsUrlValue={form.terms_url}
            changeValue={onChangeForm}
          />
          <ButtonsBlock
            saveLabel={"Save"}
            cancelLabel={"Cancel"}
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
