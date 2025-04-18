export type TApiKey = {
  id: number;
  createBy: {
    avatarMax: string;
    avatarMedium: string;
    avatarOriginal: string;
    avatarSmall: string;
    displayName: string;
    hasAvatar: boolean;
    id: string;
    isAnonim: boolean;
  };
  createOn: string;
  isActive: boolean;
  key: string;
  name: string;
  lastUsed: string;
  expiresAt: string;
  permissions: string[];
};

export type TApiKeyRequest = {
  name: string;
  expiresInDays?: string;
};

export type TApiKeyParamsRequest = {
  permissions?: string[];
  name?: string;
  isActive?: boolean;
};
