import { DeviceType } from "../../../../enums";

export type FilesSelectorProps = {
  showSelector: boolean;
  toggleSelector: () => void;

  currentDeviceType: DeviceType;
};

export type ChatInputProps = {
  displayFileExtension: boolean;
  getIcon: (size: number, fileExst: string) => string;
} & Pick<FilesSelectorProps, "currentDeviceType">;
