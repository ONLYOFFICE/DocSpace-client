import { EmployeeType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";

type TranslationType = "single" | "multiple";

type TranslationValuesType = {
  userName: string | undefined;
  membersSection: string;
  documentsSection: string;
  productName: string;
  secondType: string;
};

export const getChangeTypeKey = (
  type: EmployeeType,
  isSingle: boolean,
  t: TTranslation,
  translationValues: TranslationValuesType,
) => {
  const { userName, ...restValues } = translationValues;
  const values = userName ? { ...restValues, userName } : restValues;

  const translateKey: Record<TranslationType, Record<EmployeeType, string>> = {
    single: {
      [EmployeeType.RoomAdmin]: `${t("ChangeGuestsTypeToManager", values)}`,
      [EmployeeType.Admin]: `${t("ChangeGuestsTypeToAdmin", values)}`,
      [EmployeeType.User]: `${t("ChangeGuestsTypeMessage", values)}`,
      [EmployeeType.Guest]: "",
      [EmployeeType.Owner]: "",
    },
    multiple: {
      [EmployeeType.RoomAdmin]: `${t("ChangeGuestsTypeToManagerMulti", values)}`,
      [EmployeeType.Admin]: `${t("ChangeGuestsTypeToAdminMulti", values)}`,
      [EmployeeType.User]: `${t("ChangeGuestsTypeMessageMulti", values)}`,
      [EmployeeType.Guest]: "",
      [EmployeeType.Owner]: "",
    },
  };
  return translateKey[isSingle ? "single" : "multiple"][type];
};
