import { DeviceType } from "../../../../enums";

import { TGetIcon } from "../../types";

export type FilesSelectorProps = {
  showSelector: boolean;
  toggleSelector: () => void;

  currentDeviceType: DeviceType;
};

export type ChatInputProps = {
  displayFileExtension: boolean;

  getIcon: TGetIcon;
} & Pick<FilesSelectorProps, "currentDeviceType">;
