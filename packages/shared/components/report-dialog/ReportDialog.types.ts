import type FirebaseHelper from "../../utils/firebase";
import type { TUser } from "../../api/people/types";
import type { DeviceType } from "../../enums";

export interface ReportDialogProps {
  onClose: VoidFunction;
  visible: boolean;
  error: Error;
  user: TUser;
  version: string;
  firebaseHelper: FirebaseHelper;
  currentDeviceType: DeviceType;
}
