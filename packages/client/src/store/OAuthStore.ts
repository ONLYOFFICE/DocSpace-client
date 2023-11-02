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
  INoAuthClientProps,
  IScope,
} from "@docspace/common/utils/oauth/interfaces";

import SettingsIcon from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";
import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";

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
  fetchClient: (
    clientId: string
  ) => Promise<IClientProps | INoAuthClientProps | undefined>;
  fetchClients: () => Promise<void>;
  fetchNextClients: (startIndex: number) => Promise<void>;

  saveClient: (client: IClientReqDTO) => Promise<void>;

  updateClient: (clientId: string, client: IClientProps) => Promise<void>;

  changeClientStatus: (clientId: string, status: boolean) => Promise<void>;

  regenerateSecret: (clientId: string) => Promise<string | undefined>;

  deleteClient: (clientId: string) => Promise<void>;

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

  currentPage: number = 0;
  nextPage: number | null = null;
  itemCount: number = 0;

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
        this.clients = clientList.content;
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

      runInAction(() => {
        this.clients.unshift(newClient);
      });
    } catch (e) {
      console.log(e);
    }
  };

  updateClient = async (clientId: string, client: IClientProps) => {
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
      const { client_secret } = await regenerateSecret(clientId);

      return client_secret;
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

  fetchScope = async (name: string) => {
    try {
      const scope = await getScope(name);

      return scope;
    } catch (e) {
      console.log(e);

      return {} as IScope;
    }
  };

  fetchScopes = async () => {
    try {
      const scopes = await getScopeList();

      this.scopes = scopes;
    } catch (e) {
      console.log(e);
    }
  };

  getContextMenuItems = (t: any, item: IClientProps) => {
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
        } catch (e) {}
      } else {
        this.setActiveClient(clientId);

        await this.changeClientStatus(clientId, status);

        //TODO OAuth, show toast
      }
    };

    const editOption = {
      key: "edit",
      icon: PencilReactSvgUrl,
      label: t("Edit"),
      onClick: () => this.editClient(clientId),
    };

    const authButtonOption = {
      key: "auth-button",
      icon: CodeReactSvgUrl,
      label: "Auth button",
      onClick: () => console.log(clientId),
    };

    const infoOption = {
      key: "info",
      icon: SettingsIcon,
      label: "Info",
      onClick: () => console.log(clientId),
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

      contextOptions.unshift(infoOption);
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
