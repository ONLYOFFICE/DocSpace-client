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

import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import { DeviceType } from "@docspace/shared/enums";
import { objectToGetParams } from "@docspace/shared/utils/common";

import { Portal } from "@docspace/shared/components/portal";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Heading } from "@docspace/shared/components/heading";
import { Aside } from "@docspace/shared/components/aside";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { Textarea } from "@docspace/shared/components/textarea";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Scrollbar } from "@docspace/shared/components/scrollbar/custom-scrollbar";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { TOption } from "@docspace/shared/components/combobox";
import { TTranslation } from "@docspace/shared/types";
import { TTheme } from "@docspace/shared/themes";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import HeaderUrl from "PUBLIC_DIR/images/sdk-presets_header.react.svg?url";
import HeaderDarkUrl from "PUBLIC_DIR/images/sdk-presets_header_dark.png?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.png?url";

import {
  StyledEmbeddingPanel,
  StyledScrollbar,
  StyledButtons,
  StyledBody,
} from "./StyledEmbeddingPanel";

import { DisplayBlock } from "./sub-components/DisplayBlock";
import { CheckboxElement } from "./sub-components/CheckboxElement";

type EmbeddingPanelProps = {
  t: TTranslation;
  theme: TTheme;
  requestToken: string;
  roomId: number;
  visible: boolean;
  setEmbeddingPanelIsVisible: (value: boolean) => void;
  currentDeviceType: DeviceType;
};

const EmbeddingPanelComponent = (props: EmbeddingPanelProps) => {
  const {
    t,
    theme,
    requestToken,
    roomId,
    visible,
    setEmbeddingPanelIsVisible,
    currentDeviceType,
  } = props;

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const [widthValue, setWidthValue] = useState("100");
  const [widthDimension, setWidthDimension] = useState<TOption>(
    dataDimensions[0],
  );
  const [heightValue, setHeightValue] = useState("820");
  const [heightDimension, setHeightDimension] = useState<TOption>(
    dataDimensions[1],
  );

  const [config, setConfig] = useState({
    width: `${widthValue}${dataDimensions[0].label}`,
    height: `${heightValue}${dataDimensions[1].label}`,
    frameId: "ds-frame",
    showHeader: true,
    showTitle: true,
    showMenu: false,
    showFilter: true,
    //
    mode: "manager",
    init: true,
    requestToken,
    //

    rootPath: "/rooms/share",
    id: roomId,
    filter: {
      count: 100,
      page: 1,
      sortorder: "descending",
      sortby: "DateAndTime",
      search: "",
      withSubfolders: false,
    },
  });

  const scriptUrl = `${window.location.origin}/static/scripts/api.js`;
  const params = objectToGetParams(config);
  const codeBlock = `<div id="${config.frameId}">Fallback text</div>\n<script src="${scriptUrl}${params}"></script>`;

  const scrollRef = useRef<Scrollbar | null>(null);

  const onClose = () => {
    setEmbeddingPanelIsVisible(false);
  };

  const onChangeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidthValue(e.target.value);
    setConfig((config) => {
      return { ...config, width: `${e.target.value}${widthDimension.label}` };
    });
  };
  const onChangeHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeightValue(e.target.value);
    setConfig((config) => {
      return { ...config, width: `${e.target.value}${heightDimension.label}` };
    });
  };

  const onChangeWidthDimension = (item: TOption) => {
    setWidthDimension(item);
    setConfig((config) => {
      return { ...config, width: `${widthValue}${item.label}` };
    });
  };
  const onChangeHeightDimension = (item: TOption) => {
    setHeightDimension(item);
    setConfig((config) => {
      return { ...config, height: `${heightValue}${item.label}` };
    });
  };

  const onCopyLink = () => {
    copy(codeBlock);
    toastr.success(t("EmbeddingPanel:CodeSuccessfullyCopied"));
  };

  const onHeaderChange = () => {
    setConfig((config) => {
      return { ...config, showHeader: !config.showHeader };
    });
  };

  const onTitleChange = () => {
    setConfig((config) => {
      return { ...config, showTitle: !config.showTitle };
    });
  };

  const onCopyAndClose = () => {
    onCopyLink();
    onClose();
  };

  const onKeyPress = (e: KeyboardEvent) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current?.contentElement?.focus();

    document.addEventListener("keyup", onKeyPress);

    return () => document.removeEventListener("keyup", onKeyPress);
  });

  console.log("Embedding config", config);

  const embeddingPanelComponent = (
    <StyledEmbeddingPanel>
      <Backdrop onClick={onClose} visible={visible} isAside zIndex={310} />
      <Aside
        className="embedding-panel"
        visible={visible}
        onClose={onClose}
        withoutBodyScroll
      >
        <div className="embedding_header">
          <Heading className="embedding_heading">
            {t("Files:EmbeddingSettings")}
          </Heading>
        </div>
        <StyledScrollbar ref={scrollRef}>
          <StyledBody>
            <div className="embedding-panel_body">
              <Text className="embedding-panel_description">
                {t("EmbeddingPanel:EmbeddingDescription")}
              </Text>

              <Text
                className="embedding-panel_header-text"
                fontSize="15px"
                fontWeight={600}
              >
                {t("JavascriptSdk:CustomizingDisplay")}:
              </Text>

              <div className="embedding-panel_inputs-container">
                <DisplayBlock
                  label={t("EmbeddingPanel:Width")}
                  inputValue={widthValue}
                  onInputChange={onChangeWidth}
                  selectedOption={widthDimension}
                  onSelectDimension={onChangeWidthDimension}
                />
                <DisplayBlock
                  label={t("EmbeddingPanel:Height")}
                  inputValue={heightValue}
                  onInputChange={onChangeHeight}
                  selectedOption={heightDimension}
                  onSelectDimension={onChangeHeightDimension}
                />
              </div>

              <Text
                className="embedding-panel_header-text"
                fontSize="15px"
                fontWeight={600}
              >
                {t("JavascriptSdk:InterfaceElements")}:
              </Text>

              <div className="embedding-panel_checkbox-container">
                <CheckboxElement
                  label={t("Common:Title")}
                  onChange={onHeaderChange}
                  isChecked={config.showHeader}
                  img={theme.isBase ? HeaderUrl : HeaderDarkUrl}
                  title={t("JavascriptSdk:Header")}
                  description={t("JavascriptSdk:HeaderDescription")}
                />
                <CheckboxElement
                  label={t("JavascriptSdk:SearchFilterAndSort")}
                  onChange={onTitleChange}
                  isChecked={config.showTitle}
                  img={theme.isBase ? SearchUrl : SearchDarkUrl}
                  title={t("JavascriptSdk:SearchBlock")}
                  description={t("JavascriptSdk:ManagerSearchBlockDescription")}
                />
              </div>

              <div className="embedding-panel_code-container">
                <Text
                  className="embedding-panel_header-text"
                  fontSize="15px"
                  fontWeight={600}
                >
                  {t("JavascriptSdk:Code")}
                </Text>
                <IconButton
                  className="embedding-panel_copy-icon"
                  size={16}
                  iconName={CopyReactSvgUrl}
                  onClick={onCopyLink}
                />
                <Textarea isReadOnly value={codeBlock} heightTextArea="150px" />
              </div>
            </div>
          </StyledBody>
        </StyledScrollbar>

        <StyledButtons>
          <Button
            className="send-invitation"
            scale
            size={ButtonSize.normal}
            primary
            onClick={onCopyAndClose}
            label={t("Common:Copy")}
          />
          <Button
            className="cancel-button"
            scale
            size={ButtonSize.normal}
            onClick={onClose}
            label={t("Common:CancelButton")}
          />
        </StyledButtons>
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

export default inject(
  ({
    dialogsStore,
    settingsStore,
  }: {
    dialogsStore: DialogsStore;
    settingsStore: SettingsStore;
  }) => {
    const { embeddingPanelIsVisible, setEmbeddingPanelIsVisible, linkParams } =
      dialogsStore;
    const { theme, currentDeviceType } = settingsStore;

    return {
      theme,
      visible: embeddingPanelIsVisible,
      setEmbeddingPanelIsVisible,
      requestToken: linkParams?.link?.sharedTo?.requestToken,
      roomId: linkParams?.roomId,
      currentDeviceType,
    };
  },
)(
  withTranslation(["Files", "EmbeddingPanel", "JavascriptSdk"])(
    observer(EmbeddingPanelComponent),
  ),
);
