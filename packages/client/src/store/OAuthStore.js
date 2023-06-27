import { makeAutoObservable, runInAction } from "mobx";

const clients = [...Array(5)].map((value, index) => {
  return {
    id: index,
    name: `46192a5a-e19c-${index}`,
    description: "Demo description",
    client_id: "46192a5a-e19c-453c-aec3-50617290edbe",
    client_secret: "e5ff57e4-4ce2-4dac-a265-88bc7e726684",
    root_url: "https://google.com",
    redirect_uris: ["https://openidconnect.net/callback"],
    allowed_origins: [
      "https://google.com",
      "https://openidconnect.net/callback",
    ],
    scopes: [
      "files:write",
      "accounts:write",
      "files:read",
      "account.self:write",
      "rooms:read",
      "accounts:read",
      "account.self:read",
      "rooms:write",
    ],
    enabled: true,
  };
});

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
