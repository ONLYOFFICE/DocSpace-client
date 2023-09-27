import { makeAutoObservable } from "mobx";

//@ts-ignore
import { getPortal } from "@docspace/common/api/portal";

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
  ClientListProps,
  ClientProps,
  Scope,
} from "@docspace/common/utils/oauth/interfaces";

const PAGE_LIMIT = 20;

export type ViewAsType = "table" | "row";

export interface OAuthStoreProps {
  viewAs: ViewAsType;

  deleteDialogVisible: boolean;
  setDeleteDialogVisible: (value: boolean) => void;

  clients: ClientProps[];
  currentPage: number;
  totalPages: number;

  selection: string[];
  setSelection: (clientId: string) => void;

  bufferSelection: ClientProps | null;
  setBufferSelection: (clientId: string) => void;

  tenant: number;
  fetchTenant: () => Promise<number>;

  scopes: Scope[];

  setViewAs: (value: "table" | "row") => void;

  fetchClient: (clientId: string) => Promise<ClientProps | undefined>;
  fetchClients: (page: number) => Promise<void>;
  saveClient: (client: ClientProps) => Promise<void>;
  updateClient: (clientId: string, client: ClientProps) => Promise<void>;
  changeClientStatus: (clientId: string, status: boolean) => Promise<void>;
  regenerateSecret: (clientId: string) => Promise<string | undefined>;
  deleteClient: (clientId: string) => Promise<void>;

  fetchScope: (name: string) => Promise<Scope | undefined>;
  fetchScopes: () => Promise<void>;

  clientList: ClientProps[];
  isEmptyClientList: boolean;
  hasNextPage: boolean;
  scopeList: Scope[];
}

class OAuthStore implements OAuthStoreProps {
  viewAs: "table" | "row" = "table";

  currentPage: number = 0;
  totalPages: number = 0;

  deleteDialogVisible: boolean = false;

  selection: string[] = [];

  bufferSelection: ClientProps | null = null;

  tenant: number = -1;

  clients: ClientProps[] = [];

  scopes: Scope[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setViewAs = (value: "table" | "row") => {
    this.viewAs = value;
  };

  setDeleteDialogVisible = (value: boolean) => {
    this.deleteDialogVisible = value;
  };

  setSelection = (clientId: string) => {
    if (this.selection.includes(clientId)) {
      this.selection = this.selection.filter((s) => s !== clientId);
    } else {
      this.selection.push(clientId);
    }
  };

  setBufferSelection = (clientId: string) => {
    const client = this.clients.find((c) => c.clientId === clientId);

    if (client) {
      this.bufferSelection = { ...client, scopes: [...client.scopes] };
    }
  };

  fetchTenant = async () => {
    if (this.tenant > -1) return this.tenant;

    const { tenant } = await getPortal();

    this.tenant = tenant;
    return tenant;
  };

  fetchClient = async (clientId: string) => {
    try {
      const client = await getClient(clientId);

      return client;
    } catch (e) {
      console.log(e);
    }
  };

  fetchClients = async (page: number) => {
    try {
      const clientList: ClientListProps = await getClientList(0, PAGE_LIMIT);

      this.totalPages = clientList.totalPages;
      this.currentPage = page;
      this.clients = clientList.content;
    } catch (e) {
      console.log(e);
    }
  };

  //TODO: OAuth, add tenant and other params
  saveClient = async (client: ClientProps) => {
    try {
      client.tenant = 1;
      client.authenticationMethod = "zxc";
      client.termsUrl = "zxc";
      const newClient = await addClient(client);

      this.clients.push(newClient);
    } catch (e) {
      console.log(e);
    }
  };

  updateClient = async (clientId: string, client: ClientProps) => {
    try {
      const newClient = await updateClient(clientId, client);

      const idx = this.clients.findIndex((c) => c.clientId === clientId);

      if (idx > -1) {
        this.clients[idx] = newClient;
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
        this.clients[idx] = { ...this.clients[idx], enabled: status };
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

  fetchScope = async (name: string) => {
    try {
      const scope = await getScope(name);

      return scope;
    } catch (e) {
      console.log(e);
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
