import { IInitialConfig } from "@/types";
import {
  setEncryptionKeys,
  getEncryptionAccess,
} from "@docspace/shared/api/files";
import { TUser } from "@docspace/shared/api/people/types";
import { toastr } from "@docspace/shared/components/toast";
import { Nullable, TTranslation } from "@docspace/shared/types";
import { regDesktop } from "@docspace/shared/utils/desktop";

const initDesktop = (
  cfg: IInitialConfig,
  user: TUser,
  fileId: string | number,
  t: Nullable<TTranslation>,
) => {
  const encryptionKeys = cfg?.editorConfig?.encryptionKeys;
  regDesktop(
    user,
    !!encryptionKeys,
    encryptionKeys,
    (keys) => {
      setEncryptionKeys(keys);
    },
    true,
    (callback) => {
      getEncryptionAccess?.(fileId)
        ?.then((keys) => {
          var data = {
            keys,
          };

          callback?.(data);
        })
        .catch((error) => {
          toastr.error(
            typeof error === "string" ? error : error.message,
            "",
            0,
            true,
          );
        });
    },
    t,
  );
};

export default initDesktop;
