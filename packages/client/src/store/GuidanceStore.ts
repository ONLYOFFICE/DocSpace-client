import { makeAutoObservable } from "mobx";
import { TTranslation } from "@docspace/shared/types";
import {
  GuidanceStep,
  GuidanceElementType,
} from "@docspace/shared/components/guidance/sub-components/Guid.types";

import FilesStore from "SRC_DIR/store/FilesStore";

class GuidanceStore {
  config: GuidanceStep[] = [];

  filesStore;

  constructor(filesStore: FilesStore) {
    this.filesStore = filesStore;
    makeAutoObservable(this);
  }

  setConfig = (config: GuidanceStep[]) => {
    this.config = config;
  };

  getFormFillingConfig(t: TTranslation) {
    const config = [
      {
        id: 1,
        header: t("HeaderStarting"),
        description: t("TitleStarting"),
        key: "form-filling-starting",
        position: [
          {
            type: GuidanceElementType.Mixed,
            rects: this.filesStore.pdfGuidRects,
            offset: {
              value: 4,
              row: 15,
              table: 3,
            },
          },
        ],
      },
      {
        id: 2,
        header: t("HeaderSharing"),
        description: t("TitleSharing", {
          productName: t("Common:ProductName"),
        }),
        key: "form-filling-sharing",
        position: [
          {
            type: GuidanceElementType.Content,
            rects: this.filesStore.shareGuidRects,
            offset: {
              value: 4,
            },
            smallBorder: true,
          },
        ],
      },
      {
        id: 3,
        header: t("HeaderSubmitting"),
        description: t("TitleSubmitting"),
        key: "form-filling-submitting",
        position: [
          {
            type: GuidanceElementType.Mixed,
            rects: this.filesStore.readyGuidRects,
            offset: {
              value: 4,
              row: 15,
              table: 3,
            },
          },
        ],
      },
      {
        id: 4,
        header: t("HeaderComplete"),
        description: t("TitleComplete"),
        key: "form-filling-complete",
        position: [
          {
            type: GuidanceElementType.Mixed,
            rects: this.filesStore.readyGuidRects,
            offset: {
              value: 4,
              row: 15,
              table: 3,
            },
          },
        ],
      },
      {
        id: 5,
        header: t("HeaderUploading"),
        description: t("TitleUploading"),
        key: "form-filling-uploading",
        position: [
          {
            type: GuidanceElementType.UploadArea,
            rects: this.filesStore.uploadingGuidRects,
            offset: {
              value: 9,
            },
            smallBorder: true,
          },
          {
            type: GuidanceElementType.Content,
            rects: this.filesStore.mainButtonGuidRect,
            offset: {
              value: 4,
            },
            smallBorder: true,
          },
        ],
      },
    ];

    return config;
  }
}

export default GuidanceStore;
