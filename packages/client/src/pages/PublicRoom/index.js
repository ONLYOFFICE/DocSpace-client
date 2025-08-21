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

import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import Section from "@docspace/shared/components/section";
import { Loader } from "@docspace/shared/components/loader";
import { ValidationStatus } from "@docspace/shared/enums";
import SectionWrapper from "SRC_DIR/components/Section";
import FilesFilter from "@docspace/shared/api/files/filter";
import { PublicRoomError } from "@docspace/shared/pages/PublicRoom";

import PublicRoomPage from "./PublicRoomPage";
import RoomPassword from "./sub-components/RoomPassword";

const PublicRoom = (props) => {
  const {
    isLoaded,
    isLoading,
    roomStatus,
    roomId,
    validatePublicRoomKey,
    getFilesSettings,
    setPublicRoomKey,
    setIsArticleLoading,
    setClientError,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  useEffect(() => {
    validatePublicRoomKey(key);
  }, [validatePublicRoomKey]);

  const fetchRoomFiles = async () => {
    setPublicRoomKey(key);
    await getFilesSettings();
    setIsArticleLoading(false);

    const filterObj = FilesFilter.getFilter(window.location);

    if (filterObj?.folder && filterObj?.folder !== "@my") {
      const url = `${location.pathname}?${filterObj.toUrlParams()}`;

      navigate(url);
    } else {
      const newFilter = FilesFilter.getDefault();
      newFilter.folder = roomId;
      newFilter.key = key;

      const url = `${location.pathname}?${newFilter.toUrlParams()}`;

      navigate(url);
    }
  };

  useEffect(() => {
    if (isLoaded) fetchRoomFiles();
  }, [isLoaded]);

  const renderLoader = () => {
    return (
      <SectionWrapper>
        <Section.SectionBody>
          <Loader className="pageLoader" type="rombs" size="40px" />
        </Section.SectionBody>
      </SectionWrapper>
    );
  };

  useEffect(() => {
    if (
      roomStatus === ValidationStatus.Invalid ||
      roomStatus === ValidationStatus.Expired
    ) {
      setClientError(true);
    }
  }, [roomStatus, setClientError]);

  const renderPage = () => {
    switch (roomStatus) {
      case ValidationStatus.Ok:
        return <PublicRoomPage />;
      case ValidationStatus.Invalid:
        return <PublicRoomError isInvalid />;
      case ValidationStatus.Expired:
        return <PublicRoomError />;
      case ValidationStatus.Password:
        return <RoomPassword roomKey={key} />;
      default:
        return renderLoader();
    }
  };

  return isLoading ? (
    renderLoader()
  ) : isLoaded ? (
    <PublicRoomPage />
  ) : (
    renderPage()
  );
};

export const WrappedComponent = inject(
  ({
    settingsStore,
    publicRoomStore,
    filesSettingsStore,
    clientLoadingStore,
    authStore,
  }) => {
    const { validatePublicRoomKey, isLoaded, isLoading, roomStatus, roomId } =
      publicRoomStore;

    const { getFilesSettings } = filesSettingsStore;
    const { setPublicRoomKey } = settingsStore;
    const { setIsArticleLoading } = clientLoadingStore;
    const { setClientError } = authStore;
    return {
      roomId,
      isLoaded,
      isLoading,
      roomStatus,

      getFilesSettings,

      validatePublicRoomKey,
      setPublicRoomKey,
      setIsArticleLoading,
      setClientError,
    };
  },
)(observer(PublicRoom));
