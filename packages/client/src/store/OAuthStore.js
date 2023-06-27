import { makeAutoObservable, runInAction } from "mobx";

const projects = [...Array(10)].map((value, index) => {
  return {
    id: index,
    general: {
      name: `Project ${index}`,
      description: `Description ${index}`,
    },
    credentials: {
      client_id: "random_client_id",
      client_secret: "random_client_secret",
    },
    token: {
      enable: true,
      bearer_only: true,
      public_client: false,
    },
    scopes: {
      files: {
        read: true,
        write: true,
      },
      workspaces: {
        read: false,
        write: false,
      },
      users: {
        read: false,
        write: false,
      },
    },
    links: {
      installation_url: "https://example.com/install",
      redirect_url: "https://example.com/redirect",
      allowed_origins: "https://example.com",
    },
  };
});

class OAuthStore {
  projects = projects;
  currentProject = {};

  constructor() {
    makeAutoObservable(this);
  }

  getProjects = () => {
    this.projects = projects;
  };

  setCurrentProject = (project) => {
    this.currentProject = project;
  };

  addProject = (project) => {
    this.projects = [...this.projects, project];
  };

  setEnabled = (id) => {
    const index = this.projects.findIndex((proj) => proj.id === id);

    this.projects[index].token.enable = !this.projects[index].token.enable;
  };

  deleteProject = (id) => {
    this.projects = this.projects.filter((proj) => proj.id !== id);
  };

  editProject = (project) => {
    const index = this.projects.findIndex((proj) => proj.id === project.id);

    runInAction(() => {
      this.projects[index] = project;
    });
  };
}

export default OAuthStore;
