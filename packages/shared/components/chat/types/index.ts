import { DeviceType } from "../../../enums";
import { TFile } from "../../../api/files/types";
import { TUser } from "../../../api/people/types";

import { TSelectorItem } from "../../selector";

import { ChatMessageType } from "./chat";

export type TGetIcon = (size: number, fileExst: string) => string;

type GeneralTypes = {
  isFullScreen: boolean;
  currentDeviceType: DeviceType;
};

export type SelectChatProps = GeneralTypes;

export type ChatHeaderProps = GeneralTypes & {
  isPanel: boolean;
};

export type ChatBodyProps = GeneralTypes;

export type FilePreviewProps = {
  files: TSelectorItem[];
  displayFileExtension: boolean;

  withRemoveFile?: boolean;

  getIcon: TGetIcon;
};

export type MessageProps = Pick<
  FilePreviewProps,
  "displayFileExtension" | "getIcon"
> & {
  message: ChatMessageType;

  vectorizedFiles: TFile[];
  user: TUser;

  isFullScreen: boolean;
};

export type ChatProps = GeneralTypes &
  Pick<FilePreviewProps, "displayFileExtension" | "getIcon"> & {
    aiChatID: string;
    aiSelectedFolder: string | number;
    aiUserId: string;

    vectorizedFiles: TFile[];

    user: TUser;
  };
