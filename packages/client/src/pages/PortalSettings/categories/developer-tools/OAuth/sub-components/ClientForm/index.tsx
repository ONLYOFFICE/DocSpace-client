import React from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  IClientProps,
  IClientReqDTO,
} from "@docspace/shared/utils/oauth/interfaces";
import { AuthenticationMethod } from "@docspace/shared/enums";

import ResetDialog from "../ResetDialog";

import BasicBlock from "./components/BasicBlock";
import ClientBlock from "./components/ClientBlock";
import SupportBlock from "./components/SupportBlock";
import OAuthBlock from "./components/OAuthBlock";
import ScopesBlock from "./components/ScopesBlock";
import ButtonsBlock from "./components/ButtonsBlock";

import { StyledContainer } from "./ClientForm.styled";

import { ClientFormProps, ClientStore } from "./ClientForm.types";
import ClientFormLoader from "./Loader";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

const ClientForm = ({
  id,

  client,

  scopeList,

  fetchClient,
  fetchScopes,

  saveClient,
  updateClient,

  setResetDialogVisible,
  resetDialogVisible,

  setClientSecretProps,
  clientSecretProps,

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

    allow_pkce: false,

    scopes: [],
  });

  const [errorFields, setErrorFields] = React.useState<string[]>([]);
  const [requiredErrorFields, setRequiredErrorFields] = React.useState<
    string[]
  >([]);

  const { t } = useTranslation(["OAuth", "Common"]);

  const [clientId, setClientId] = React.useState<string>("");
  const [clientSecret, setClientSecret] = React.useState<string>("");

  const isEdit = !!id;

  React.useEffect(() => {
    if (clientSecretProps) {
      setClientSecret(clientSecretProps);
      setClientSecretProps?.("");
    }
  }, [clientSecretProps, setClientSecretProps]);

  const onSaveClick = async () => {
    try {
      if (!id) {
        let isValid = true;
        for (let key in form) {
          switch (key) {
            case "name":
            case "logo":
            case "website_url":
            case "terms_url":
            case "policy_url":
              if (form[key] === "") {
                if (!requiredErrorFields.includes(key))
                  setRequiredErrorFields((s) => [...s, key]);

                console.log(key);
                isValid = false;
              }
              isValid = isValid && !errorFields.includes(key);

              break;

            case "redirect_uris":
            case "allowed_origins":
            case "scopes":
              if (form[key].length === 0) {
                if (!requiredErrorFields.includes(key))
                  setRequiredErrorFields((s) => [...s, key]);

                isValid = false;
              }
              isValid = isValid && !errorFields.includes(key);
              console.log(key);
              break;
          }
        }

        console.log(isValid);

        if (!isValid) return;

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
    if (!setResetDialogVisible) return;
    setResetDialogVisible(true);

    // setClientSecret(newSecret);
  }, [clientId, setResetDialogVisible]);

  const onChangeForm = (name: string, value: string | boolean) => {
    setForm((val) => {
      const newVal = { ...val };

      if (newVal[name as keyof IClientReqDTO] instanceof Array) {
        //@ts-ignore
        if (newVal[name as keyof IClientReqDTO].includes(value)) {
          //@ts-ignore
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

    try {
      const [fetchedClient, ...rest] = await Promise.all(actions);

      if (id) {
        setForm({
          name: fetchedClient?.name || client?.name || "",
          logo: fetchedClient?.logo || client?.logo || "",
          website_url: fetchedClient?.websiteUrl || client?.websiteUrl || "",
          description: fetchedClient?.description || client?.description || "",

          redirect_uris: fetchedClient?.redirectUris
            ? [...fetchedClient?.redirectUris]
            : client?.redirectUris
              ? [...client?.redirectUris]
              : [],
          allowed_origins: fetchedClient?.allowedOrigins
            ? [...fetchedClient.allowedOrigins]
            : client?.allowedOrigins
              ? [...client.allowedOrigins]
              : [],
          logout_redirect_uri:
            fetchedClient?.logoutRedirectUri || client?.logoutRedirectUri || "",

          terms_url: fetchedClient?.termsUrl || client?.termsUrl || "",
          policy_url: fetchedClient?.policyUrl || client?.policyUrl || "",

          allow_pkce:
            fetchedClient?.authenticationMethods.includes(
              AuthenticationMethod.none
            ) ||
            client?.authenticationMethods.includes(AuthenticationMethod.none) ||
            false,

          scopes: fetchedClient?.scopes
            ? [...fetchedClient.scopes]
            : client?.scopes
              ? [...client.scopes]
              : [],
        });

        setClientId(fetchedClient?.clientId || client?.clientId || "");
        setClientSecret(
          fetchedClient?.clientSecret || client?.clientSecret || ""
        );

        setInitialClient(client || fetchedClient || ({} as IClientProps));
      }

      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);

      console.log(e);
    }
  }, [id, fetchScopes]);

  React.useEffect(() => {
    setIsLoading(true);
    getClientData();
  }, [getClientData, fetchScopes]);

  const onBlur = (key: string) => {
    if (
      key === "name" &&
      form[key] &&
      !errorFields.includes(key) &&
      (form[key].length < 3 || form[key].length > 256)
    ) {
      setErrorFields((value) => {
        return [...value, key];
      });
    } else if (
      (key === "website_url" || key === "terms_url" || key === "policy_url") &&
      form[key] &&
      !errorFields.includes(key) &&
      !isValidUrl(form[key])
    ) {
      setErrorFields((value) => {
        return [...value, key];
      });
    }
  };

  const compareAndValidate = () => {
    let isValid = true;

    if (isEdit) {
      for (let key in form) {
        switch (key) {
          case "name":
            isValid = isValid && !!form[key];

            if (
              form[key] &&
              !errorFields.includes(key) &&
              (form[key].length < 3 || form[key].length > 256)
            ) {
              isValid = false;

              return setErrorFields((value) => {
                return [...value, key];
              });
            }

            if (
              errorFields.includes(key) &&
              (!form[key] || (form[key].length > 2 && form[key].length < 256))
            ) {
              setErrorFields((value) => {
                return value.filter((n) => n !== key);
              });

              return;
            }

            isValid = isValid && !errorFields.includes(key);

            break;
        }
      }

      return (
        isValid &&
        form.name &&
        form.logo &&
        form.allowed_origins.length > 0 &&
        (form.name !== initialClient.name ||
          form.logo !== initialClient.logo ||
          form.description !== initialClient.description ||
          form.allowed_origins.length !== initialClient.allowedOrigins.length ||
          form.allow_pkce !==
            initialClient.authenticationMethods.includes(
              AuthenticationMethod.none
            ))
      );
    }

    for (let key in form) {
      switch (key) {
        case "name":
        case "logo":
        case "website_url":
        case "terms_url":
        case "policy_url":
          if (
            errorFields.includes(key) &&
            (!form[key] || (form[key].length > 2 && form[key].length < 256))
          ) {
            setErrorFields((value) => {
              return value.filter((n) => n !== key);
            });
          }

          if (requiredErrorFields.includes(key) && form[key] !== "")
            setRequiredErrorFields((value) => value.filter((v) => v !== key));

          break;

        case "redirect_uris":
        case "allowed_origins":
        case "scopes":
          if (requiredErrorFields.includes(key) && form[key].length > 0)
            setRequiredErrorFields((value) => value.filter((v) => v !== key));

          break;
      }
    }

    return isValid;
  };

  const isValid = compareAndValidate();

  return (
    <>
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
              allowPkce={form.allow_pkce}
              changeValue={onChangeForm}
              isEdit={isEdit}
              errorFields={errorFields}
              requiredErrorFields={requiredErrorFields}
              onBlur={onBlur}
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
              requiredErrorFields={requiredErrorFields}
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
              errorFields={errorFields}
              requiredErrorFields={requiredErrorFields}
              onBlur={onBlur}
            />
            <ButtonsBlock
              saveLabel={t("Common:SaveButton")}
              cancelLabel={t("Common:CancelButton")}
              onSaveClick={onSaveClick}
              onCancelClick={onCancelClick}
              isRequestRunning={isRequestRunning}
              saveButtonDisabled={isEdit ? !isValid : false}
              cancelButtonDisabled={isRequestRunning}
              currentDeviceType={currentDeviceType || ""}
            />
          </>
        )}
      </StyledContainer>
      {resetDialogVisible && <ResetDialog />}
    </>
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

      setResetDialogVisible,
      resetDialogVisible,

      setClientSecret,
      clientSecret,
    } = oauthStore;

    const { currentDeviceType } = auth.settingsStore;

    const props: ClientFormProps = {
      scopeList,

      fetchClient,
      fetchScopes,

      saveClient,
      updateClient,

      setResetDialogVisible,
      currentDeviceType,
      resetDialogVisible,
      setClientSecretProps: setClientSecret,
      clientSecretProps: clientSecret,
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
