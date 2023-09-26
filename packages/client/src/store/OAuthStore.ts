import { makeAutoObservable } from "mobx";

import {
  addClient,
  deleteClient,
  getClient,
  getClientList,
  getScope,
  getScopeList,
  regenerateSecret,
  updateClient,
} from "@docspace/common/api/oauth";

import {
  ClientDTO,
  ClientListDTO,
  ClientListProps,
  ClientProps,
  ScopeDTO,
} from "@docspace/common/utils/oauth/dto";

export interface OAuthStoreProps {
  clients: ClientProps[];
  currentClient: null | ClientProps;

  scopes: ScopeDTO[];

  fetchClient: (clientId: string) => Promise<ClientProps>;
  fetchClients: (page: number, limit: number) => Promise<void>;
  saveClient: (client: ClientProps) => Promise<ClientProps>;
  updateClient: (clientId: string, client: ClientProps) => Promise<ClientProps>;
  regenerateSecret: (clientId: string) => Promise<string>;
  deleteClient: (clientId: string) => Promise<void>;

  fetchScope: (name: string) => Promise<ScopeDTO>;
  fetchScopes: () => Promise<void>;

  clientList: ClientProps[];
  scopeList: ScopeDTO[];
}

class OAuthStore implements OAuthStoreProps {
  clients: ClientProps[] = [];
  currentClient: ClientProps | null = null;

  scopes: ScopeDTO[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  fetchClient = async (clientId: string) => {
    const client = await getClient(clientId);

    return client;
  };

  fetchClients = async (page: number, limit: number) => {
    const clientList: ClientListProps = await getClientList(0, 20);

    this.clients = clientList.content;
  };

  //TODO: add tenant and other params
  saveClient = async (client: ClientProps) => {
    client.tenant = 1;
    client.authenticationMethod = "zxc";
    client.termsUrl = "zxc";
    const newClient = await addClient(client);

    return newClient;
  };

  updateClient = async (clientId: string, client: ClientProps) => {
    const newClient = await updateClient(clientId, client);

    return newClient;
  };

  regenerateSecret = async (clientId: string) => {
    const secret = await regenerateSecret(clientId);

    return secret;
  };

  deleteClient = async (clientId: string) => {
    await deleteClient(clientId);
  };

  fetchScope = async (name: string) => {
    const scope = await getScope(name);

    return scope;
  };

  fetchScopes = async () => {
    const scopes = await getScopeList();

    this.scopes = scopes;
  };

  get clientList() {
    return this.clients;
  }

  get scopeList() {
    return this.scopes;
  }
}

export default OAuthStore;
