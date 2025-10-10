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
import { useNavigate, useLocation, useParams } from "react-router";

import FilesFilter from "@docspace/shared/api/files/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { CREATED_FORM_KEY, MEDIA_VIEW_URL } from "@docspace/shared/constants";
import { toastr } from "@docspace/shared/components/toast";
import {
  Events,
  FolderType,
  RoomSearchArea,
  RoomsType,
} from "@docspace/shared/enums";
import { getObjectByLocation } from "@docspace/shared/utils/common";

import { getCategoryType, getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import FilesStore from "SRC_DIR/store/FilesStore";
import MediaViewerDataStore from "SRC_DIR/store/MediaViewerDataStore";
import OformsStore from "SRC_DIR/store/OformsStore";
import SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";

export type UseFilesProps = {
  fetchFiles: FilesStore["fetchFiles"];
  fetchRooms: FilesStore["fetchRooms"];
  getFileInfo: FilesStore["getFileInfo"];
  setIsPreview: FilesStore["setIsPreview"];
  setIsUpdatingRowItem: FilesStore["setIsUpdatingRowItem"];
  scrollToTop: FilesStore["scrollToTop"];
  wsCreatedPDFForm: FilesStore["wsCreatedPDFForm"];

  playlist: MediaViewerDataStore["playlist"];
  setToPreviewFile: MediaViewerDataStore["setToPreviewFile"];

  gallerySelected: OformsStore["gallerySelected"];

  userId: string;

  selectedFolderStore: SelectedFolderStore;
};

const useFiles = ({
  fetchFiles,
  fetchRooms,
  getFileInfo,
  setIsPreview,
  setIsUpdatingRowItem,
  scrollToTop,
  wsCreatedPDFForm,

  playlist,
  setToPreviewFile,

  gallerySelected,
  userId,

  selectedFolderStore,
}: UseFilesProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const fetchDefaultFiles = (isRecentFolder = false) => {
    const filter = FilesFilter.getDefault({
      isRecentFolder,
    });

    const url = getCategoryUrl(
      isRecentFolder ? CategoryType.Recent : CategoryType.Personal,
    );

    navigate(`${url}?${filter.toUrlParams()}`);
  };

  const fetchDefaultRooms = () => {
    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);

    const categoryType = getCategoryType(location) as number;

    const url = getCategoryUrl(categoryType);

    let searchArea;

    switch (categoryType) {
      case CategoryType.Shared:
        searchArea = RoomSearchArea.Active;
        break;

      case CategoryType.Archive:
        searchArea = RoomSearchArea.Archive;
        break;

      default:
        searchArea = RoomSearchArea.Active;
        break;
    }

    filter.searchArea = searchArea;

    navigate(`${url}?${filter.toUrlParams()}`);
  };

  const fetchDefaultAgents = () => {
    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.AIAgents);

    const categoryType = getCategoryType(location) as number;

    const url = getCategoryUrl(categoryType);

    navigate(`${url}?${filter.toUrlParams()}`);
  };

  const getFiles = React.useCallback(async () => {
    const categoryType = getCategoryType(location) as number; // TODO: Remove "as number" when getCategoryType is rewritten to TS

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
    }

    const isRoomFolder = getObjectByLocation(location)?.folder;
    const isRecentFolder = categoryType === CategoryType.Recent;
    const isAIAgents = categoryType === CategoryType.AIAgents;

    if (isAIAgents) {
      filterObj = RoomsFilter.getFilter(window.location);

      isRooms = true;

      if (!filterObj) {
        fetchDefaultAgents();

        return;
      }
    } else if (
      (categoryType == CategoryType.Shared ||
        categoryType == CategoryType.SharedRoom ||
        categoryType == CategoryType.Archive ||
        isAIAgents) &&
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
        fetchDefaultFiles(isRecentFolder);

        return;
      }
    }

    if (!filterObj) return;

    let dataObj: {
      filter: FilesFilter | RoomsFilter;
      type?: string;
      itemId?: string;
    } = {
      filter: filterObj,
    };

    if (filterObj && (filterObj as FilesFilter).authorType) {
      const authorType = (filterObj as FilesFilter).authorType;
      if (authorType) {
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
          (filterObj as FilesFilter).authorType = null;
          dataObj = { filter: filterObj, type: "", itemId: "" };
        }
      }
    }

    if (filterObj && (filterObj as RoomsFilter).subjectId) {
      const type = "user";
      const itemId = (filterObj as RoomsFilter).subjectId;

      if (itemId) {
        dataObj = {
          type,
          itemId,
          filter: filterObj,
        };
      } else {
        (filterObj as RoomsFilter).subjectId = null;
        dataObj = { filter: filterObj };
      }
    }

    if (!dataObj) return;

    const { filter } = dataObj;
    let newFilter = filter
      ? filter.clone()
      : isRooms
        ? RoomsFilter.getDefault(userId, filterObj.searchArea?.toString())
        : FilesFilter.getDefault({ isRecentFolder });
    const requests = [Promise.resolve(newFilter)];

    await axios
      .all(requests)
      .catch(() => {
        if (isRooms) {
          Promise.resolve(
            RoomsFilter.getDefault(userId, filterObj.searchArea?.toString()),
          );
        } else {
          Promise.resolve(FilesFilter.getDefault());
        }
      })
      .then((data) => {
        if (!data) return;

        newFilter = data[0];

        if (newFilter) {
          if (isRooms) {
            return fetchRooms(null, newFilter, undefined, undefined, false);
          }
          const folderId = (newFilter as FilesFilter).folder;
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

          const isFormRoom =
            selectedFolderStore.roomType === RoomsType.FormRoom ||
            selectedFolderStore.parentRoomType === FolderType.FormRoom;

          const payload = {
            extension: "pdf",
            id: -1,
            fromTemplate: true,
            title: (
              gallerySelected as {
                attributes: {
                  name_form: string;
                };
              }
            ).attributes.name_form,
            openEditor: !isFormRoom,
            edit: !isFormRoom,
          };

          const event = new Event(Events.CREATE) as Event & {
            payload: unknown;
          };

          event.payload = payload;

          window.dispatchEvent(event);
        }
      })
      .finally(() => {
        scrollToTop();
      });
  }, [
    location.pathname,
    location.search,
    fetchFiles,
    fetchRooms,
    getFileInfo,
    setIsPreview,
    setIsUpdatingRowItem,
    scrollToTop,
    wsCreatedPDFForm,

    playlist,
    setToPreviewFile,

    gallerySelected,
    userId,

    selectedFolderStore,
  ]);

  return { getFiles };
};

export default useFiles;
