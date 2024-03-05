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
