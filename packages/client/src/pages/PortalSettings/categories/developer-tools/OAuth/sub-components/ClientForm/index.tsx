import React from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  IClientProps,
  IClientReqDTO,
} from "@docspace/shared/utils/oauth/types";
import { AuthenticationMethod } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { getClient } from "@docspace/shared/api/oauth";

import ResetDialog from "../ResetDialog";

import BasicBlock from "./components/BasicBlock";
import ClientBlock from "./components/ClientBlock";
import SupportBlock from "./components/SupportBlock";
import OAuthBlock from "./components/OAuthBlock";
import ScopesBlock from "./components/ScopesBlock";
import ButtonsBlock from "./components/ButtonsBlock";

import { StyledContainer } from "./ClientForm.styled";
import { ClientFormProps, ClientStore } from "./ClientForm.types";
import { isValidUrl } from "./ClientForm.utils";

import ClientFormLoader from "./Loader";

const ClientForm = ({
  id,

  client,

  scopeList,

  fetchScopes,

  saveClient,
  updateClient,

  resetDialogVisible,
  setResetDialogVisible,

  clientSecretProps,
  setClientSecretProps,

  currentDeviceType,
}: ClientFormProps) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRequestRunning, setIsRequestRunning] =
    React.useState<boolean>(false);

  const [initialClient, setInitialClient] = React.useState<IClientProps>(
    {} as IClientProps,
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

    is_public: true,
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

  const onCancelClick = () => {
    navigate("/portal-settings/developer-tools/oauth");
  };

  const onSaveClick = async () => {
    try {
      if (!id) {
        let isValid = true;

        Object.entries(form).forEach(([key, value]) => {
          if (key === "description" || key === "logout_redirect_uri") return;

          if (
            (value === "" && typeof value === "string") ||
            (value.length === 0 && value instanceof Array)
          ) {
            if (!requiredErrorFields.includes(key))
              setRequiredErrorFields((s) => [...s, key]);

            isValid = false;
          }

          isValid = isValid && !errorFields.includes(key);

          if (key === "website_url" && !isValidUrl(value)) {
            isValid = false;
          }
        });

        if (!isValid) return;

        setIsRequestRunning(true);

        await saveClient?.(form);
      } else {
        await updateClient?.(clientId, form);
      }

      onCancelClick();
    } catch (e) {
      toastr.error(e as unknown as TData);
    }
  };

  const onResetClick = React.useCallback(async () => {
    setResetDialogVisible?.(true);
  }, [setResetDialogVisible]);

  const onChangeForm = (
    name: keyof IClientReqDTO,
    value: string | boolean,
    remove?: boolean,
  ) => {
    setForm((val) => {
      if (!(name in val)) return val;

      const newVal: IClientReqDTO = { ...val };

      let item = newVal[name];

      if (typeof value === "string" && item instanceof Array) {
        if (item.includes(value) && remove) {
          item = item.filter((v: string) => v !== value);
        } else if (!item.includes(value)) {
          item.push(value);
        }
      } else {
        item = value;
      }

      function updateForm<K extends keyof IClientReqDTO>(
        key: K,
        v: IClientReqDTO[K],
      ) {
        newVal[key] = v;
      }

      updateForm(name, item);

      return { ...newVal };
    });
  };

  const getClientData = React.useCallback(async () => {
    if (clientId) return;

    const actions = [];

    if (id && !client) {
      actions.push(getClient(id));
    }

    if (scopeList?.length === 0) actions.push(fetchScopes?.());

    try {
      if (actions.length > 0) setIsLoading(true);

      const [fetchedClient] = await Promise.all(actions);

      const item = fetchedClient ?? client;

      if (id && item) {
        setForm({
          name: item.name,
          logo: item.logo,
          website_url: item.websiteUrl,
          description: item.description ?? "",

          redirect_uris: item.redirectUris ? [...item.redirectUris] : [],
          allowed_origins: item.allowedOrigins ? [...item.allowedOrigins] : [],
          logout_redirect_uri: item.logoutRedirectUri ?? "",

          terms_url: item.termsUrl ?? "",
          policy_url: item.policyUrl ?? "",

          allow_pkce: item.authenticationMethods
            ? item.authenticationMethods.includes(AuthenticationMethod.none)
            : false,
          is_public: item.isPublic ?? false,

          scopes: item.scopes ? [...item.scopes] : [],
        });

        setClientId(item.clientId ?? " ");
        setClientSecret(item.clientSecret ?? " ");

        setInitialClient(item ?? ({} as IClientProps));
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (e) {
      setIsLoading(false);

      toastr.error(e as unknown as TData);
    }
  }, [clientId, id, client, scopeList?.length, fetchScopes]);

  React.useEffect(() => {
    getClientData();
  }, [getClientData]);

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
      Object.entries(form).forEach(([key, value]) => {
        switch (key) {
          case "name":
            isValid = isValid && !!value;

            if (
              value &&
              !errorFields.includes(key) &&
              (value.length < 3 || value.length > 256)
            ) {
              isValid = false;

              setErrorFields((val) => {
                return [...val, key];
              });

              return;
            }

            if (
              errorFields.includes(key) &&
              (!value || (value.length > 2 && value.length < 257))
            ) {
              setErrorFields((val) => {
                return val.filter((n) => n !== key);
              });

              return;
            }

            isValid = isValid && !errorFields.includes(key);

            break;

          default:
            break;
        }
      });

      return (
        (isValid &&
          form.name &&
          form.logo &&
          form.allowed_origins.length > 0 &&
          (form.name !== initialClient.name ||
            form.logo !== initialClient.logo ||
            form.description !== initialClient.description ||
            form.allowed_origins.length !==
              initialClient.allowedOrigins.length ||
            form.allow_pkce !==
              initialClient.authenticationMethods.includes(
                AuthenticationMethod.none,
              ))) ||
        form.is_public !== initialClient.isPublic
      );
    }

    Object.entries(form).forEach(([key, value]) => {
      switch (key) {
        case "name":
        case "logo":
        case "terms_url":
        case "policy_url":
        case "website_url":
          if (
            errorFields.includes(key) &&
            (!value || (value.length > 2 && value.length < 256))
          ) {
            if (
              (key === "website_url" && isValidUrl(value)) ||
              key !== "website_url"
            )
              setErrorFields((val) => {
                return val.filter((n) => n !== key);
              });
          }

          if (requiredErrorFields.includes(key) && value !== "")
            setRequiredErrorFields((val) => val.filter((v) => v !== key));

          break;

        case "redirect_uris":
        case "allowed_origins":
        case "scopes":
          if (requiredErrorFields.includes(key) && value.length > 0)
            setRequiredErrorFields((val) => val.filter((v) => v !== key));

          break;

        default:
          break;
      }
    });

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
              // isPublic={form.is_public}
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
  ({ oauthStore, settingsStore }: ClientStore, { id }: ClientFormProps) => {
    const {
      clientList,
      scopeList,

      fetchScopes,

      saveClient,
      updateClient,

      setResetDialogVisible,
      resetDialogVisible,

      setClientSecret,
      clientSecret,
    } = oauthStore;

    const { currentDeviceType } = settingsStore;

    const props: ClientFormProps = {
      scopeList,

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
      const client = clientList.find((c: IClientProps) => c.clientId === id);

      props.client = client;
    }

    return { ...props };
  },
)(observer(ClientForm));
