// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useState } from "react";
import { observer, inject } from "mobx-react";
import { useLocation } from "react-router-dom";
import { TableSkeleton } from "@docspace/shared/skeletons";
import { RowsSkeleton } from "@docspace/shared/skeletons";
import { TilesSkeleton } from "@docspace/shared/skeletons/tiles";

const pathname = window.location.pathname.toLowerCase();
const isEditor = pathname.indexOf("doceditor") !== -1;
const isGallery = pathname.indexOf("form-gallery") !== -1;

const withLoader = (WrappedComponent) => (Loader) => {
  const withLoader = (props) => {
    const {
      isInit,
      tReady,
      firstLoad,
      isLoaded,

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

    return (!isEditor && firstLoad && !isGallery) ||
      !isLoaded ||
      showBodyLoader ||
      (isLoadingFilesFind && !Loader) ||
      !tReady ||
      !isInit ? (
      Loader ? (
        Loader
      ) : currentViewAs === "tile" ? (
        <TilesSkeleton />
      ) : currentViewAs === "table" ? (
        <TableSkeleton />
      ) : (
        <RowsSkeleton />
      )
    ) : (
      <WrappedComponent {...props} />
    );
  };

  return inject(
    ({
      authStore,
      filesStore,
      peopleStore,
      clientLoadingStore,
      publicRoomStore,
      settingsStore,
    }) => {
      const { viewAs, isLoadingFilesFind, isInit } = filesStore;
      const { viewAs: accountsViewAs } = peopleStore;

      const { firstLoad, isLoading, showBodyLoader } = clientLoadingStore;

      const { setIsBurgerLoading } = settingsStore;
      const { isPublicRoom } = publicRoomStore;

      return {
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
  )(observer(withLoader));
};
export default withLoader;
