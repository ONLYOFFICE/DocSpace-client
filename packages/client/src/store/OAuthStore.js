import { makeAutoObservable, runInAction } from "mobx";

const clients = [...Array(5)].map((value, index) => {
  return {
    enabled: true,
    id: index,
    name: `7383bc80-b0ad-4fad-8850-${index}`,
    description: "Application description",
    client_id: "46192a5a-e19c-453c-aec3-50617290edbe",
    client_secret: "e5ff57e4-4ce2-4dac-a265-88bc7e726684",
    root_url: "https://google.com",
    redirect_uris: ["https://openidconnect.net/callback"],
    allowed_origins: [
      "https://google.com",
      "https://openidconnect.net/callback",
    ],
    scopes: ["accounts:write", "accounts:read"],
    logo_uri: "https://logo2.example",
    policy_uri: "https://policy2.example",
    terms_uri: "https://terms2.example",
    state: "draft",
  };
});

const scopes = [
  "files:read",
  "files:write",
  "rooms:read",
  "rooms:write",
  "account.self:read",
  "account.self:write",
  "accounts:read",
  "accounts:write",
];

class OAuthStore {
  clients = [];
  currentClient = clients[0];

  constructor() {
    makeAutoObservable(this);
  }

  getClients = () => {
    this.clients = clients;
  };

  setCurrentClient = (client) => {
    this.currentClient = client;
  };

  addClient = (client) => {
    this.clients = [...this.clients, client];
  };

  setEnabled = (id) => {
    const index = this.clients.findIndex((proj) => proj.id === id);

    this.clients[index].enabled = !this.clients[index].enabled;
  };

  deleteClient = (id) => {
    this.clients = this.clients.filter((proj) => proj.id !== id);
  };

  editClient = (client) => {
    const index = this.clients.findIndex((proj) => proj.id === client.id);

    runInAction(() => {
      this.clients[index] = client;
    });
  };
}

export default OAuthStore;
