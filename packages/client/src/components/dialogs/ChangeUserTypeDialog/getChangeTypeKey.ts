import { EmployeeType } from "@docspace/shared/enums";

type TranslationType = "single" | "multiple";

export const getChangeTypeKey = (type: EmployeeType, isSingle: boolean) => {
  const translateKey: Record<TranslationType, Record<EmployeeType, string>> = {
    single: {
      [EmployeeType.RoomAdmin]: "ChangeGuestsTypeToManager",
      [EmployeeType.Admin]: "ChangeGuestsTypeToAdmin",
      [EmployeeType.User]: "ChangeGuestsTypeToUser",
      [EmployeeType.Guest]: "",
      [EmployeeType.Owner]: "",
    },
    multiple: {
      [EmployeeType.RoomAdmin]: "ChangeGuestsTypeToManagerMulti",
      [EmployeeType.Admin]: "ChangeGuestsTypeToAdminMulti",
      [EmployeeType.User]: "ChangeGuestsTypeToUserMulti",
      [EmployeeType.Guest]: "",
      [EmployeeType.Owner]: "",
    },
  };
  return translateKey[isSingle ? "single" : "multiple"][type];
};
