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

import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import FilesFilter from "@docspace/shared/api/files/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { getGroup } from "@docspace/shared/api/groups";
import { getUserById } from "@docspace/shared/api/people";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

import { Events, RoomSearchArea } from "@docspace/shared/enums";
import { getObjectByLocation } from "@docspace/shared/utils/common";
import { useParams } from "react-router-dom";

import { getCategoryType, getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

const useFiles = ({
  t,

  dragging,
  setDragging,
  disableDrag,
  uploadEmptyFolders,
  startUpload,

  fetchFiles,
  fetchRooms,
  setIsLoading,

  isAccountsPage,
  isSettingsPage,

  location,

  playlist,

  getFileInfo,
  setToPreviewFile,
  setIsPreview,

  setIsUpdatingRowItem,

  gallerySelected,
  folderSecurity,
  userId,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchDefaultFiles = () => {
    const filter = FilesFilter.getDefault();

    const url = getCategoryUrl(CategoryType.Personal);

    navigate(`${url}?${filter.toUrlParams()}`);
  };

  const fetchDefaultRooms = () => {
    const filter = RoomsFilter.getDefault();

    const categoryType = getCategoryType(location);

    const url = getCategoryUrl(categoryType);

    filter.searchArea =
      categoryType === CategoryType.Shared
        ? RoomSearchArea.Active
        : RoomSearchArea.Archive;

    navigate(`${url}?${filter.toUrlParams()}`);
  };

  const onDrop = (files, uploadToFolder) => {
    if (
      folderSecurity &&
      folderSecurity.hasOwnProperty("Create") &&
      !folderSecurity.Create
    )
      return;

    dragging && setDragging(false);

    if (disableDrag) return;

    const emptyFolders = files.filter((f) => f.isEmptyDirectory);

    if (emptyFolders.length > 0) {
      uploadEmptyFolders(emptyFolders, uploadToFolder).then(() => {
        const onlyFiles = files.filter((f) => !f.isEmptyDirectory);
        if (onlyFiles.length > 0) startUpload(onlyFiles, uploadToFolder, t);
      });
    } else {
      startUpload(files, uploadToFolder, t);
    }
  };

  React.useEffect(() => {
    if (location.state?.fromMediaViewer) {
      const { fromMediaViewer, ...state } = location.state;
      // remove fromMediaViewer from location state
      return navigate(location.pathname + location.search, {
        replace: true,
        state,
      });
    }

    if (isAccountsPage || isSettingsPage) return;

    if (location.pathname === "/") setIsLoading(true, true, true);
    else setIsLoading(true, false, false);

    const categoryType = getCategoryType(location);

    let filterObj = null;
    let isRooms = false;

    if (
      window.location.href.indexOf(MEDIA_VIEW_URL) > 1 &&
      playlist.length < 1
    ) {
      setTimeout(() => {
        getFileInfo(id)
          .then((data) => {
            const canOpenPlayer =
              data.viewAccessibility.ImageView ||
              data.viewAccessibility.MediaView;
            const file = { ...data, canOpenPlayer };
            setToPreviewFile(file, true);
            setIsPreview(true);
          })
          .catch((err) => {
            toastr.error(err);
            fetchDefaultFiles();
          });
      }, 1);

      return setIsLoading(false);
    }

    if (window.location.href.indexOf(MEDIA_VIEW_URL) > 1)
      return setIsLoading(false);

    const isRoomFolder = getObjectByLocation(window.location)?.folder;

    if (
      (categoryType == CategoryType.Shared ||
        categoryType == CategoryType.SharedRoom ||
        categoryType == CategoryType.Archive) &&
      !isRoomFolder
    ) {
      filterObj = RoomsFilter.getFilter(window.location);

      isRooms = true;

      if (!filterObj) {
        fetchDefaultRooms();

        return;
      }
    } else {
      filterObj = FilesFilter.getFilter(window.location);

      if (!filterObj) {
        fetchDefaultFiles();

        return;
      }
    }

    if (!filterObj) return;

    let dataObj = { filter: filterObj };

    if (filterObj && filterObj.authorType) {
      const authorType = filterObj.authorType;
      const indexOfUnderscore = authorType.indexOf("_");
      const type = authorType.slice(0, indexOfUnderscore);
      const itemId = authorType.slice(indexOfUnderscore + 1);

      if (itemId) {
        dataObj = {
          type,
          itemId,
          filter: filterObj,
        };
      } else {
        filterObj.authorType = null;
        dataObj = { filter: filterObj };
      }
    }

    if (filterObj && filterObj.subjectId) {
      const type = "user";
      const itemId = filterObj.subjectId;

      if (itemId) {
        dataObj = {
          type,
          itemId,
          filter: filterObj,
        };
      } else {
        filterObj.subjectId = null;
        dataObj = { filter: filterObj };
      }
    }

    if (!dataObj) return;

    const { filter, itemId, type } = dataObj;
    const newFilter = filter
      ? filter.clone()
      : isRooms
        ? RoomsFilter.getDefault(userId)
        : FilesFilter.getDefault();
    const requests = [Promise.resolve(newFilter)];

    if (type === "user") {
      requests.push(getUserById(itemId));
    }

    axios
      .all(requests)
      .catch((err) => {
        if (isRooms) {
          Promise.resolve(RoomsFilter.getDefault(userId));
        } else {
          Promise.resolve(FilesFilter.getDefault());
        }

        //console.warn("Filter restored by default", err);
      })
      .then((data) => {
        const filter = data[0];
        const result = data[1];
        if (result) {
          const type = result.displayName ? "user" : "group";
          const selectedItem = {
            key: result.id,
            label: type === "user" ? result.displayName : result.name,
            type,
          };
          if (!isRooms) {
            filter.selectedItem = selectedItem;
          }
        }

        if (filter) {
          if (isRooms) {
            return fetchRooms(
              null,
              filter,
              undefined,
              undefined,
              undefined,
              true,
            );
          } else {
            const folderId = filter.folder;
            return fetchFiles(folderId, filter);
          }
        }

        return Promise.resolve();
      })
      .then(() => {
        if (gallerySelected) {
          setIsUpdatingRowItem(false);

          const event = new Event(Events.CREATE);

          const payload = {
            extension: "docxf",
            id: -1,
            fromTemplate: true,
            title: gallerySelected.attributes.name_form,
          };

          event.payload = payload;

          window.dispatchEvent(event);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAccountsPage, isSettingsPage, location.pathname, location.search]);

  return { onDrop };
};

export default useFiles;
