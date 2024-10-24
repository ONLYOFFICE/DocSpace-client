import { makeAutoObservable, runInAction } from "mobx";

import {
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
  TScope,
} from "@docspace/shared/utils/oauth/types";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { UserStore } from "@docspace/shared/store/UserStore";
import { Nullable, TTranslation } from "@docspace/shared/types";

import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";
import OauthRevokeSvgUrl from "PUBLIC_DIR/images/oauth.revoke.svg?url";
import GenerateIconUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import RevokeIconUrl from "PUBLIC_DIR/images/revoke.react.svg?url";
import DeleteIconUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import SettingsIconUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";

const PAGE_LIMIT = 100;

export type ViewAsType = "table" | "row";

class OAuthStore {
  userStore: Nullable<UserStore> = null;

  viewAs: ViewAsType = "table";

  currentPage: number = 0;

  nextPage: Nullable<number> = null;

  itemCount: number = 0;

  consentCurrentPage: number = 0;

  consentNextPage: Nullable<number> = null;

  consentItemCount: number = 0;

  infoDialogVisible: boolean = false;

  previewDialogVisible: boolean = false;

  disableDialogVisible: boolean = false;

  deleteDialogVisible: boolean = false;

  resetDialogVisible: boolean = false;

  generateDeveloperTokenDialogVisible: boolean = false;

  revokeDeveloperTokenDialogVisible: boolean = false;

  selection: string[] = [];

  bufferSelection: IClientProps | null = null;

  clients: IClientProps[] = [];

  activeClients: string[] = [];

  scopes: TScope[] = [];

  clientsIsLoading: boolean = true;

  consentsIsLoading: boolean = true;

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

  setGenerateDeveloperTokenDialogVisible = (value: boolean) => {
    this.generateDeveloperTokenDialogVisible = value;
  };

  setRevokeDeveloperTokenDialogVisible = (value: boolean) => {
    this.revokeDeveloperTokenDialogVisible = value;
  };

  setClientSecret = (value: string) => {
    this.clientSecret = value;
  };

  setSelection = (clientId?: string) => {
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

  setConsentsIsLoading = (value: boolean) => {
    this.consentsIsLoading = value;
  };

  setActiveClient = (clientId?: string) => {
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
        this.clients = [...clientList.data];
        this.selection = [];
        this.currentPage = clientList.page;
        this.nextPage = clientList.next;

        if (clientList.next) {
          this.itemCount = clientList.data.length + 2;
        } else {
          this.itemCount = clientList.data.length;
        }
      });
      this.setClientsIsLoading(false);
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
      this.clients = [...this.clients, ...clientList.data];

      this.itemCount += clientList.data.length;
    });

    this.setClientsIsLoading(false);
  };

  fetchConsents = async () => {
    try {
      this.setClientsIsLoading(true);
      const consentList = await getConsentList(0, PAGE_LIMIT);

      runInAction(() => {
        this.consents = [...consentList.consents];
        this.selection = [];
        this.consentCurrentPage = consentList.page;
        this.consentNextPage = consentList.next;

        if (consentList.next) {
          this.consentItemCount = consentList.data.length + 2;
        } else {
          this.consentItemCount = consentList.data.length;
        }
      });
      this.setClientsIsLoading(false);
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  fetchNextConsents = async (startIndex: number) => {
    if (this.consentsIsLoading) return;

    this.setConsentsIsLoading(true);

    const page = startIndex / PAGE_LIMIT;

    runInAction(() => {
      this.consentCurrentPage = page + 1;
    });

    const consentList = await getConsentList(this.nextPage || page, PAGE_LIMIT);

    runInAction(() => {
      this.currentPage = consentList.page;
      this.nextPage = consentList.next || null;
      this.consents = [...this.consents, ...consentList.consents];

      this.consentItemCount += consentList.data.length;
    });

    this.setConsentsIsLoading(false);
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
        // this.setActiveClient(id);
        requests.push(revokeUserClient(id));
      });

      await Promise.all(requests);

      runInAction(() => {
        this.consents = this.consents.filter(
          (c) => !clientsId.includes(c.clientId),
        );
      });

      // this.setActiveClient("");
    } catch (e) {
      const err = e as TData;
      toastr.error(err);
    }
  };

  onEnable = async (t: TTranslation) => {
    this.setPreviewDialogVisible(false);
    this.setInfoDialogVisible(false);
    this.setRevokeDialogVisible(false);
    this.setDisableDialogVisible(false);
    this.setDeleteDialogVisible(false);
    this.setGenerateDeveloperTokenDialogVisible(false);
    this.setRevokeDeveloperTokenDialogVisible(false);

    const isGroup = this.selection.length;

    if (isGroup) {
      try {
        const actions: Promise<void>[] = [];

        this.selectionToEnable.forEach((s) => {
          if (!this.clientList.find((c) => c.clientId === s)?.enabled)
            actions.push(this.changeClientStatus(s, true));
        });

        await Promise.all(actions);

        this.setSelection("");
        if (this.selectionToEnable.length > 1)
          toastr.success(t("OAuth:ApplicationsEnabledSuccessfully"));
        else {
          toastr.success(t("OAuth:ApplicationEnabledSuccessfully"));
        }
      } catch (e) {
        const err = e as TData;
        toastr.error(err);
      }
    } else {
      // this.setActiveClient(clientId);

      await this.changeClientStatus(this.bufferSelection!.clientId, true);

      // this.setActiveClient("");
      this.setSelection("");

      toastr.success(t("OAuth:ApplicationEnabledSuccessfully"));
    }
  };

  onDisable = () => {
    this.setPreviewDialogVisible(false);
    this.setInfoDialogVisible(false);
    this.setRevokeDialogVisible(false);
    this.setDisableDialogVisible(true);
    this.setDeleteDialogVisible(false);
    this.setGenerateDeveloperTokenDialogVisible(false);
    this.setRevokeDeveloperTokenDialogVisible(false);
  };

  onDelete = () => {
    this.setPreviewDialogVisible(false);
    this.setInfoDialogVisible(false);
    this.setRevokeDialogVisible(false);
    this.setDisableDialogVisible(false);
    this.setDeleteDialogVisible(true);
    this.setGenerateDeveloperTokenDialogVisible(false);
    this.setRevokeDeveloperTokenDialogVisible(false);
  };

  onRevoke = () => {
    this.setPreviewDialogVisible(false);
    this.setInfoDialogVisible(false);
    this.setRevokeDialogVisible(true);
    this.setDisableDialogVisible(false);
    this.setDeleteDialogVisible(false);
    this.setGenerateDeveloperTokenDialogVisible(false);
    this.setRevokeDeveloperTokenDialogVisible(false);
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
      if (isGroupContext) return;

      if (!this.selection.length) this.setBufferSelection(clientId);

      if (this.selection.length === 1) {
        this.setBufferSelection(this.selection[0]);
        this.setSelection("");
      }

      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(true);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(false);
      this.setGenerateDeveloperTokenDialogVisible(false);
      this.setRevokeDeveloperTokenDialogVisible(false);
    };

    const onGenerateDeveloperToken = () => {
      if (isGroupContext) return;

      if (!this.selection.length) this.setBufferSelection(clientId);

      if (this.selection.length === 1) {
        this.setBufferSelection(this.selection[0]);
        this.setSelection("");
      }

      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(false);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(false);
      this.setGenerateDeveloperTokenDialogVisible(true);
      this.setRevokeDeveloperTokenDialogVisible(false);
    };

    const onRevokeDeveloperToken = () => {
      if (isGroupContext) return;

      if (!this.selection.length) this.setBufferSelection(clientId);

      if (this.selection.length === 1) {
        this.setBufferSelection(this.selection[0]);
        this.setSelection("");
      }

      this.setPreviewDialogVisible(false);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(false);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(false);
      this.setGenerateDeveloperTokenDialogVisible(false);
      this.setRevokeDeveloperTokenDialogVisible(true);
    };

    const onShowPreview = () => {
      if (isGroupContext) return;

      if (!this.selection.length) this.setBufferSelection(clientId);

      if (this.selection.length === 1) {
        this.setBufferSelection(this.selection[0]);
        this.setSelection("");
      }

      this.setPreviewDialogVisible(true);
      this.setInfoDialogVisible(false);
      this.setRevokeDialogVisible(false);
      this.setDisableDialogVisible(false);
      this.setDeleteDialogVisible(false);
      this.setGenerateDeveloperTokenDialogVisible(false);
      this.setRevokeDeveloperTokenDialogVisible(false);
    };

    const openOption = {
      key: "open",
      icon: ExternalLinkReactSvgUrl,
      label: t("Files:Open"),
      onClick: () => window.open(item.websiteUrl, "_blank"),
      disabled: isInfo,
    };

    const infoOption = {
      key: "info",
      icon: SettingsIconUrl,
      label: t("Common:Info"),
      onClick: onShowInfo,
      disabled: isInfo,
    };

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

      items.push({
        key: "revoke",
        icon: OauthRevokeSvgUrl,
        label: t("Revoke"),
        onClick: this.onRevoke,
        disabled: false,
      });

      return items;
    }

    const editOption = {
      key: "edit",
      icon: PencilReactSvgUrl,
      label: t("Common:EditButton"),
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
      onClick: () => this.onEnable(t),
    };

    const disableOption = {
      key: "disable",
      icon: RemoveReactSvgUrl,
      label: t("Common:Disable"),
      onClick: this.onDisable,
    };

    const generateDeveloperTokenOption = {
      key: "generate-token",
      icon: GenerateIconUrl,
      label: t("OAuth:GenerateToken"),
      onClick: onGenerateDeveloperToken,
    };

    const revokeDeveloperTokenOption = {
      key: "revoke-token",
      icon: RevokeIconUrl,
      label: t("OAuth:RevokeDialogHeader"),
      onClick: onRevokeDeveloperToken,
    };

    const contextOptions: ContextMenuModel[] = [
      {
        key: "delete",
        label: t("Common:Delete"),
        icon: DeleteIconUrl,
        onClick: this.onDelete,
      },
    ];

    if (isGroupContext) {
      if (this.withEnabledOptions) {
        contextOptions.unshift(enableOption);
      }
      if (this.withDisabledOptions) {
        contextOptions.unshift(disableOption);
      }
    } else {
      if (item.enabled) {
        contextOptions.unshift(disableOption);
      } else {
        contextOptions.unshift(enableOption);
      }

      contextOptions.unshift({
        key: "Separator dropdownItem",
        isSeparator: true,
      });

      contextOptions.unshift(revokeDeveloperTokenOption);
      contextOptions.unshift(generateDeveloperTokenOption);

      contextOptions.unshift({
        key: "Separator-2 dropdownItem",
        isSeparator: true,
      });

      if (!isInfo) contextOptions.unshift(infoOption);
      contextOptions.unshift(authButtonOption);
      contextOptions.unshift(editOption);
    }

    return contextOptions;
  };

  getHeaderMenuItems = (t: TTranslation, isSettings?: boolean) => {
    if (!isSettings)
      return [
        {
          key: "revoke",
          iconUrl: OauthRevokeSvgUrl,
          label: t("OAuth:Revoke"),
          onClick: this.onRevoke,
          disabled: false,
        },
      ];

    return [
      {
        key: "enable",
        iconUrl: EnableReactSvgUrl,
        label: t("Common:Enable"),
        onClick: () => this.onEnable(t),
        disabled: !this.withEnabledOptions,
      },
      {
        key: "disable",
        iconUrl: RemoveReactSvgUrl,
        label: t("Common:Disable"),
        onClick: this.onDisable,
        disabled: !this.withDisabledOptions,
      },
      {
        key: "delete",
        label: t("Common:Delete"),
        iconUrl: DeleteIconUrl,
        onClick: this.onDelete,
      },
    ];
  };

  setSelections = (isChecked: boolean) => {
    if (isChecked) {
      this.selection = this.clientList.map((c) => c.clientId);
    } else {
      this.selection = [];
    }
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

  get consentHasNextPage() {
    return !!this.consentNextPage;
  }

  get scopeList() {
    return this.scopes;
  }

  get isHeaderVisible() {
    return this.selection.length;
  }

  get isHeaderIndeterminate() {
    return this.selection.length !== this.clientList.length;
  }

  get isHeaderChecked() {
    return this.selection.length === this.clientList.length;
  }

  get withEnabledOptions() {
    return this.selection
      .map((s) => {
        return !this.clientList.find((c) => c.clientId === s)?.enabled;
      })
      .some((s) => s);
  }

  get selectionToEnable() {
    return this.selection
      .map((s) => {
        if (!this.clientList.find((c) => c.clientId === s)?.enabled) return s;

        return "";
      })
      .filter((s) => !!s);
  }

  get withDisabledOptions() {
    return this.selection
      .map((s) => {
        return this.clientList.find((c) => c.clientId === s)?.enabled;
      })
      .some((s) => s);
  }

  get selectionToDisable() {
    return this.selection
      .map((s) => {
        if (this.clientList.find((c) => c.clientId === s)?.enabled) return s;

        return "";
      })
      .filter((s) => !!s);
  }
}

export default OAuthStore;
