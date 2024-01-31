import { useState, useEffect, useCallback, useRef } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useParams } from "react-router-dom";
import AppLoader from "@docspace/common/components/AppLoader";
import RoomSelector from "@docspace/shared/selectors/Room";
import FilesSelector from "../../components/FilesSelector";
import {
  frameCallEvent,
  frameCallbackData,
  createPasswordHash,
  frameCallCommand,
} from "@docspace/shared/utils/common";
import { RoomsType } from "@docspace/shared/enums";

import styled from "styled-components";

import Logo from "PUBLIC_DIR/images/light_small_logo.react.svg";

const ButtonWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  button {
    background-color: ${(props) => props.buttonColor};
    border-color: ${(props) => props.buttonColor};

    :active {
      background-color: ${(props) => props.buttonColor};
      border-color: ${(props) => props.buttonColor};
    }
  }
`;

const Sdk = ({
  t,
  frameConfig,
  match,
  setFrameConfig,
  login,
  logout,
  loadCurrentUser,
  getIcon,
  isLoaded,
  getSettings,
  user,
  updateProfileCulture,
  getRoomsIcon,
  fetchExternalLinks,
  getFilePrimaryLink,
}) => {
  const newWindow = useRef(null);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    window.addEventListener("message", handleMessage, false);
    return () => {
      window.removeEventListener("message", handleMessage, false);
      setFrameConfig(null);
    };
  }, [handleMessage]);

  // useEffect(() => {
  //   frameConfig && newWindow.current && newWindow.current.postMessage(frameConfig, window.location.origin);
  //   return () => {
  //     newWindow.current = null;
  //   };
  // }, [frameConfig]);

  const callCommand = useCallback(
    () => frameCallCommand("setConfig"),
    [frameCallCommand]
  );

  const callCommandLoad = useCallback(
    () => frameCallCommand("setIsLoaded"),
    [frameCallCommand]
  );

  useEffect(() => {
    if (window.parent && !frameConfig && isLoaded) {
      callCommand("setConfig");
    }
  }, [callCommand, isLoaded]);

  useEffect(() => {
    if (isDataReady) {
      callCommandLoad("setIsLoaded");
    }
  }, [callCommandLoad, isDataReady]);

  const { mode } = useParams();
  const selectorType = new URLSearchParams(window.location.search).get(
    "selectorType"
  );

  const toRelativeUrl = (data) => {
    try {
      const url = new URL(data);
      const rel = url.toString().substring(url.origin.length);
      return rel;
    } catch {
      return data;
    }
  };

  const handleMessage = async (e) => {
    const eventData = typeof e.data === "string" ? JSON.parse(e.data) : e.data;

    if (eventData.data) {
      const { data, methodName } = eventData.data;

      let res;

      try {
        switch (methodName) {
          case "setConfig":
            {
              const requests = await Promise.all([
                setFrameConfig(data),
                user &&
                  data.locale &&
                  updateProfileCulture(user.id, data.locale),
              ]);
              res = requests[0];
            }
            break;
          case "createHash":
            {
              const { password, hashSettings } = data;
              res = createPasswordHash(password, hashSettings);
            }
            break;
          case "getUserInfo":
            res = await loadCurrentUser();
            break;

          case "getHashSettings":
            {
              const settings = await getSettings();
              res = settings.passwordHash;
            }
            break;
          case "login":
            {
              const { email, passwordHash } = data;
              res = await login(email, passwordHash);
            }
            break;

          case "logout":
            res = await logout();
            break;
          default:
            res = "Wrong method";
        }
      } catch (e) {
        res = e;
      }
      frameCallbackData(res);
    }
  };

  const onSelectRoom = useCallback(
    async (data) => {
      if (data[0].logo.large !== "") {
        data[0].icon = toRelativeUrl(data[0].logo.large);
      } else {
        data[0].icon = await getRoomsIcon(data[0].roomType, false, 32);
      }

      if (
        data[0].roomType === RoomsType.PublicRoom ||
        (data[0].roomType === RoomsType.CustomRoom && data[0].shared)
      ) {
        const links = await fetchExternalLinks(data[0].id);

        const requestTokens = links.map((link) => {
          const { id, title, requestToken, primary } = link.sharedTo;

          return {
            id,
            primary,
            title,
            requestToken,
          };
        });

        data[0].requestTokens = requestTokens;
      }

      frameCallEvent({ event: "onSelectCallback", data });
    },
    [frameCallEvent]
  );

  const onSelectFile = useCallback(
    async (data) => {
      data.icon = getIcon(64, data.fileExst);

      if (data.inPublic) {
        const link = await getFilePrimaryLink(data.id);

        const { id, title, requestToken, primary } = link.sharedTo;

        data.requestTokens = [{ id, primary, title, requestToken }];
      }

      frameCallEvent({ event: "onSelectCallback", data });
    },
    [frameCallEvent]
  );

  const onClose = useCallback(() => {
    frameCallEvent({ event: "onCloseCallback" });
  }, [frameCallEvent]);

  const onCloseCallback = !!frameConfig?.events.onCloseCallback
    ? {
        onClose,
      }
    : {};

  let component;

  const openRoomSelector = () => {
    newWindow.current = window.open(
      `/sdk/room-selector`,
      "_blank",
      `width=${frameConfig?.width ?? 600},height=${frameConfig?.height ?? 400}`,
    );
  };
  const openFileSelector = () => {
    newWindow.current = window.open(
      `/sdk/file-selector`,
      "_blank",
      `width=${frameConfig?.width ?? 600},height=${frameConfig?.height ?? 400}`,
    );
  };

  switch (mode) {
    case "room-selector":
      component = frameConfig?.isButtonMode ? (
        <ButtonWrapper buttonColor={frameConfig?.buttonColor}>
          <Button
            scale={false}
            size="small"
            label={frameConfig?.buttonText || t("SelectToDocSpace")}
            isHovered
            primary
            onClick={openRoomSelector}
            icon={frameConfig?.buttonWithLogo ? <Logo /> : undefined}
          />
        </ButtonWrapper>
      ) : (
        <RoomSelector
          withCancelButton={frameConfig?.showSelectorCancel}
          withHeader={frameConfig?.showSelectorHeader}
          onAccept={onSelectRoom}
          onCancel={onClose}
          withSearch={frameConfig?.withSearch}
          withoutBackButton
          acceptButtonLabel={frameConfig?.acceptButtonLabel}
          cancelButtonLabel={frameConfig?.cancelButtonLabel}
          roomType={frameConfig?.roomType}
          onSelect={() => {}}
          setIsDataReady={setIsDataReady}
        />
      );
      break;
    case "file-selector":
      component = frameConfig?.isButtonMode ? (
        <ButtonWrapper buttonColor={frameConfig?.buttonColor}>
          <Button
            scale={false}
            size="small"
            label={frameConfig?.buttonText || t("SelectToDocSpace")}
            isHovered
            primary
            onClick={openFileSelector}
            icon={frameConfig?.buttonWithLogo ? <Logo /> : undefined}
          />
        </ButtonWrapper>
      ) : (
        <FilesSelector
          isPanelVisible={true}
          embedded={true}
          withHeader={frameConfig?.showSelectorHeader}
          isSelect={true}
          setIsDataReady={setIsDataReady}
          onSelectFile={onSelectFile}
          onClose={onClose}
          withBreadCrumbs={frameConfig?.withBreadCrumbs}
          withSubtitle={frameConfig?.withSubtitle}
          filterParam={frameConfig?.filterParam}
          isUserOnly={selectorType === "userFolderOnly"}
          isRoomsOnly={selectorType === "roomsOnly"}
          withCancelButton={frameConfig?.showSelectorCancel}
          withSearch={frameConfig?.withSearch}
          acceptButtonLabel={frameConfig?.acceptButtonLabel}
          cancelButtonLabel={frameConfig?.cancelButtonLabel}
          currentFolderId={frameConfig?.id}
        />
      );
      break;
    default:
      component = <AppLoader />;
  }
  return component;
};

export default inject(
  ({ auth, settingsStore, peopleStore, publicRoomStore, filesStore }) => {
    const { login, logout, userStore } = auth;
    const { theme, setFrameConfig, frameConfig, getSettings, isLoaded } =
      auth.settingsStore;
    const { loadCurrentUser, user } = userStore;
    const { updateProfileCulture } = peopleStore.targetUserStore;
    const { getIcon, getRoomsIcon } = settingsStore;
    const { fetchExternalLinks } = publicRoomStore;
    const { getFilePrimaryLink } = filesStore;

    return {
      theme,
      setFrameConfig,
      frameConfig,
      login,
      logout,
      getSettings,
      loadCurrentUser,
      getIcon,
      getRoomsIcon,
      isLoaded,
      updateProfileCulture,
      user,
      fetchExternalLinks,
      getFilePrimaryLink,
    };
  }
)(withTranslation(["JavascriptSdk"])(observer(Sdk)));
