import { useMemo } from "react";
import { ReactSVG } from "react-svg";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import Link from "@docspace/components/link";
import EmptyContainer from "./EmptyContainer";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

import EmptyScreenCanceledSvgUrl from "PUBLIC_DIR/images/empty_screen_canceled.svg?url";
import EmptyScreenCanceledDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_canceled_dark.svg?url";

import EmptyScreenDoneSvgUrl from "PUBLIC_DIR/images/empty_screen_done.svg?url";
import EmptyScreenDoneDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_done_dark.svg?url";

import EmptyScreenRoleSvgUrl from "PUBLIC_DIR/images/empty_screen_role.svg?url";
import EmptyScreenRoleDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_role_dark.svg?url";

import BoardIconSvgUrl from "PUBLIC_DIR/images/board_icon_12.svg?url";

import { RoleTypeEnum } from "@docspace/common/enums";

import type { StoreType } from "SRC_DIR/types";
import type { IRole } from "@docspace/common/Models";
import type { ThemeType } from "@docspace/components/types";

type EmptyRoleContainerProps = {
  role?: IRole;
  sectionWidth: number;
  theme: ThemeType;
  linkStyles: object;
  setIsLoading: (arg: boolean) => void;
  navigationPath: Array<{ title: string; id: number | string }>;
  rootFolderType: string;
};

type ParamType = {
  boardId: string;
};

const getIcon = (isBase: boolean, type?: RoleTypeEnum) => {
  if (!type) return "";

  if (type === RoleTypeEnum.Default)
    return isBase ? EmptyScreenRoleSvgUrl : EmptyScreenRoleDarkSvgUrl;

  if (type === RoleTypeEnum.Done)
    return isBase ? EmptyScreenDoneSvgUrl : EmptyScreenDoneDarkSvgUrl;

  if (type === RoleTypeEnum.Interrupted)
    return isBase ? EmptyScreenCanceledSvgUrl : EmptyScreenCanceledDarkSvgUrl;
};

const getHedaerText = {
  [RoleTypeEnum.Default]: "EmptyRoleHeader",
  [RoleTypeEnum.Done]: "EmptyRoleHeaderDone",
  [RoleTypeEnum.Interrupted]: "EmptyRoleHeaderCanceled",
};
const getDescription = {
  [RoleTypeEnum.Default]: "EmptyRoleDescription",
  [RoleTypeEnum.Done]: "EmptyRoleDescriptionDone",
  [RoleTypeEnum.Interrupted]: "EmptyRoleDescriptionCanceled",
};

function EmptyRoleContainer({
  role,
  theme,
  linkStyles,
  sectionWidth,
  rootFolderType,
  navigationPath,
  setIsLoading,
}: EmptyRoleContainerProps) {
  const navigate = useNavigate();
  const params = useParams<ParamType>();
  const { t } = useTranslation("EmptyRoleContainer");

  const iconSvgUrl = useMemo(
    () => getIcon(theme.isBase, role?.type),
    [theme.isBase, role?.type]
  );

  const onBackToParentFolder = () => {
    if (!params.boardId) return console.error("board id not found");

    setIsLoading(true);

    const path = getCategoryUrl(CategoryType.Dashboard, params.boardId);

    const parentIdx = navigationPath.find((v) => v.id === params.boardId);

    const state = {
      title: parentIdx?.title ?? "",
      isRoot: navigationPath.length === 1,
      rootFolderType,
    };

    navigate(path, { state });
  };

  const buttons = (
    <div className="empty-folder_container-links">
      <ReactSVG
        className="empty-folder_container_board-image"
        src={BoardIconSvgUrl}
        onClick={onBackToParentFolder}
      />
      {/*@ts-ignore */}
      <Link onClick={onBackToParentFolder} {...linkStyles}>
        {t("BackToParentDashboardButton")}
      </Link>
    </div>
  );

  if (!role) return <></>;

  return (
    <EmptyContainer
      buttons={buttons}
      imageSrc={iconSvgUrl}
      isEmptyFolderContainer
      sectionWidth={sectionWidth}
      headerText={t(getHedaerText[role.type])}
      style={{ gridColumnGap: "39px", marginTop: 32 }}
      descriptionText={t(getDescription[role.type])}
    />
  );
}

export default inject<StoreType>(
  ({ roleStore, auth, clientLoadingStore, selectedFolderStore }) => {
    const role = roleStore.role;
    const theme = (auth.settingsStore as any).theme;

    const { setIsSectionFilterLoading } = clientLoadingStore;

    const { navigationPath, rootFolderType } = selectedFolderStore;

    const setIsLoading = (arg: boolean) => {
      setIsSectionFilterLoading(arg);
    };

    return {
      role,
      theme,
      setIsLoading,
      navigationPath,
      rootFolderType,
    };
  }
)(observer(EmptyRoleContainer));
