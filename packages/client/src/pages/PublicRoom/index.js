import React, { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { useNavigate, useLocation } from "react-router-dom";
import Section from "@docspace/shared/components/section";
import { Loader } from "@docspace/shared/components/loader";
import { ValidationStatus } from "../../helpers/constants";
import SectionWrapper from "SRC_DIR/components/Section";
import RoomPassword from "./sub-components/RoomPassword";
import RoomErrors from "./sub-components/RoomErrors";

import PublicRoomPage from "./PublicRoomPage";

import FilesFilter from "@docspace/shared/api/files/filter";

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
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const lastKeySymbol = location.search.indexOf("&");
  const lastIndex =
    lastKeySymbol === -1 ? location.search.length : lastKeySymbol;
  const key = location.search.substring(5, lastIndex);

  useEffect(() => {
    validatePublicRoomKey(key);
  }, [validatePublicRoomKey]);

  const fetchRoomFiles = async () => {
    setPublicRoomKey(key);
    await getFilesSettings();
    setIsArticleLoading(false);

    const filterObj = FilesFilter.getFilter(window.location);

    if (filterObj?.folder && filterObj?.folder !== "@my") {
      const url = `${location.pathname}?key=${key}&${filterObj.toUrlParams()}`;

      navigate(url);
    } else {
      const newFilter = FilesFilter.getDefault();
      newFilter.folder = roomId;

      const url = `${location.pathname}?key=${key}&${newFilter.toUrlParams()}`;

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

  const renderPage = () => {
    switch (roomStatus) {
      case ValidationStatus.Ok:
        return <PublicRoomPage />;
      case ValidationStatus.Invalid:
        return <RoomErrors isInvalid />;
      case ValidationStatus.Expired:
        return <RoomErrors />;
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

export default inject(
  ({
    settingsStore,
    publicRoomStore,
    filesSettingsStore,
    clientLoadingStore,
  }) => {
    const { validatePublicRoomKey, isLoaded, isLoading, roomStatus, roomId } =
      publicRoomStore;

    const { getFilesSettings } = filesSettingsStore;
    const { setPublicRoomKey } = settingsStore;
    const { setIsArticleLoading } = clientLoadingStore;

    return {
      roomId,
      isLoaded,
      isLoading,
      roomStatus,

      getFilesSettings,

      validatePublicRoomKey,
      setPublicRoomKey,
      setIsArticleLoading,
    };
  }
)(observer(PublicRoom));
