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

import React from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

import { toastr } from "@docspace/shared/components/toast";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";
import { copyShareLink } from "@docspace/shared/components/share/Share.helpers";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie, getCorrectDate } from "@docspace/shared/utils";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";

export default function withQuickButtons(WrappedComponent) {
  class WithQuickButtons extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isLoading: false,
      };
    }

    onClickLock = () => {
      const { item, lockFileAction, t } = this.props;
      const { locked, id, security } = item;
      const { isLoading } = this.state;
      if (!security?.Lock || isLoading) return;
      this.setState({ isLoading: true });
      return lockFileAction(id, !locked)
        .then(() => toastr.success(t("Translations:FileUnlocked")))
        .catch((err) => toastr.error(err))
        .finally(() => this.setState({ isLoading: false }));
    };

    onClickDownload = () => {
      const { item } = this.props;
      window.open(item.viewUrl, "_self");
    };

    onClickFavorite = (showFavorite) => {
      const { t, item, setFavoriteAction } = this.props;

      if (showFavorite) {
        setFavoriteAction("remove", item.id)
          .then(() => toastr.success(t("RemovedFromFavorites")))
          .catch((err) => toastr.error(err));
        return;
      }

      setFavoriteAction("mark", item.id)
        .then(() => toastr.success(t("MarkedAsFavorite")))
        .catch((err) => toastr.error(err));
    };

    onClickShare = async () => {
      const { t, item, setShareChanged, getManageLinkOptions } = this.props;

      const primaryLink = await ShareLinkService.getPrimaryLink(item);

      if (primaryLink) {
        copyShareLink(item, primaryLink, t, getManageLinkOptions(item));
        setShareChanged(true);
      }
    };

    onCopyPrimaryLink = async () => {
      const { t, item, getManageLinkOptions } = this.props;
      const primaryLink = await ShareLinkService.getPrimaryLink(item);
      if (primaryLink) {
        copyShareLink(item, primaryLink, t, getManageLinkOptions(item));
        // copyShareLink(primaryLink.sharedTo.shareLink);
        // toastr.success(t("Common:LinkSuccessfullyCopied"));
      }
    };

    getStartDate = () => {
      const { roomLifetime, item } = this.props;
      const { period, value } = roomLifetime;
      const date = new Date(item.expired);

      switch (period) {
        case 0:
          return new Date(date.setDate(date.getDate() - value));
        case 1:
          return new Date(date.setMonth(date.getMonth() - value));
        case 2:
          return new Date(date.setFullYear(date.getFullYear() - value));
        default:
          break;
      }
    };

    getShowLifetimeIcon = () => {
      const { item } = this.props;

      const startDate = this.getStartDate();
      const dateDiff = moment(startDate).diff(item.expired) * 0.1;
      const showDate = moment(item.expired).add(dateDiff, "milliseconds");

      return moment().valueOf() >= showDate.valueOf();
    };

    getItemExpiredDate = () => {
      const { culture, item } = this.props;

      const locale = getCookie(LANGUAGE) || culture;
      return getCorrectDate(locale, item.expired);
    };

    onCreateRoom = () => {
      const { item, onCreateRoomFromTemplate, setBufferSelection } = this.props;
      setBufferSelection(item);

      onCreateRoomFromTemplate(item);
    };

    render() {
      const {
        t,
        theme,
        item,
        isAdmin,
        sectionWidth,
        viewAs,
        isPublicRoom,
        isPersonalRoom,
        isArchiveFolder,
        isIndexEditingMode,
        roomLifetime,
        isTemplatesFolder,
      } = this.props;

      const showLifetimeIcon =
        item.expired && roomLifetime ? this.getShowLifetimeIcon() : false;
      const expiredDate =
        item.expired && roomLifetime ? this.getItemExpiredDate() : null;

      const quickButtonsComponent = (
        <QuickButtons
          t={t}
          theme={theme}
          item={item}
          sectionWidth={sectionWidth}
          isAdmin={isAdmin}
          viewAs={viewAs}
          isPublicRoom={isPublicRoom}
          isPersonalRoom={isPersonalRoom}
          onClickDownload={this.onClickDownload}
          onClickFavorite={this.onClickFavorite}
          onClickShare={this.onClickShare}
          onClickLock={this.onClickLock}
          onCopyPrimaryLink={this.onCopyPrimaryLink}
          isArchiveFolder={isArchiveFolder}
          isIndexEditingMode={isIndexEditingMode}
          showLifetimeIcon={showLifetimeIcon}
          expiredDate={expiredDate}
          roomLifetime={roomLifetime}
          onCreateRoom={this.onCreateRoom}
          isTemplatesFolder={isTemplatesFolder}
        />
      );

      return (
        <WrappedComponent
          quickButtonsComponent={quickButtonsComponent}
          {...this.props}
        />
      );
    }
  }

  return inject(
    ({
      authStore,
      settingsStore,
      filesActionsStore,
      dialogsStore,
      publicRoomStore,
      treeFoldersStore,
      filesStore,
      infoPanelStore,
      indexingStore,
      contextOptionsStore,
      selectedFolderStore,
    }) => {
      const {
        setFavoriteAction,
        onSelectItem,
        onCreateRoomFromTemplate,
        lockFileAction,
      } = filesActionsStore;
      const { isPersonalRoom, isArchiveFolder, isTemplatesFolder } =
        treeFoldersStore;

      const { isIndexEditingMode } = indexingStore;

      const { setSharingPanelVisible } = dialogsStore;

      const { isPublicRoom } = publicRoomStore;

      const { setShareChanged, infoPanelRoomSelection } = infoPanelStore;

      const { getManageLinkOptions } = contextOptionsStore;

      return {
        theme: settingsStore.theme,
        culture: settingsStore.culture,
        isAdmin: authStore.isAdmin,
        setFavoriteAction,
        onSelectItem,
        setSharingPanelVisible,
        isPublicRoom,
        isPersonalRoom,
        isArchiveFolder,
        setShareChanged,
        isIndexEditingMode,
        roomLifetime:
          infoPanelRoomSelection?.lifetime ?? selectedFolderStore?.lifetime,
        getManageLinkOptions,
        isTemplatesFolder,
        onCreateRoomFromTemplate,
        setBufferSelection: filesStore.setBufferSelection,
        lockFileAction,
      };
    },
  )(observer(WithQuickButtons));
}
