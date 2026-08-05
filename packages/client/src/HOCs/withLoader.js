/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { observer, inject } from "mobx-react";
import { useLocation } from "react-router";
import { TableSkeleton, RowsSkeleton } from "@docspace/shared/skeletons";
import { TilesSkeleton } from "@docspace/shared/skeletons/tiles";

const withLoader = (WrappedComponent) => (Loader) => {
  const LoaderWrapper = (props) => {
    const {
      isInit,
      tReady,
      isLoaded,
      isRooms,
      viewAs,
      showBodyLoader,
      isLoadingFilesFind,
      accountsViewAs,
    } = props;

    const location = useLocation();

    const currentViewAs =
      location.pathname.includes("/accounts/people") ||
      location.pathname.includes("/accounts/groups")
        ? accountsViewAs
        : viewAs;

    const showLoader = window?.ClientConfig?.loaders?.showLoader;

    return !isLoaded ||
      showBodyLoader ||
      (isLoadingFilesFind && !Loader) ||
      !tReady ||
      !isInit ? (
      Loader ||
        (!showLoader ? null : currentViewAs === "tile" ? (
          <TilesSkeleton isRooms={isRooms} />
        ) : currentViewAs === "table" ? (
          <TableSkeleton />
        ) : (
          <RowsSkeleton />
        ))
    ) : (
      <WrappedComponent {...props} />
    );
  };

  return inject(
    ({
      authStore,
      filesStore,
      treeFoldersStore,
      peopleStore,
      clientLoadingStore,
      publicRoomStore,
      settingsStore,
    }) => {
      const { viewAs, isLoadingFilesFind, isInit } = filesStore;
      const { isRoomsFolder, isArchiveFolder } = treeFoldersStore;
      const { viewAs: accountsViewAs } = peopleStore;
      const { firstLoad, isLoading, showBodyLoader } = clientLoadingStore;

      const { setIsBurgerLoading } = settingsStore;
      const { isPublicRoom } = publicRoomStore;

      const isRooms = isRoomsFolder || isArchiveFolder;

      return {
        isRooms,
        firstLoad: isPublicRoom ? false : firstLoad,
        isLoaded: isPublicRoom ? true : authStore.isLoaded,
        isLoading,
        viewAs,
        setIsBurgerLoading,
        isLoadingFilesFind,
        isInit: isPublicRoom ? true : isInit,
        showBodyLoader,
        accountsViewAs,
      };
    },
  )(observer(LoaderWrapper));
};
export default withLoader;
