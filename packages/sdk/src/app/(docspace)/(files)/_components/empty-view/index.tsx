import { useTranslation } from "react-i18next";

import { EmptyView as EmptyViewComponent } from "@docspace/shared/components/empty-view";
import FilesFilter from "@docspace/shared/api/files/filter";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";

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

  const isRoot = current.parentId === current.rootFolderId;
  const { isBase: isBaseTheme } = useTheme();

  const title = isFiltered
    ? t("Common:NoFindingsFound")
    : isRoot
      ? getRootTitle(t)
      : getTitle(t);
  const description = isFiltered
    ? t("Common:EmptyFilterFilesDescription")
    : isRoot
      ? getRootDescription(t)
      : getDescription(t);
  const icon = isFiltered
    ? getFilterIcon(isBaseTheme)
    : isRoot
      ? getRootIcon(isBaseTheme)
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

  return (
    <EmptyViewComponent
      icon={icon}
      title={title}
      description={description}
      options={isFiltered ? filterOptions : []}
    />
  );
};

export default EmptyView;
