import {
  EmployeeActivationStatus,
  EmployeeStatus,
  ThemeKeys,
} from "../../enums";

export type TUserGroup = {
  id: string;
  manager: string;
  name: string;
};

export type TUser = {
  access: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  status: EmployeeStatus;
  activationStatus: EmployeeActivationStatus;
  department: string;
  workFrom: string;
  avatarMax: string;
  avatarMedium: string;
  avatarOriginal: string;
  avatar: string;
  isAdmin: boolean;
  isRoomAdmin: boolean;
  isLDAP: boolean;
  listAdminModules: string[];
  isOwner: boolean;
  isVisitor: boolean;
  isCollaborator: boolean;
  mobilePhoneActivationStatus: number;
  isSSO: boolean;
  quotaLimit?: number;
  usedSpace?: number;
  id: string;
  displayName: string;
  avatarSmall: string;
  profileUrl: string;
  hasAvatar: boolean;
  theme?: ThemeKeys;
  mobilePhone?: string;
  cultureName?: string;
  groups?: TUserGroup[];
};

export type TGetUserList = {
  items: TUser[];
  total: number;
};

export type TChangeTheme = {
  theme: ThemeKeys;
};
