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

import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { useNavigate, useLocation, useSearchParams } from "react-router";

import Section from "@docspace/ui-kit/components/section";
import { Loader } from "@docspace/ui-kit/components/loader";
import { ValidationStatus } from "@docspace/shared/enums";
import SectionWrapper from "SRC_DIR/components/Section";
import FilesFilter from "@docspace/shared/api/files/filter";
import { PublicRoomError } from "@docspace/shared/pages/PublicRoom";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

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
      case ValidationStatus.ExternalAccessDenied:
        sessionStorage.setItem("referenceUrl", window.location.href);
        window.open(
          combineUrl(window.ClientConfig?.proxy?.url, "/login"),
          "_self",
        );
        return;
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
