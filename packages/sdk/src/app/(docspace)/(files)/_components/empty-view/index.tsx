import { useTranslation } from "react-i18next";

import { ThemeKeys } from "@docspace/shared/enums";
import { EmptyView as EmptyViewComponent } from "@docspace/shared/components/empty-view";

import {
  getRootDescription,
  getRootTitle,
  getIcon,
  getTitle,
  getDescription,
  getRootIcon,
} from "./EmptyView.helpers";
import { EmptyViewProps } from "./EmptyView.types";

const EmptyView = ({ theme, current }: EmptyViewProps) => {
  const { t } = useTranslation(["Common"]);

  const isRoot = current.parentId === current.rootFolderId;

  const title = isRoot ? getRootTitle(t) : getTitle(t);
  const description = isRoot ? getRootDescription(t) : getDescription(t);
  const icon = isRoot
    ? getRootIcon(theme === ThemeKeys.BaseStr)
    : getIcon(theme === ThemeKeys.BaseStr);

  return (
    <EmptyViewComponent
      icon={icon}
      title={title}
      description={description}
      options={[]}
    />
  );
};

export default EmptyView;
