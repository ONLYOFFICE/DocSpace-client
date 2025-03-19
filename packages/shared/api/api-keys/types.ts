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
  //   permissions: [];
};
