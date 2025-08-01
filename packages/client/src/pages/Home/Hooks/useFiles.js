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
import axios from "axios";
import { useNavigate, useParams } from "react-router";

import FilesFilter from "@docspace/shared/api/files/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { CREATED_FORM_KEY, MEDIA_VIEW_URL } from "@docspace/shared/constants";

import {
  Events,
  FolderType,
  RoomSearchArea,
  RoomsType,
} from "@docspace/shared/enums";
import { getObjectByLocation } from "@docspace/shared/utils/common";

import { getCategoryType, getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import { toastr } from "@docspace/shared/components/toast";

const useFiles = ({
  fetchFiles,
  fetchRooms,
  setIsLoading,

  isContactsPage,
  isSettingsPage,

  location,

  playlist,

  getFileInfo,
  setToPreviewFile,
  setIsPreview,

  setIsUpdatingRowItem,

  gallerySelected,
  userId,

  scrollToTop,
  selectedFolderStore,
  wsCreatedPDFForm,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchDefaultFiles = () => {
    const filter = FilesFilter.getDefault();

    const url = getCategoryUrl(CategoryType.Personal);

    navigate(`${url}?${filter.toUrlParams()}`);
  };

  const fetchDefaultRooms = () => {
    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);

    const categoryType = getCategoryType(location);

    const url = getCategoryUrl(categoryType);

    let searchArea;

    switch (categoryType) {
      case CategoryType.Shared:
        searchArea = RoomSearchArea.Shared;
        break;

      case CategoryType.Archive:
        searchArea = RoomSearchArea.Archive;
        break;

      default:
        searchArea = RoomSearchArea.Archive;
        break;
    }

    filter.searchArea = searchArea;

    navigate(`${url}?${filter.toUrlParams()}`);
  };

  React.useEffect(() => {
    if (isContactsPage || isSettingsPage) return;

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

    const { filter } = dataObj;
    let newFilter = filter
      ? filter.clone()
      : isRooms
        ? RoomsFilter.getDefault(userId, filterObj.searchArea)
        : FilesFilter.getDefault();
    const requests = [Promise.resolve(newFilter)];

    axios
      .all(requests)
      .catch(() => {
        if (isRooms) {
          Promise.resolve(RoomsFilter.getDefault(userId, filterObj.searchArea));
        } else {
          Promise.resolve(FilesFilter.getDefault());
        }
      })
      .then((data) => {
        newFilter = data[0];

        if (newFilter) {
          if (isRooms) {
            return fetchRooms(null, newFilter, undefined, undefined, false);
          }
          const folderId = newFilter.folder;
          return fetchFiles(folderId, newFilter)?.finally(() => {
            const itemData = sessionStorage.getItem(CREATED_FORM_KEY);
            if (itemData) {
              wsCreatedPDFForm({
                data: itemData,
              });
              sessionStorage.removeItem(CREATED_FORM_KEY);
            }
          });
        }

        return Promise.resolve();
      })
      .then(() => {
        if (gallerySelected) {
          setIsUpdatingRowItem(false);

          const event = new Event(Events.CREATE);

          const isFormRoom =
            selectedFolderStore.roomType === RoomsType.FormRoom ||
            selectedFolderStore.parentRoomType === FolderType.FormRoom;

          const payload = {
            extension: "pdf",
            id: -1,
            fromTemplate: true,
            title: gallerySelected.attributes.name_form,
            openEditor: !isFormRoom,
            edit: !isFormRoom,
          };

          event.payload = payload;

          window.dispatchEvent(event);
        }
      })
      .finally(() => {
        scrollToTop();
        setIsLoading(false);
      });
  }, [isContactsPage, isSettingsPage, location.pathname, location.search]);
};

export default useFiles;
