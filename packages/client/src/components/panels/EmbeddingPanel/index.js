import React, { useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import Backdrop from "@docspace/components/backdrop";
import Heading from "@docspace/components/heading";
import Aside from "@docspace/components/aside";
import { withTranslation } from "react-i18next";
import { StyledEmbeddingPanel, StyledScrollbar } from "./StyledEmbeddingPanel";
import EmbeddingBody from "./EmbeddingBody";
import { DeviceType } from "@docspace/common/constants";
import Portal from "@docspace/components/portal";
const EmbeddingPanelComponent = (props) => {
  const {
    t,
    link,
    requestToken,
    roomId,
    visible,
    setEmbeddingPanelIsVisible,
    currentDeviceType,
  } = props;

  const scrollRef = useRef(null);

  const onClose = () => {
    setEmbeddingPanelIsVisible(false);
  };

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    scrollRef.current && scrollRef.current?.view?.focus();

    document.addEventListener("keyup", onKeyPress);

    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const embeddingPanelComponent = (
    <StyledEmbeddingPanel>
      <Backdrop
        onClick={onClose}
        visible={visible}
        isAside={true}
        zIndex={310}
      />
      <Aside
        className="embedding-panel"
        visible={visible}
        onClose={onClose}
        withoutBodyScroll={true}
      >
        <div className="embedding_header">
          <Heading className="hotkeys_heading">
            {t("Files:EmbeddingSettings")}
          </Heading>
        </div>
        <StyledScrollbar ref={scrollRef} stype="mediumBlack">
          <EmbeddingBody
            t={t}
            link={link}
            requestToken={requestToken}
            roomId={roomId}
          />
        </StyledScrollbar>
      </Aside>
    </StyledEmbeddingPanel>
  );

  const renderPortal = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={embeddingPanelComponent}
        appendTo={rootElement}
        visible={visible}
      />
    );
  };

  return currentDeviceType === DeviceType.mobile
    ? renderPortal()
    : embeddingPanelComponent;
};

export default inject(({ dialogsStore, auth }) => {
  const { embeddingPanelIsVisible, setEmbeddingPanelIsVisible, linkParams } =
    dialogsStore;
  const { currentDeviceType } = auth.settingsStore;

  return {
    visible: embeddingPanelIsVisible,
    setEmbeddingPanelIsVisible,
    link: linkParams?.link?.sharedTo?.shareLink,
    requestToken: linkParams?.link?.sharedTo?.requestToken,
    roomId: linkParams?.roomId,
    currentDeviceType,
  };
})(
  withTranslation(["Files", "EmbeddingPanel"])(
    observer(EmbeddingPanelComponent)
  )
);
