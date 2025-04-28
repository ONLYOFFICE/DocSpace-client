import { DeviceType } from "../../../../enums";

export type ChatBodyProps = {
  children: React.ReactNode;
  isFullScreen: boolean;
  currentDeviceType: DeviceType;
};
