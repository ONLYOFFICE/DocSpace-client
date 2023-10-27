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
} from "@docspace/common/api/oauth";

import {
  IClientListProps,
  IClientProps,
  IClientReqDTO,
  IScope,
} from "@docspace/common/utils/oauth/interfaces";

import SettingsIcon from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";
import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

const PAGE_LIMIT = 100;

export type ViewAsType = "table" | "row";

export interface OAuthStoreProps {
  viewAs: ViewAsType;
  setViewAs: (value: ViewAsType) => void;

  deleteDialogVisible: boolean;
  setDeleteDialogVisible: (value: boolean) => void;

  clientsIsLoading: boolean;
  setClientsIsLoading: (value: boolean) => void;

  editClient: (clientId: string) => void;

  clients: IClientProps[];
  fetchClient: (clientId: string) => Promise<IClientProps | undefined>;
  fetchClients: () => Promise<void>;
  fetchNextClients: (startIndex: number) => Promise<void>;

  saveClient: (client: IClientReqDTO) => Promise<void>;

  updateClient: (clientId: string, client: IClientProps) => Promise<void>;

  changeClientStatus: (clientId: string, status: boolean) => Promise<void>;

  regenerateSecret: (clientId: string) => Promise<string | undefined>;

  deleteClient: (clientId: string) => Promise<void>;

  currentPage: number;
  totalPages: number;
  totalElements: number;

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
    item: IClientProps
  ) => {
    [key: string]: any | string | boolean | ((clientId: string) => void);
  }[];

  clientList: IClientProps[];
  isEmptyClientList: boolean;
  hasNextPage: boolean;
  scopeList: IScope[];
}

class OAuthStore implements OAuthStoreProps {
  viewAs: ViewAsType = "table";

  currentPage: number = -1;
  totalPages: number = 0;
  totalElements: number = 0;

  deleteDialogVisible: boolean = false;

  selection: string[] = [];

  bufferSelection: IClientProps | null = null;

  clients: IClientProps[] = [];

  activeClients: string[] = [];

  scopes: IScope[] = [];

  clientsIsLoading: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  setViewAs = (value: ViewAsType) => {
    this.viewAs = value;
  };

  setDeleteDialogVisible = (value: boolean) => {
    this.deleteDialogVisible = value;
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
      console.log(e);
    }
  };

  fetchClients = async () => {
    try {
      this.setClientsIsLoading(true);
      const clientList: IClientListProps = await getClientList(0, PAGE_LIMIT);

      runInAction(() => {
        this.totalPages = clientList.totalPages;

        this.totalElements = clientList.totalElements;
        this.clients = clientList.content;
        this.selection = [];
        this.currentPage = 1;
      });
      this.setClientsIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  fetchNextClients = async (startIndex: number) => {
    if (this.clientsIsLoading) return;
    this.setClientsIsLoading(true);

    const page = startIndex / PAGE_LIMIT;

    console.log(page);

    runInAction(() => {
      this.currentPage = page + 1;
    });
    const clientList: ClientListProps = await getClientList(page, PAGE_LIMIT);

    runInAction(() => {
      this.totalPages = clientList.totalPages;

      this.totalElements = clientList.totalElements;
      this.clients = [...this.clients, ...clientList.content];
    });

    this.setClientsIsLoading(false);
  };

  //TODO: OAuth, add tenant and other params
  saveClient = async (client: ClientProps) => {
    try {
      client.tenant = 1;
      client.authenticationMethod = "zxc";
      client.termsUrl = "zxc";

      const newClient = await addClient(client);

      runInAction(() => {
        this.clients.push(newClient);
      });
    } catch (e) {
      console.log(e);
    }
  };

  updateClient = async (clientId: string, client: ClientProps) => {
    try {
      const newClient = await updateClient(clientId, client);

      const idx = this.clients.findIndex((c) => c.clientId === clientId);

      if (idx > -1) {
        runInAction(() => {
          this.clients[idx] = newClient;
        });
      }
    } catch (e) {
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
      console.log(e);
    }
  };

  regenerateSecret = async (clientId: string) => {
    try {
      const secret = await regenerateSecret(clientId);

      return secret;
    } catch (e) {
      console.log(e);
    }
  };

  deleteClient = async (clientId: string) => {
    try {
      await deleteClient(clientId);
    } catch (e) {
      console.log(e);
    }
  };

  // COMPLETE
  fetchScope = async (name: string) => {
    try {
      const scope = await getScope(name);

      return scope;
    } catch (e) {
      console.log(e);

      return {} as IScope;
    }
  };

  // COMPLETE
  fetchScopes = async () => {
    try {
      const scopes = await getScopeList();

      this.scopes = scopes;
    } catch (e) {
      console.log(e);
    }
  };

  getContextMenuItems = (t: any, item: ClientProps) => {
    const { clientId } = item;

    const isGroupContext = this.selection.length;

    const onDelete = () => {
      if (!isGroupContext) {
        this.setBufferSelection(clientId);
      }

      this.setDeleteDialogVisible(true);
    };

    const onEnable = async (status: boolean) => {
      if (isGroupContext) {
        try {
          const actions: Promise<void>[] = [];

          this.selection.forEach((s) => {
            this.setActiveClient(s);
            actions.push(this.changeClientStatus(s, status));
          });

          await Promise.all(actions);

          runInAction(() => {
            this.activeClients = [];
            this.selection = [];
          });

          //TODO OAuth, show toast
        } catch (e) {}
      } else {
        this.setActiveClient(clientId);

        await this.changeClientStatus(clientId, status);

        //TODO OAuth, show toast
      }
    };

    const settingsOption = {
      key: "settings",
      icon: SettingsIcon,
      label: t("Settings"),
      onClick: () => this.editClient(clientId),
    };

    const enableOption = {
      key: "enable",
      icon: EnableReactSvgUrl,
      label: t("Enable"),
      onClick: () => onEnable(true),
    };

    const disableOption = {
      key: "disable",
      icon: RemoveReactSvgUrl,
      label: t("Disable"),
      onClick: () => onEnable(false),
    };

    const contextOptions = [
      {
        key: "Separator dropdownItem",
        isSeparator: true,
      },
      {
        key: "delete",
        label: t("Delete"),
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

      contextOptions.unshift(settingsOption);
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
    return this.totalPages - this.currentPage !== 0;
  }

  get scopeList() {
    return this.scopes;
  }
}

export default OAuthStore;
