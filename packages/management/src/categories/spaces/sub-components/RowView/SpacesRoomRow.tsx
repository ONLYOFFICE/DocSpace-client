import React from "react";
import Row from "@docspace/components/row";
import { RoomContent } from "./RoomContent";
import { observer } from "mobx-react";
import styled from "styled-components";
import CatalogSettingsReactSvgUrl from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.react.svg?url";
import DefaultLogoUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import { useTranslation } from "react-i18next";
import { TPortals } from "SRC_DIR/types/spaces";

import { ReactSVG } from "react-svg";
import { useStore } from "SRC_DIR/store";

const StyledRoomRow = styled(Row)`
  padding: 4px 0;

  .styled-element {
    width: 32px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 20px;`
        : `margin-left: 20px`}
  }

  .row_context-menu-wrapper {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 18px;`
        : `margin-right: 18px;`}
  }
`;

type TRow = {
  item: TPortals;
};
const SpacesRoomRow = ({ item }: TRow) => {
  const { spacesStore, authStore } = useStore();
  const { setDeletePortalDialogVisible, setCurrentPortal } = spacesStore;
  const { tenantAlias } = authStore.settingsStore;


  const onDelete = () => {
    setCurrentPortal(item);
    setDeletePortalDialogVisible(true)
  }

  const { t } = useTranslation(["Common", "Files", "Settings"]);

  const logoElement = <ReactSVG id={item.key} src={DefaultLogoUrl} />
  

  const protocol = window?.location?.protocol;

  const contextOptionsProps = [
    {
      label: t("Files:Open"),
      key: "space_open",
      icon: ExternalLinkIcon,
      onClick: () => window.open(`${protocol}//${item.domain}/`, "_blank"),
    },
    {
      label: t("Common:Settings"),
      key: "space_settings",
      icon: CatalogSettingsReactSvgUrl,
      onClick: () =>
        window.open(`${protocol}//${item.domain}/portal-settings/`, "_blank"),
    },
    {
      key: "separator",
      isSeparator: true,
    },
    {
      label: t("Common:Delete"),
      key: "space_delete",
      icon: DeleteReactSvgUrl,
      onClick: onDelete,
    },
  ];

  const isCurrentPortal = tenantAlias === item.portalName;

  return (
    <StyledRoomRow
      contextOptions={contextOptionsProps}
      element={logoElement}
      key={item.id}
      data={item}
    >
      <RoomContent item={item} isCurrentPortal={isCurrentPortal} />
    </StyledRoomRow>
  );
};

export default observer(SpacesRoomRow);
