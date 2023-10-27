import React from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  IClientProps,
  IClientReqDTO,
  IScope,
} from "@docspace/common/utils/oauth/interfaces";

// @ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

import BasicBlock from "./components/BasicBlock";
import ClientBlock from "./components/ClientBlock";
import SupportBlock from "./components/SupportBlock";

import { StyledContainer } from "./ClientForm.styled";

import { ClientFormProps } from "./ClientForm.types";
import OAuthBlock from "./components/OAuthBlock";
import ScopesBlock from "./components/ScopesBlock";

const ClientForm = ({
  id,

  client,

  scopeList,

  fetchClient,
  fetchScopes,

  saveClient,
  updateClient,

  regenerateSecret,
}: ClientFormProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [initClient, setInitClient] = React.useState<IClientProps | null>(null);

  const [form, setForm] = React.useState<IClientReqDTO>({
    name: "",
    logo: "",
    website_url: "",
    description: "",

    redirect_uris: [""],
    allowed_origins: [""],
    logout_redirect_uris: [""],

    terms_url: "",
    policy_url: "",

    authentication_method: "",

    scopes: [""],
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

  // const onSaveClick = async () => {
  //   const newClient: ClientProps = client ? { ...client } : ({} as ClientProps);

  //   newClient.name = form.appName;
  //   newClient.logoUrl = form.appIcon;
  //   newClient.description = form.description;
  //   newClient.redirectUri = form.redirectUrl;
  //   newClient.logoutRedirectUri = form.logoutRedirectUrl;
  //   newClient.policyUrl = form.privacyURL;
  //   newClient.clientId = clientId;
  //   newClient.secret = secret;
  //   newClient.scopes = [...checkedScopes];

  //   if (!id) {
  //     if (!saveClient) return;

  //     if (tenant === -1 && fetchTenant) {
  //       const t = await fetchTenant();

  //       newClient.tenant = t;
  //     }

  //     await saveClient(newClient);
  //   } else {
  //     if (!updateClient) return;
  //     await updateClient(clientId, newClient);
  //   }

  //   onCancelClick();
  // };

  // const onCancelClick = () => {
  //   navigate("/portal-settings/developer-tools/oauth");
  // };

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

      if (typeof newVal[name as keyof IClientReqDTO]) {
        typeof newVal[name as keyof IClientReqDTO] === value;
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

  // const compareAndValidate = () => {
  //   let isValid = false;

  //   for (let key in form) {
  //     if (!!form[key] || key === "appIcon" || key === "authenticationMethod") {
  //       if (initClient) {
  //         switch (key) {
  //           case "appName":
  //             isValid = isValid || initClient.name !== form[key];

  //             break;
  //           case "appIcon":
  //             isValid = isValid || initClient.name !== form[key];

  //             break;
  //           case "description":
  //             isValid = isValid || initClient.description !== form[key];

  //             break;
  //           case "redirectUrl":
  //             isValid = isValid || initClient.redirectUri !== form[key];

  //             break;
  //           case "logoutRedirectUrl":
  //             isValid = isValid || initClient.logoutRedirectUri !== form[key];

  //             break;
  //           case "privacyUrl":
  //             isValid = isValid || initClient.policyUrl !== form[key];

  //             break;

  //           case "termsUrl":
  //             isValid = isValid || initClient.termsUrl !== form[key];

  //             break;
  //         }
  //       }
  //       isValid = true;
  //     } else {
  //       isValid = false;
  //     }
  //   }

  //   if (checkedScopes.length > 0) {
  //     if (initClient) {
  //       let isSame = checkedScopes.length === initClient?.scopes.length;
  //       if (isSame) {
  //         checkedScopes.forEach((scope) => {
  //           if (!initClient?.scopes.includes(scope)) isSame = false;
  //         });
  //       }

  //       isValid = isValid || !isSame;
  //     }
  //   } else {
  //     isValid = false;
  //   }

  //   return isValid;
  // };

  // const isValid = compareAndValidate();

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
            changeValue={(name: string, value: string) => {
              console.log(name, value);
            }}
          />
          <ScopesBlock
            t={t}
            scopes={scopeList || []}
            selectedScopes={[]}
            onAddScope={() => {}}
          />
          <SupportBlock
            t={t}
            policyUrlValue={form.policy_url}
            termsUrlValue={form.terms_url}
            changeValue={(name: string, value: string) => {
              console.log(name, value);
            }}
          />
        </>
      )}
    </StyledContainer>
  );
};

export default inject(
  (
    { oauthStore }: { oauthStore: OAuthStoreProps },
    { id }: ClientFormProps
  ) => {
    const {
      clientList,
      scopeList,

      fetchClient,
      fetchScopes,

      saveClient,
      updateClient,

      regenerateSecret,
    } = oauthStore;

    const props: ClientFormProps = {
      scopeList,

      fetchClient,
      fetchScopes,

      saveClient,
      updateClient,

      regenerateSecret,
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
