import {
  GuidanceStep,
  GuidanceElementType,
  GuidanceRefKey,
} from "../sub-components/Guid.types";
import { GuidanceConfig } from "./configs.types";

export const getFormFillingConfig = ({ t }: GuidanceConfig): GuidanceStep[] => [
  {
    id: 1,
    header: t("FormFillingTipsDialog:HeaderStarting"),
    description: t("FormFillingTipsDialog:TitleStarting"),
    key: "form-filling-starting",
    placement: "dynamic",
    position: [
      {
        type: GuidanceElementType.Mixed,
        refKey: GuidanceRefKey.Pdf,
        offset: {
          value: 4,
          row: 14,
          rtl: 22,
        },
      },
    ],
  },
  {
    id: 2,
    header: t("FormFillingTipsDialog:HeaderSharing"),
    description: t("FormFillingTipsDialog:TitleSharing", {
      productName: t("Common:ProductName"),
    }),
    key: "form-filling-sharing",
    placement: "bottom",
    position: [
      {
        type: GuidanceElementType.Content,
        refKey: GuidanceRefKey.Share,
        offset: {
          left: -2,
          top: -2,
          width: 6,
          height: 5,
        },
        smallBorder: true,
      },
    ],
  },
  {
    id: 3,
    header: t("FormFillingTipsDialog:HeaderSubmitting"),
    description: t("FormFillingTipsDialog:TitleSubmitting"),
    key: "form-filling-submitting",
    placement: "bottom",
    position: [
      {
        type: GuidanceElementType.Mixed,
        refKey: GuidanceRefKey.Ready,
        offset: {
          value: 4,
          row: 14,
          rtl: 22,
        },
      },
    ],
  },
  {
    id: 4,
    header: t("FormFillingTipsDialog:HeaderComplete"),
    description: t("FormFillingTipsDialog:TitleComplete"),
    key: "form-filling-complete",
    placement: "bottom",
    position: [
      {
        type: GuidanceElementType.Mixed,
        refKey: GuidanceRefKey.Ready,
        offset: {
          value: 4,
          row: 14,
          rtl: 22,
        },
      },
    ],
  },
  {
    id: 5,
    header: t("FormFillingTipsDialog:HeaderUploading"),
    description: t("FormFillingTipsDialog:DescriptionUploading", {
      productName: t("Common:ProductName"),
      sectionName: t("Common:MyFilesSection"),
    }),
    key: "form-filling-uploading",
    placement: "side",
    position: [
      {
        type: GuidanceElementType.Content,
        refKey: GuidanceRefKey.MainButton,
        offset: {
          value: 2,
        },
        smallBorder: true,
      },
      {
        type: GuidanceElementType.Expandable,
        refKey: GuidanceRefKey.Uploading,
        size: 35,
        offset: {
          value: 9,
        },
        smallBorder: true,
      },
    ],
  },
];
