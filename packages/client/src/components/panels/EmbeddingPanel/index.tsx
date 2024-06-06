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
import { useNavigate } from "react-router-dom";
import { withTranslation, Trans } from "react-i18next";
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
import PublicRoomBar from "@docspace/shared/components/public-room-bar";
import { Link, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { TOption } from "@docspace/shared/components/combobox";
import { TTranslation } from "@docspace/shared/types";
import { TColorScheme, TTheme } from "@docspace/shared/themes";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import HeaderUrl from "PUBLIC_DIR/images/sdk-presets_header.react.svg?url";
import HeaderDarkUrl from "PUBLIC_DIR/images/sdk-presets_header_dark.png?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.png?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg?url";

import { StyledBody } from "./StyledEmbeddingPanel";

import { DisplayBlock } from "./sub-components/DisplayBlock";
import { CheckboxElement } from "./sub-components/CheckboxElement";

type LinkParamsLinkShareToType = {
  denyDownload: boolean;
  id: string;
  internal: boolean;
  isExpired: boolean;
  linkType: number;
  primary: boolean;
  requestToken: string;
  shareLink: string;
  title: string;
  password?: string;
};

type LinkParamsLinkType = {
  access: number;
  canEditAccess: boolean;
  isLocked: boolean;
  isOwner: boolean;
  sharedTo?: LinkParamsLinkShareToType;
  subjectType: number;
};

type LinkParamsType = {
  roomId?: number | string;
  fileId?: number | string;
  isEdit?: boolean;
  link: LinkParamsLinkType;
};

type EmbeddingPanelProps = {
  t: TTranslation;
  theme: TTheme;
  requestToken: string;
  roomId: number;
  visible: boolean;
  setEmbeddingPanelIsVisible: (value: boolean) => void;
  setEditLinkPanelIsVisible: (value: boolean) => void;
  currentDeviceType: DeviceType;
  currentColorScheme: TColorScheme;
  denyDownload: boolean;
  linkParams: LinkParamsType;
  setLinkParams: (linkParams: LinkParamsType) => void;
  isAdmin: boolean;
};

const EmbeddingPanelComponent = (props: EmbeddingPanelProps) => {
  const {
    t,
    theme,
    visible,
    setEmbeddingPanelIsVisible,
    setEditLinkPanelIsVisible,
    currentDeviceType,
    currentColorScheme,
    linkParams,
    setLinkParams,
    isAdmin,
  } = props;

  const { roomId, link, fileId } = linkParams;

  const requestToken = link?.sharedTo?.requestToken;
  const linkTitle = link?.sharedTo?.title;
  const withPassword = link?.sharedTo?.password;
  const denyDownload = link?.sharedTo?.denyDownload;

  const withToken = !!requestToken;

  const [barIsVisible, setBarIsVisible] = useState(!!fileId);

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const [widthValue, setWidthValue] = useState("100");
  const [widthDimension, setWidthDimension] = useState<TOption>(
    dataDimensions[0],
  );
  const [heightValue, setHeightValue] = useState("100");
  const [heightDimension, setHeightDimension] = useState<TOption>(
    dataDimensions[1],
  );

  const fileConfig = {
    mode: "manager",
    width: "100%",
    height: "100%",
    frameId: "ds-frame",
    init: true,
    id: fileId,
    requestToken: withToken ? requestToken : null,
  };

  const roomConfig = {
    width: `${widthValue}${dataDimensions[0].label}`,
    height: `${heightValue}${dataDimensions[0].label}`,
    frameId: "ds-frame",
    showHeader: true,
    showTitle: true,
    showMenu: false,
    showFilter: true,
    mode: "manager",
    init: true,
    requestToken,
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
  };

  const [config, setConfig] = useState(fileId ? fileConfig : roomConfig);

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

  const onEditLink = () => {
    setLinkParams({ ...linkParams, isEdit: true });
    setEditLinkPanelIsVisible(true);
  };

  const onCloseBar = () => {
    setBarIsVisible(false);
  };

  const navigate = useNavigate();
  const onOpenDevTools = () => {
    navigate("/portal-settings/developer-tools");
    onClose();
  };

  const onKeyPress = (e: KeyboardEvent) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current?.contentElement?.focus();
  }, []);

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const barTitle = (
    <div className="embedding-panel_bar-header">
      <Link
        isHovered
        type={LinkType.action}
        fontSize="13px"
        fontWeight={600}
        color={currentColorScheme?.main?.accent}
        onClick={onEditLink}
      >
        {linkTitle}
      </Link>
      <Text fontSize="12px" fontWeight={600}>
        {t("Files:Protected")}
      </Text>
    </div>
  );

  const contentRestrictedTitle = t("EmbeddingPanel:ContentRestricted");
  const withPasswordTitle = t("EmbeddingPanel:LinkProtectedWithPassword");

  let barSubTitle = "";

  if (withPassword) {
    barSubTitle = withPasswordTitle;

    if (denyDownload) {
      barSubTitle += ` ${contentRestrictedTitle}`;
    }
  } else {
    barSubTitle = contentRestrictedTitle;
  }

  const showLinkBar = (withPassword || denyDownload) && !fileId;

  const embeddingPanelComponent = (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
    >
      <ModalDialog.Header>{t("Files:EmbeddingSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBody>
          {barIsVisible && (
            <div className="embedding-panel_banner">
              <Text fontSize="12px" fontWeight={400}>
                {isAdmin ? (
                  <Trans
                    t={t}
                    ns="EmbeddingPanel"
                    i18nKey="EmbeddingBarAllowList"
                    components={{
                      1: (
                        <Link
                          onClick={onOpenDevTools}
                          color={currentColorScheme?.main?.accent}
                          isHovered
                        />
                      ),
                    }}
                  >
                    {`"Add the website URL for embedding to the <1>allow list</1>."`}
                  </Trans>
                ) : (
                  t("EmbeddingPanel:EmbeddingBarDescription")
                )}
              </Text>
              <IconButton
                className="embedding-panel_banner-close-icon"
                size={12}
                iconName={CrossReactSvg}
                onClick={onCloseBar}
              />
            </div>
          )}
          <div className="embedding-panel_body">
            {!fileId && (
              <Text className="embedding-panel_description">
                {t("EmbeddingPanel:EmbeddingDescription")}
              </Text>
            )}

            {showLinkBar && (
              <PublicRoomBar
                className="embedding-panel_bar"
                headerText={barTitle}
                bodyText={barSubTitle}
                iconName={TabletLinkReactSvgUrl}
              />
            )}

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

            {!fileId && (
              <>
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
                    description={t(
                      "JavascriptSdk:ManagerSearchBlockDescription",
                    )}
                  />
                </div>
              </>
            )}

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
      </ModalDialog.Body>
      <ModalDialog.Footer>
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
      </ModalDialog.Footer>
    </ModalDialog>
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
    userStore,
  }: {
    dialogsStore: DialogsStore;
    settingsStore: SettingsStore;
    userStore: UserStore;
  }) => {
    const {
      embeddingPanelIsVisible,
      setEmbeddingPanelIsVisible,
      linkParams,
      setEditLinkPanelIsVisible,
      setLinkParams,
    } = dialogsStore;
    const { theme, currentColorScheme, currentDeviceType } = settingsStore;

    const { user } = userStore;

    return {
      theme,
      currentDeviceType,
      currentColorScheme,
      visible: embeddingPanelIsVisible,
      setEmbeddingPanelIsVisible,
      setEditLinkPanelIsVisible,
      linkParams,
      setLinkParams,

      isAdmin: user?.isAdmin,
    };
  },
)(
  withTranslation(["Files", "EmbeddingPanel", "JavascriptSdk"])(
    observer(EmbeddingPanelComponent),
  ),
);
