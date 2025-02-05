import { makeAutoObservable } from "mobx";
import { TTranslation } from "@docspace/shared/types";
import {
  GuidanceStep,
  GuidanceElementType,
} from "@docspace/shared/components/guidance/sub-components/Guid.types";

import FilesStore from "SRC_DIR/store/FilesStore";

class GuidanceStore {
  config: GuidanceStep[] | null = null;

  filesStore;

  constructor(filesStore: FilesStore) {
    this.filesStore = filesStore;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  getFormFillingConfig(t: TTranslation) {
    console.log("rerender config");
    const config = [
      {
        id: 1,
        header: t("HeaderStarting"),
        description: t("TitleStarting"),
        key: "form-filling-starting",
        position: {
          type: GuidanceElementType.Content,
          rects: this.filesStore.pdfGuidRects,
          offset: {
            value: 4,
            row: 15,
            table: 3,
          },
        },
      },
      {
        id: 2,
        header: t("HeaderSharing"),
        description: t("TitleSharing", {
          productName: t("Common:ProductName"),
        }),
        key: "form-filling-sharing",
        position: {
          type: GuidanceElementType.Interactive,
          rects: this.filesStore.shareGuidRects,
          offset: {
            value: 2,
          },
        },
      },
      {
        id: 3,
        header: t("HeaderSubmitting"),
        description: t("TitleSubmitting"),
        key: "form-filling-submitting",
        position: {
          type: GuidanceElementType.Interactive,
          rects: this.filesStore.readyGuidRects,
          offset: {
            value: 2,
          },
        },
      },
      {
        id: 4,
        header: t("HeaderComplete"),
        description: t("TitleComplete"),
        key: "form-filling-complete",
        position: {
          type: GuidanceElementType.UploadArea,
          rects: this.filesStore.uploadingGuidRects,
          offset: {
            value: 9,
          },
        },
      },
    ];

    return config;
  }
}

export default GuidanceStore;
