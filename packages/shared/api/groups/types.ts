export type TGroupManager = {
  avatarSmall: string;
  displayName: string;
  hasAvatar: boolean;
  id: string;
  profileUrl: string;
};

export type TApiGroup = {
  category: string;
  id: string;
  manager: TGroupManager;
  name: string;
  parent: string;
};

export type TGroup = TApiGroup & {
  isGroup: true;
};
