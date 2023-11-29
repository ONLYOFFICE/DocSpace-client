import { makeAutoObservable, runInAction } from "mobx";

import {
  addClient,
  getClient,
  updateClient,
  changeClientStatus,
  regenerateSecret,
  deleteClient,
  getClientList,
  getScope,
  getScopeList,
  getConsentList,
  revokeUserClient,
} from "@docspace/common/api/oauth";

import {
  IClientListProps,
  IClientProps,
  IClientReqDTO,
  INoAuthClientProps,
  IScope,
} from "@docspace/common/utils/oauth/interfaces";

//@ts-ignore
import toastr from "@docspace/components/toast/toastr";

import SettingsIcon from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";
import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";
import OauthRevokeSvgUrl from "PUBLIC_DIR/images/oauth.revoke.svg?url";

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

  clientsIsLoading: boolean;
  setClientsIsLoading: (value: boolean) => void;

  editClient: (clientId: string) => void;

  clients: IClientProps[];
  fetchClient: (
    clientId: string
  ) => Promise<IClientProps | INoAuthClientProps | undefined>;
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

  authStore: any;

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
  fetchScope: (name: string) => Promise<IScope>;
  fetchScopes: () => Promise<void>;

  getContextMenuItems: (
    t: any,
    item: IClientProps,
    isInfo?: boolean,
    isSettings?: boolean
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];

  clientList: IClientProps[];
  isEmptyClientList: boolean;
  hasNextPage: boolean;
  scopeList: IScope[];
}

class OAuthStore implements OAuthStoreProps {
  authStore: any = null;

  viewAs: ViewAsType = "table";

  currentPage: number = 0;
  nextPage: number | null = null;
  itemCount: number = 0;

  infoDialogVisible: boolean = false;
  previewDialogVisible: boolean = false;

  selection: string[] = [];

  bufferSelection: IClientProps | null = null;

  clients: IClientProps[] = [];

  activeClients: string[] = [];

  scopes: IScope[] = [];

  clientsIsLoading: boolean = true;

  consents: IClientProps[] = [];

  isInit: boolean = false;

  revokeDialogVisible: boolean = false;

  constructor(authStore: any) {
    this.authStore = authStore;
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

  setSelection = (clientId: string) => {
    if (!clientId) {
      this.selection = [];
    } else {
      if (this.selection.includes(clientId)) {
        this.selection = this.selection.filter((s) => s !== clientId);
      } else {
        this.selection.push(clientId);
      }
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
    } else {
      if (this.activeClients.includes(clientId)) {
        this.activeClients = this.activeClients.filter((s) => s !== clientId);
      } else {
        this.activeClients.push(clientId);
      }
    }
  };

  editClient = (clientId: string) => {
    this.setInfoDialogVisible(false);
    this.setPreviewDialogVisible(false);
    //@ts-ignore
    window?.DocSpace?.navigate(
      `/portal-settings/developer-tools/oauth/${clientId}`
    );
  };

  fetchClient = async (clientId: string) => {
    try {
      const client = await getClient(clientId);

      return client;
    } catch (e) {
      toastr.error(e);
      console.log(e);
    }
  };

  fetchClients = async () => {
    try {
      this.setClientsIsLoading(true);
      const clientList: IClientListProps = await getClientList(0, PAGE_LIMIT);

      runInAction(() => {
        this.clients = [...this.clients, ...clientList.content];
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
      toastr.error(e);
      console.log(e);
    }
  };

  fetchConsents = async () => {
    try {
      const consentList: IClientProps[] = await getConsentList();

      runInAction(() => {
        this.consents = [...consentList];
      });
    } catch (e) {
      toastr.error(e);
      console.log(e);
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
      PAGE_LIMIT
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

      const creatorDisplayName = this.authStore.userStore.user.displayName;
      const creatorAvatar = this.authStore.userStore.user.avatarSmall;

      runInAction(() => {
        this.clients = [
          { ...newClient, enabled: true, creatorDisplayName, creatorAvatar },
          ...this.clients,
        ];
      });
    } catch (e) {
      toastr.error(e);
      console.log(e);
    }
  };

  updateClient = async (clientId: string, client: IClientReqDTO) => {
    try {
      const newClient = await updateClient(clientId, client);

      const idx = this.clients.findIndex((c) => c.clientId === clientId);

      if (idx > -1) {
        runInAction(() => {
          this.clients[idx] = {
            ...newClient,
            creatorAvatar: this.clients[idx].creatorAvatar,
            creatorDisplayName: this.clients[idx].creatorDisplayName,
          };
        });
      }
    } catch (e) {
      toastr.error(e);
      console.log(e);
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
      toastr.error(e);
      console.log(e);
    }
  };

  regenerateSecret = async (clientId: string) => {
    try {
      const { client_secret } = await regenerateSecret(clientId);

      return client_secret;
    } catch (e) {
      toastr.error(e);
      console.log(e);
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
          (c) => !clientsId.includes(c.clientId)
        );
      });

      this.setActiveClient("");
    } catch (e) {
      toastr.error(e);
      console.log(e);
    }
  };

  fetchScope = async (name: string) => {
    try {
      const scope = await getScope(name);

      return scope;
    } catch (e) {
      toastr.error(e);
      console.log(e);

      return {} as IScope;
    }
  };

  fetchScopes = async () => {
    try {
      const scopes = await getScopeList();

      this.scopes = scopes;
    } catch (e) {
      toastr.error(e);
      console.log(e);
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
          (c) => !clientsId.includes(c.clientId)
        );
      });

      this.setActiveClient("");
    } catch (e) {
      toastr.error(e);
      console.log(e);
    }
  };

  getContextMenuItems = (
    t: any,
    item: IClientProps,
    isInfo?: boolean,
    isSettings: boolean = true
  ) => {
    const { clientId } = item;

    const isGroupContext = this.selection.length > 1;

    const onShowInfo = () => {
      this.setBufferSelection(clientId);
      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(true);
    };

    const onRevoke = () => {
      if (!isGroupContext) this.setBufferSelection(clientId);
      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(true);
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
      const items: any = [];

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
      this.setInfoDialogVisible(false);
      this.setPreviewDialogVisible(false);

      if (!isGroupContext) {
        this.deleteClient([clientId]);
      } else {
        this.deleteClient(this.selection);
      }
    };

    const onShowPreview = () => {
      this.setBufferSelection(clientId);
      this.setInfoDialogVisible(false);
      this.setPreviewDialogVisible(true);
    };

    const onEnable = async (status: boolean) => {
      this.setInfoDialogVisible(false);
      this.setPreviewDialogVisible(false);

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
          toastr.error(e);
        }
      } else {
        this.setActiveClient(clientId);

        await this.changeClientStatus(clientId, status);

        this.setActiveClient("");
        this.setSelection("");

        //TODO OAuth, show toast
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
      onClick: () => onEnable(false),
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
