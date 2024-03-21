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

import React, { useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Heading } from "@docspace/shared/components/heading";
import { Aside } from "@docspace/shared/components/aside";
import { withTranslation } from "react-i18next";
import { StyledEmbeddingPanel, StyledScrollbar } from "./StyledEmbeddingPanel";
import EmbeddingBody from "./EmbeddingBody";
import { DeviceType } from "@docspace/shared/enums";
import { Portal } from "@docspace/shared/components/portal";
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
        <StyledScrollbar ref={scrollRef}>
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

export default inject(({ dialogsStore, settingsStore }) => {
  const { embeddingPanelIsVisible, setEmbeddingPanelIsVisible, linkParams } =
    dialogsStore;
  const { currentDeviceType } = settingsStore;

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
    observer(EmbeddingPanelComponent),
  ),
);
