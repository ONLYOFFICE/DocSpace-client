import { EmployeeType } from "@docspace/shared/enums";

const changeTypeKeys = {
  1: {
    single: "ChangeGuestsTypeToManager",
    multiple: "ChangeGuestsTypeToManagerMulti",
  },
  3: {
    single: "ChangeGuestsTypeToAdmin",
    multiple: "ChangeGuestsTypeToAdminMulti",
  },
  4: {
    single: "ChangeGuestsTypeToUser",
    multiple: "ChangeGuestsTypeToUserMulti",
  },
  default: {
    single: "ChangeGuestsTypeMessage",
    multiple: "ChangeGuestsTypeMessageMulti",
  },
} as const;

export const getChangeTypeKey = (
  type: EmployeeType,
  isSingle: boolean,
): string => {
  const typeKeys =
    changeTypeKeys[type as keyof typeof changeTypeKeys] ??
    changeTypeKeys.default;
  return typeKeys[isSingle ? "single" : "multiple"];
};
