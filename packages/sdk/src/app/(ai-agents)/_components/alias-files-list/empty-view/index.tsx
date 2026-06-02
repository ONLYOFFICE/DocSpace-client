import { useTranslation } from "react-i18next";

import { EmptyView as EmptyViewComponent } from "@docspace/shared/components/empty-view";
import type { EmptyViewOptionsType } from "@docspace/ui-kit/components/empty-view";
import FilesFilter from "@docspace/shared/api/files/filter";
import { FolderType } from "@docspace/shared/enums";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getBrandName } from "@docspace/shared/constants/brands";

import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import UploadPDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.pdf.form.svg";
import UploadDevicePDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";

import { useAgentsAIConfigStore } from "../../../_store";
import useKnowledgeUpload from "../../../_hooks/useKnowledgeUpload";
import KnowledgeDisabledContainer from "./KnowledgeDisabledContainer";

import {
  getRootDescription,
  getRootTitle,
  getIcon,
  getTitle,
  getDescription,
  getRootIcon,
  getFilterIcon,
} from "./EmptyView.helpers";
import { EmptyViewProps } from "./EmptyView.types";

const EmptyView = ({
  current,
  folderId,
  isFiltered,
  shareKey,
}: EmptyViewProps) => {
  const { t } = useTranslation(["Common"]);

  const isRoot =
    current.id === current.rootFolderId ||
    current.parentId === current.rootFolderId;
  const { isBase: isBaseTheme } = useTheme();
  const aiConfigStore = useAgentsAIConfigStore();
  // Resolve upload handlers up-front (Rules of Hooks: no hook calls
  // after the conditional early-return for KnowledgeDisabledContainer).
  const { onUploadFromDocSpace, onUploadFromDevice } = useKnowledgeUpload();

  const rootFolderType = current.rootFolderType;

  // Knowledge folder + vectorization disabled in the portal — server
  // rejects any copy/upload here, so render the "configure provider"
  // placeholder instead of the regular empty view + upload CTAs. Mirrors
  // client's Section/Body branch (Home/Section/Body/index.js:492-497).
  if (
    !isFiltered &&
    current.type === FolderType.Knowledge &&
    aiConfigStore.aiConfig &&
    !aiConfigStore.aiConfig.vectorizationEnabled
  ) {
    return <KnowledgeDisabledContainer />;
  }

  const title = isFiltered
    ? t("Common:NoFindingsFound")
    : isRoot
      ? getRootTitle(t, rootFolderType)
      : getTitle(t, current.type);
  const description = isFiltered
    ? t("Common:EmptyFilterFilesDescription")
    : isRoot
      ? getRootDescription(t, rootFolderType)
      : getDescription(t, current.type);
  const icon = isFiltered
    ? getFilterIcon(isBaseTheme)
    : isRoot
      ? getRootIcon(isBaseTheme, rootFolderType)
      : getIcon(isBaseTheme);

  const onResetFilter = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.preventDefault();

    const defaultFilter = FilesFilter.getDefault();

    defaultFilter.folder = folderId.toString();
    defaultFilter.key = shareKey ?? "";

    window.history.pushState(null, "", `?${defaultFilter.toUrlParams()}`);
  };

  const filterOptions = [
    {
      key: "empty-view-filter",
      to: "",
      description: t("Common:ClearFilter"),
      icon: <ClearEmptyFilterSvg />,
      onClick: onResetFilter,
      isNext: true,
    },
  ];

  // Knowledge empty view exposes the same Upload options as the filter
  // main-button (From portal / From device); handlers come from
  // `useKnowledgeUpload` (resolved at the top of the component so the
  // KnowledgeDisabledContainer branch doesn't violate Rules of Hooks).
  // Knowledge is detected by `current.type` (not `rootFolderType`, which
  // is the parent room's type).
  const showUploadOptions =
    !isFiltered && current.type === FolderType.Knowledge;

  const uploadOptions: EmptyViewOptionsType = [
    {
      key: "knowledge-empty-upload-from-docspace",
      title: t("EmptyView:UploadFromPortalTitle", {
        productName: getBrandName("ProductName"),
        defaultValue: "Upload from {{productName}}",
      }),
      description: t("Common:UploadFilesPortal", {
        sectionNameFirst: t("Common:MyDocuments"),
        sectionNameSecond: t("Common:Rooms"),
        defaultValue:
          "Pick files from {{sectionNameFirst}} or {{sectionNameSecond}}.",
      }),
      icon: <UploadPDFFormIcon />,
      onClick: onUploadFromDocSpace,
    },
    {
      key: "knowledge-empty-upload-from-device",
      title: t("EmptyView:UploadDeviceOptionTitle", {
        defaultValue: "Upload from device",
      }),
      description: t("Common:UploadFilesDevice", {
        defaultValue: "Pick files from your device.",
      }),
      icon: <UploadDevicePDFFormIcon />,
      onClick: onUploadFromDevice,
    },
  ];

  const options = isFiltered
    ? filterOptions
    : showUploadOptions
      ? uploadOptions
      : [];

  return (
    <EmptyViewComponent
      icon={icon}
      title={title}
      description={description}
      options={options}
    />
  );
};

export default EmptyView;
