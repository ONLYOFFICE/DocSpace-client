import { makeAutoObservable, runInAction } from "mobx";

import {
  addClient,
  updateClient,
  changeClientStatus,
  regenerateSecret,
  deleteClient,
  getClientList,
  getScopeList,
  getConsentList,
  revokeUserClient,
} from "@docspace/shared/api/oauth";
import {
  IClientListProps,
  IClientProps,
  IClientReqDTO,
  IScope,
} from "@docspace/shared/utils/oauth/interfaces";
import { toastr } from "@docspace/shared/components/toast";
import { AuthenticationMethod } from "@docspace/shared/enums";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { UserStore } from "@docspace/shared/store/UserStore";
import { TTranslation } from "@docspace/shared/types";

import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";
import OauthRevokeSvgUrl from "PUBLIC_DIR/images/oauth.revoke.svg?url";
import SettingsIcon from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";

const PAGE_LIMIT = 100;

export type ViewAsType = "table" | "row";

export interface OAuthStoreProps {
  isInit: boolean;
  setIsInit: (value: boolean) => void;

  viewAs: ViewAsType;
  setViewAs: (value: ViewAsType) => void;

  infoDialogVisible: boolean;
  setInfoDialogVisible: (value: boolean) => void;

  revokeDialogVisible: boolean;
  setRevokeDialogVisible: (value: boolean) => void;

  previewDialogVisible: boolean;
  setPreviewDialogVisible: (value: boolean) => void;

  disableDialogVisible: boolean;
  setDisableDialogVisible: (value: boolean) => void;

  resetDialogVisible: boolean;
  setResetDialogVisible: (value: boolean) => void;

  deleteDialogVisible: boolean;
  setDeleteDialogVisible: (value: boolean) => void;

  clientsIsLoading: boolean;
  setClientsIsLoading: (value: boolean) => void;

  clientSecret: string;
  setClientSecret: (value: string) => void;

  editClient: (clientId: string) => void;

  clients: IClientProps[];

  fetchClients: () => Promise<void>;
  fetchNextClients: (startIndex: number) => Promise<void>;

  consents: IClientProps[];
  fetchConsents: () => Promise<void>;

  saveClient: (client: IClientReqDTO) => Promise<void>;

  updateClient: (clientId: string, client: IClientReqDTO) => Promise<void>;

  changeClientStatus: (clientId: string, status: boolean) => Promise<void>;

  regenerateSecret: (clientId: string) => Promise<string | undefined>;

  deleteClient: (clientId: string[]) => Promise<void>;

  revokeClient: (clientId: string[]) => Promise<void>;

  userStore: UserStore | null;

  currentPage: number;
  nextPage: number | null;
  itemCount: number;

  selection: string[];
  setSelection: (clientId: string) => void;

  bufferSelection: IClientProps | null;
  setBufferSelection: (clientId: string) => void;

  activeClients: string[];
  setActiveClient: (clientId: string) => void;

  scopes: IScope[];
  fetchScopes: () => Promise<void>;

  getContextMenuItems: (
    t: TTranslation,
    item: IClientProps,
    isInfo?: boolean,
    isSettings?: boolean,
  ) => ContextMenuModel[];

  clientList: IClientProps[];
  isEmptyClientList: boolean;
  hasNextPage: boolean;
  scopeList: IScope[];
}

class OAuthStore implements OAuthStoreProps {
  userStore: UserStore | null = null;

  viewAs: ViewAsType = "table";

  currentPage: number = 0;

  nextPage: number | null = null;

  itemCount: number = 0;

  infoDialogVisible: boolean = false;

  previewDialogVisible: boolean = false;

  disableDialogVisible: boolean = false;

  deleteDialogVisible: boolean = false;

  resetDialogVisible: boolean = false;

  selection: string[] = [];

  bufferSelection: IClientProps | null = null;

  clients: IClientProps[] = [];

  activeClients: string[] = [];

  scopes: IScope[] = [];

  clientsIsLoading: boolean = true;

  clientSecret: string = "";

  consents: IClientProps[] = [];

  isInit: boolean = false;

  revokeDialogVisible: boolean = false;

  constructor(userStore: UserStore) {
    this.userStore = userStore;
    makeAutoObservable(this);
  }

  setRevokeDialogVisible = (value: boolean) => {
    this.revokeDialogVisible = value;
  };

  setIsInit = (value: boolean) => {
    this.isInit = value;
  };

  setViewAs = (value: ViewAsType) => {
    this.viewAs = value;
  };

  setInfoDialogVisible = (value: boolean) => {
    this.infoDialogVisible = value;
  };

  setPreviewDialogVisible = (value: boolean) => {
    this.previewDialogVisible = value;
  };

  setDisableDialogVisible = (value: boolean) => {
    this.disableDialogVisible = value;
  };

  setDeleteDialogVisible = (value: boolean) => {
    this.deleteDialogVisible = value;
  };

  setResetDialogVisible = (value: boolean) => {
    this.resetDialogVisible = value;
  };

  setClientSecret = (value: string) => {
    this.clientSecret = value;
  };

  setSelection = (clientId: string) => {
    if (!clientId) {
      this.selection = [];
    } else if (this.selection.includes(clientId)) {
      this.selection = this.selection.filter((s) => s !== clientId);
    } else {
      this.selection.push(clientId);
    }
  };

  setBufferSelection = (clientId: string) => {
    const client = this.clients.find((c) => c.clientId === clientId);

    if (client) {
      this.bufferSelection = { ...client, scopes: [...client.scopes] };
    } else {
      const consent = this.consents.find((c) => c.clientId === clientId);

      if (consent)
        this.bufferSelection = { ...consent, scopes: [...consent.scopes] };
    }
  };

  setClientsIsLoading = (value: boolean) => {
    this.clientsIsLoading = value;
  };

  setActiveClient = (clientId: string) => {
    if (!clientId) {
      this.activeClients = [];
    } else if (this.activeClients.includes(clientId)) {
      this.activeClients = this.activeClients.filter((s) => s !== clientId);
    } else {
      this.activeClients.push(clientId);
    }
  };

  editClient = (clientId: string) => {
    this.setInfoDialogVisible(false);
    this.setPreviewDialogVisible(false);

    window?.DocSpace?.navigate(
      `/portal-settings/developer-tools/oauth/${clientId}`,
    );
  };

  fetchClients = async () => {
    try {
      this.setClientsIsLoading(true);
      const clientList: IClientListProps = await getClientList(0, PAGE_LIMIT);

      runInAction(() => {
        this.clients = [...clientList.content];
        this.selection = [];
        this.currentPage = clientList.page;
        this.nextPage = clientList.next || null;

        if (clientList.next) {
          this.itemCount = clientList.content.length + 2;
        } else {
          this.itemCount = clientList.content.length;
        }
      });
      this.setClientsIsLoading(false);
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  fetchConsents = async () => {
    try {
      const consentList: IClientProps[] = await getConsentList();

      runInAction(() => {
        this.consents = [...consentList];
      });
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  fetchNextClients = async (startIndex: number) => {
    if (this.clientsIsLoading) return;

    this.setClientsIsLoading(true);

    const page = startIndex / PAGE_LIMIT;

    runInAction(() => {
      this.currentPage = page + 1;
    });

    const clientList: IClientListProps = await getClientList(
      this.nextPage || page,
      PAGE_LIMIT,
    );

    runInAction(() => {
      this.currentPage = clientList.page;
      this.nextPage = clientList.next || null;
      this.clients = [...this.clients, ...clientList.content];

      this.itemCount += clientList.content.length;
    });

    this.setClientsIsLoading(false);
  };

  saveClient = async (client: IClientReqDTO) => {
    try {
      const newClient = await addClient(client);

      const creatorDisplayName = this.userStore?.user?.displayName;
      const creatorAvatar = this.userStore?.user?.avatarSmall;

      runInAction(() => {
        this.clients = [
          { ...newClient, enabled: true, creatorDisplayName, creatorAvatar },
          ...this.clients,
        ];
      });
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  updateClient = async (clientId: string, client: IClientReqDTO) => {
    try {
      await updateClient(clientId, client);

      const idx = this.clients.findIndex((c) => c.clientId === clientId);

      const newClient = { ...this.clients[idx] };

      newClient.name = client.name;
      newClient.allowedOrigins = client.allowed_origins;
      newClient.logo = client.logo;
      newClient.description = client.description;

      if (
        client.allow_pkce &&
        !newClient.authenticationMethods.includes(AuthenticationMethod.none)
      )
        newClient.authenticationMethods.push(AuthenticationMethod.none);

      if (idx > -1) {
        runInAction(() => {
          this.clients[idx] = {
            ...newClient,
          };
        });
      }
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  changeClientStatus = async (clientId: string, status: boolean) => {
    try {
      await changeClientStatus(clientId, status);

      const idx = this.clients.findIndex((c) => c.clientId === clientId);

      if (idx > -1) {
        runInAction(() => {
          this.clients[idx] = { ...this.clients[idx], enabled: status };
        });
      }
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  regenerateSecret = async (clientId: string) => {
    try {
      const { client_secret: clientSecret } = await regenerateSecret(clientId);

      this.setClientSecret(clientSecret);

      return clientSecret;
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  deleteClient = async (clientsId: string[]) => {
    try {
      const requests: Promise<void>[] = [];

      clientsId.forEach((id) => {
        this.setActiveClient(id);
        requests.push(deleteClient(id));
      });

      await Promise.all(requests);

      runInAction(() => {
        this.clients = this.clients.filter(
          (c) => !clientsId.includes(c.clientId),
        );
      });

      this.setActiveClient("");
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  fetchScopes = async () => {
    try {
      const scopes = await getScopeList();

      this.scopes = scopes;
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  revokeClient = async (clientsId: string[]) => {
    try {
      const requests: Promise<void>[] = [];

      clientsId.forEach((id) => {
        this.setActiveClient(id);
        requests.push(revokeUserClient(id));
      });

      await Promise.all(requests);

      runInAction(() => {
        this.consents = this.consents.filter(
          (c) => !clientsId.includes(c.clientId),
        );
      });

      this.setActiveClient("");
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  getContextMenuItems = (
    t: TTranslation,
    item: IClientProps,
    isInfo?: boolean,
    isSettings: boolean = true,
  ) => {
    const { clientId } = item;

    const isGroupContext = this.selection.length > 1;

    const onShowInfo = () => {
      this.setBufferSelection(clientId);
      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(true);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(false);
    };

    const onRevoke = () => {
      if (!isGroupContext) this.setBufferSelection(clientId);
      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(true);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(false);
    };

    const onDisable = () => {
      this.setBufferSelection(clientId);
      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(false);
      this.setDisableDialogVisible(true);
      this.setDeleteDialogVisible(false);
    };

    const openOption = {
      key: "open",
      icon: ExternalLinkReactSvgUrl,
      label: t("Files:Open"),
      onClick: () => window.open(item.websiteUrl, "_blank"),
      isDisabled: isInfo,
    };

    const infoOption = {
      key: "info",
      icon: SettingsIcon,
      label: t("Common:Info"),
      onClick: onShowInfo,
      isDisabled: isInfo,
    };

    const revokeOptions = [
      {
        key: "revoke",
        icon: OauthRevokeSvgUrl,
        label: t("Revoke"),
        onClick: onRevoke,
        isDisabled: false,
      },
    ];

    if (!isSettings) {
      const items: ContextMenuModel[] = [];

      if (!isGroupContext) {
        items.push(openOption);

        if (!isInfo) items.push(infoOption);

        items.push({
          key: "separator",
          isSeparator: true,
        });
      }

      items.push(...revokeOptions);

      return items;
    }

    const onDelete = () => {
      this.setBufferSelection(clientId);
      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(false);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(true);
    };

    const onShowPreview = () => {
      this.setBufferSelection(clientId);
      this.setPreviewDialogVisible(true);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(false);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(false);
    };

    const onEnable = async (status: boolean) => {
      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(false);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(false);

      if (isGroupContext) {
        try {
          const actions: Promise<void>[] = [];

          this.selection.forEach((s) => {
            this.setActiveClient(s);
            actions.push(this.changeClientStatus(s, status));
          });

          await Promise.all(actions);

          this.setActiveClient("");
          this.setSelection("");
        } catch (e) {
          const err = e as TData;
          toastr.error(err);
        }
      } else {
        this.setActiveClient(clientId);

        await this.changeClientStatus(clientId, status);

        this.setActiveClient("");
        this.setSelection("");

        // TODO OAuth, show toast
      }
    };

    const editOption = {
      key: "edit",
      icon: PencilReactSvgUrl,
      label: t("Common:Edit"),
      onClick: () => this.editClient(clientId),
    };

    const authButtonOption = {
      key: "auth-button",
      icon: CodeReactSvgUrl,
      label: t("AuthButton"),
      onClick: onShowPreview,
    };

    const enableOption = {
      key: "enable",
      icon: EnableReactSvgUrl,
      label: t("Common:Enable"),
      onClick: () => onEnable(true),
    };

    const disableOption = {
      key: "disable",
      icon: RemoveReactSvgUrl,
      label: t("Common:Disable"),
      onClick: onDisable,
    };

    const contextOptions = [
      {
        key: "Separator dropdownItem",
        isSeparator: true,
      },
      {
        key: "delete",
        label: t("Common:Delete"),
        icon: DeleteIcon,
        onClick: () => onDelete(),
      },
    ];

    if (isGroupContext) {
      let enabled = false;

      this.selection.forEach((s) => {
        enabled =
          enabled ||
          this.clientList.find((client) => client.clientId === s)?.enabled ||
          false;
      });

      if (enabled) {
        contextOptions.unshift(disableOption);
      } else {
        contextOptions.unshift(enableOption);
      }
    } else {
      if (item.enabled) {
        contextOptions.unshift(disableOption);
      } else {
        contextOptions.unshift(enableOption);
      }

      if (!isInfo) contextOptions.unshift(infoOption);
      contextOptions.unshift(authButtonOption);
      contextOptions.unshift(editOption);
    }

    return contextOptions;
  };

  get clientList() {
    return this.clients;
  }

  get isEmptyClientList() {
    return this.clientList.length === 0;
  }

  get hasNextPage() {
    return !!this.nextPage;
  }

  get scopeList() {
    return this.scopes;
  }
}

export default OAuthStore;
