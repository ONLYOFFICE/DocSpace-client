import { TTranslation } from "@docspace/shared/types";
import { RoomsType } from "@docspace/shared/enums";
import { getFormFillingConfig } from "./form-filling";
import type { GuidanceStep } from "../sub-components/Guid.types";
import { GuidanceConfig } from "./configs.types";

export const getGuidanceConfig = (
  type: RoomsType,
  t: TTranslation,
): GuidanceStep[] => {
  const config: GuidanceConfig = { t };

  switch (type) {
    case RoomsType.FormRoom:
      return getFormFillingConfig(config);
    default:
      return [];
  }
};
