// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import CatalogSettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.react.svg?url";
import DefaultLogoUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";

import React, { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { ReactSVG } from "react-svg";

import { Row } from "@docspace/shared/components/rows";
import { toastr } from "@docspace/shared/components/toast";

import ChangeStorageQuotaDialog from "client/ChangeStorageQuotaDialog";

import { TPortals } from "SRC_DIR/types/spaces";
import { useStore } from "SRC_DIR/store";

import { RoomContent } from "./RoomContent";

const StyledRoomRow = styled(Row)`
  padding: 4px 0;

  .styled-element {
    width: 32px;
    margin-inline-start: 20px;
  }

  .row_context-menu-wrapper {
    margin-inline-end: 18px;
  }

  .logo-icon > div {
    svg {
      width: 32px;
      height: 32px;
    }
  }
`;

type TRow = {
  item: TPortals;
};
const SpacesRoomRow = ({ item }: TRow) => {
  const { t } = useTranslation(["Common", "Files", "Settings", "Management"]);
  const { spacesStore, settingsStore } = useStore();
  const { setDeletePortalDialogVisible, setCurrentPortal } = spacesStore;
  const { tenantAlias, getAllPortals, theme, portals } = settingsStore;

  const [isVisibleDialog, setIsVisibleDialog] = useState(false);
  const [isDisableQuota, setIsDisableQuota] = useState(false);

  const onDelete = () => {
    if (portals.length === 1) {
      return toastr.error(t("Management:DeleteWarning"));
    }
    setCurrentPortal(item);
    setDeletePortalDialogVisible(true);
  };

  const logoElement = (
    <ReactSVG id={item.portalName} src={DefaultLogoUrl} className="logo-icon" />
  );

  const protocol = window?.location?.protocol;

  const contextOptionsProps = [
    {
      label: t("Files:Open"),
      key: "space_open",
      icon: ExternalLinkIcon,
      onClick: () => window.open(`${protocol}//${item.domain}/`, "_blank"),
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

  if (item.wizardSettings.completed) {
    contextOptionsProps.splice(
      1,
      0,
      {
        label: t("Common:Settings"),
        key: "space_settings",
        icon: CatalogSettingsReactSvgUrl,
        onClick: () =>
          window.open(`${protocol}//${item.domain}/portal-settings/`, "_blank"),
      },
      {
        label: t("Common:ManageStorageQuota"),
        key: "change_quota",
        icon: ChangQuotaReactSvgUrl,
        onClick: () => {
          setIsVisibleDialog(true);
          isDisableQuota && setIsDisableQuota(false);
        },
      },
      {
        key: "disable_quota",
        label: t("Common:DisableQuota"),
        icon: DisableQuotaReactSvgUrl,
        onClick: () => {
          setIsVisibleDialog(true);
          setIsDisableQuota(true);
        },
      }
    );
  }
  const updateFunction = async () => {
    await getAllPortals();
  };

  const onCloseClick = () => {
    setIsVisibleDialog(false);
  };

  const isCurrentPortal = tenantAlias === item.portalName;

  return (
    <>
      <ChangeStorageQuotaDialog
        isVisible={isVisibleDialog}
        updateFunction={updateFunction}
        onClose={onCloseClick}
        portalInfo={item}
        isDisableQuota={isDisableQuota}
      />
      <StyledRoomRow
        contextOptions={contextOptionsProps}
        element={logoElement}
        key={item.portalName}
        theme={theme}
      >
        <RoomContent
          item={item}
          isCurrentPortal={isCurrentPortal}
          theme={theme}
        />
      </StyledRoomRow>
    </>
  );
};

export default observer(SpacesRoomRow);
