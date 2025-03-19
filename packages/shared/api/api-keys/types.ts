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
  keyPrefix: string;
  name: string;
  lastUsed: string;
  expiresAt: string;
  //   permissions: [];
};

export type TApiKeyRequest = {
  name: string;
  expiresInDays?: number;
};
