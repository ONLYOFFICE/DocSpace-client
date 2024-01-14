import { ThemeKeys } from "../enums";

export type TUser = {
  displayName: string;
  email: string;
  id: string;
  theme: ThemeKeys;
  isOwner: boolean;
  isAdmin: boolean;
  isVisitor: boolean;
  isCollaborator: boolean;
  listAdminModules?: string[];
  userName: string;
};
