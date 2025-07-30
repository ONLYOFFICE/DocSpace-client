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

import { useState, useEffect, useCallback, useRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation, Trans } from "react-i18next";
import copy from "copy-to-clipboard";
import isEqual from "lodash/isEqual";
import { objectToGetParams } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import pkg from "PACKAGE_FILE";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TFunction } from "i18next";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { Textarea } from "@docspace/shared/components/textarea";
import { IconButton } from "@docspace/shared/components/icon-button";
import PublicRoomBar from "@docspace/shared/components/public-room-bar";
import { Link, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { TTranslation } from "@docspace/shared/types";
import { TColorScheme, TTheme } from "@docspace/shared/themes";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import HeaderUrl from "PUBLIC_DIR/images/sdk-presets_header.react.svg?url";
import HeaderDarkUrl from "PUBLIC_DIR/images/sdk-presets_header_dark.png";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.png";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import CrossReactSvg from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

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
  roomId: number | string;
  isEdit?: boolean;
  link: LinkParamsLinkType;
};

type EmbeddingPanelProps = {
  t: TTranslation;
  theme: TTheme;
  requestToken: string;
  roomId: number;
  visible: boolean;
  setEmbeddingPanelData: (value: {
    visible: boolean;
    itemId?: string | number;
  }) => void;
  setEditLinkPanelIsVisible: (value: boolean) => void;
  currentColorScheme: TColorScheme;
  linkParams: LinkParamsType;
  setLinkParams: (linkParams: LinkParamsType) => void;
  fetchExternalLinks: (roomId: string | number) => LinkParamsLinkType[];
  isAdmin: boolean;
  itemId?: string | number;
  isRoom: boolean;
};

type TOptionType = TOption & {
  sharedTo: LinkParamsLinkShareToType;
};

const EmbeddingPanelComponent = (props: EmbeddingPanelProps) => {
  const {
    t,
    theme,
    visible,
    setEmbeddingPanelData,
    setEditLinkPanelIsVisible,
    currentColorScheme,
    linkParams,
    setLinkParams,
    fetchExternalLinks,
    isAdmin,
    itemId,
    isRoom,
  } = props;

  const { roomId, link } = linkParams;

  const [sharedLinksOptions, setSharedLinksOptions] = useState<TOptionType[]>(
    [],
  );
  const [selectedLink, setSelectedLink] = useState<TOptionType>();
  const [barIsVisible, setBarIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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

  const fileConfig = {
    src: window.location.origin,
    frameId: "ds-frame",
    mode: "editor",
    id: itemId,
    width: `${widthValue}${dataDimensions[0].label}`,
    height: `${heightValue}${dataDimensions[1].label}`,
    init: true,
    showTitle: false,
    showFilter: false,
  };

  const roomConfig = {
    src: window.location.origin,
    frameId: "ds-frame",
    mode: "public-room",
    id: roomId,
    width: `${widthValue}${dataDimensions[0].label}`,
    height: `${heightValue}${dataDimensions[1].label}`,
    showHeader: true,
    showTitle: true,
    showMenu: false,
    showFilter: true,
    requestToken: link?.sharedTo?.requestToken,
    init: true,
  };

  const isFile = itemId && !isRoom;

  const [embeddingConfig, setEmbeddingConfig] = useState(
    isFile ? fileConfig : roomConfig,
  );

  const params = objectToGetParams(embeddingConfig);
  const codeBlock = `<div id="${embeddingConfig.frameId}">Fallback text</div>\n<script src="${SDK_SCRIPT_URL}${params}"></script>`;

  const currentLink = selectedLink ?? link;

  const linkTitle = currentLink?.sharedTo?.title;
  const withPassword = currentLink?.sharedTo?.password;
  const denyDownload = currentLink?.sharedTo?.denyDownload;

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

  const showLinkBar =
    currentLink?.sharedTo?.password || currentLink?.sharedTo?.denyDownload;

  const onClose = () => {
    setEmbeddingPanelData({ visible: false });
  };

  const onChangeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidthValue(e.target.value);
    setEmbeddingConfig((config) => {
      return { ...config, width: `${e.target.value}${widthDimension.label}` };
    });
  };

  const onChangeHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeightValue(e.target.value);
    setEmbeddingConfig((config) => {
      return { ...config, height: `${e.target.value}${heightDimension.label}` };
    });
  };

  const onChangeWidthDimension = (item: TOption) => {
    setWidthDimension(item);
    setEmbeddingConfig((config) => {
      return { ...config, width: `${widthValue}${item.label}` };
    });
  };

  const onChangeHeightDimension = (item: TOption) => {
    setHeightDimension(item);
    setEmbeddingConfig((config) => {
      return { ...config, height: `${heightValue}${item.label}` };
    });
  };

  const onCopyLink = () => {
    copy(codeBlock);
    toastr.success(t("EmbeddingPanel:CodeSuccessfullyCopied"));
  };

  const onHeaderChange = () => {
    setEmbeddingConfig((config) => {
      return { ...config, showTitle: !config.showTitle };
    });
  };

  const onTitleChange = () => {
    setEmbeddingConfig((config) => {
      return { ...config, showFilter: !config.showFilter };
    });
  };

  const onCopyAndClose = () => {
    onCopyLink();
    onClose();
  };

  const onEditLink = () => {
    setLinkParams({
      ...linkParams,
      isEdit: true,
      link: selectedLink ?? link,
    } as LinkParamsType);
    setEditLinkPanelIsVisible(true);
  };

  const onChangeSharedLink = (item: TOption) => {
    setSelectedLink(item as TOptionType);
    setEmbeddingConfig((config) => {
      return {
        ...config,
        requestToken: (item as TOptionType)?.sharedTo?.requestToken,
      };
    });
  };

  const onCloseBar = () => {
    setBarIsVisible(false);
  };

  const onOpenDevTools = () => {
    const url = combineUrl(
      window.location.origin,
      window.ClientConfig?.proxy?.url,
      pkg.homepage,
      "/portal-settings/developer-tools",
    );

    window.open(url, "_blank");
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const getLinks = useCallback(async () => {
    try {
      setIsLoading(true);
      const roomLinks = await fetchExternalLinks(roomId);

      if (roomLinks && roomLinks.length) {
        const linksOptions = roomLinks.map((l: LinkParamsLinkType) => {
          return {
            key: l.sharedTo?.id,
            label: l.sharedTo?.title,
            sharedTo: l.sharedTo,
          } as TOptionType;
        });

        setSelectedLink(linksOptions[0]);
        setSharedLinksOptions(linksOptions);

        onChangeSharedLink(linksOptions[0]);
      }
    } catch (error) {
      toastr.error(error as TData);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, fetchExternalLinks]);

  useEffect(() => {
    if (itemId) {
      getLinks();
    }
  }, [itemId, getLinks]);

  const usePrevious = (value: LinkParamsLinkType | null) => {
    const ref = useRef<LinkParamsLinkType | null>(undefined);
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevLink = usePrevious(link ?? null);

  useEffect(() => {
    if (sharedLinksOptions?.length && prevLink && !isEqual(prevLink, link)) {
      const newSharedLinks = [...sharedLinksOptions];
      const newLinkIndex = newSharedLinks.findIndex(
        (l) => l.sharedTo.id === link.sharedTo?.id,
      );

      if (newLinkIndex > -1)
        newSharedLinks[newLinkIndex] = {
          key: link.sharedTo?.id,
          label: link.sharedTo?.title,
          sharedTo: link.sharedTo,
        } as TOptionType;

      setSharedLinksOptions(newSharedLinks);
      setSelectedLink({
        key: link.sharedTo?.id,
        label: link.sharedTo?.title,
        sharedTo: link.sharedTo,
      } as TOptionType);
    }
  }, [link, prevLink, sharedLinksOptions]);

  const barTitle = (
    <div className="embedding-panel_bar-header">
      <Link
        isHovered
        type={LinkType.action}
        fontSize="13px"
        fontWeight={600}
        color={currentColorScheme?.main?.accent}
        onClick={onEditLink}
        isTextOverflow
      >
        {linkTitle}
      </Link>
      <Text fontSize="12px" fontWeight={600}>
        {t("Files:Protected")}
      </Text>
    </div>
  );

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      withBodyScroll
      displayType={ModalDialogType.aside}
      withoutPadding
    >
      <ModalDialog.Header>{t("Files:EmbeddingSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBody>
          {barIsVisible ? (
            <div className="embedding-panel_banner">
              <Text fontSize="12px" fontWeight={400}>
                {isAdmin ? (
                  <Trans
                    t={t as TFunction}
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
                  t("EmbeddingPanel:EmbeddingBarDescription", {
                    productName: t("Common:ProductName"),
                  })
                )}
              </Text>
              <IconButton
                className="embedding-panel_banner-close-icon"
                size={12}
                iconName={CrossReactSvg}
                onClick={onCloseBar}
              />
            </div>
          ) : null}
          <div className="embedding-panel_body">
            {sharedLinksOptions && sharedLinksOptions.length > 1 ? (
              <>
                <Text
                  className="embedding-panel_header-link"
                  fontSize="15px"
                  fontWeight={600}
                >
                  {t("EmbeddingPanel:Link")}
                </Text>
                <ComboBox
                  className="embedding-panel_combo-box"
                  scaled
                  onSelect={onChangeSharedLink}
                  options={sharedLinksOptions}
                  selectedOption={selectedLink as TOption}
                  displaySelectedOption
                  directionY="bottom"
                  withLabel={false}
                />
              </>
            ) : null}

            {showLinkBar ? (
              <PublicRoomBar
                className="embedding-panel_bar"
                headerText={barTitle}
                bodyText={barSubTitle}
                iconName={TabletLinkReactSvgUrl}
                barIsVisible={barIsVisible}
              />
            ) : null}

            <Text
              className="embedding-panel_header-text"
              fontSize="15px"
              fontWeight={600}
            >
              {t("EmbeddingPanel:DisplaySettings")}
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

            {!isFile ? (
              <>
                <Text
                  className="embedding-panel_header-text"
                  fontSize="15px"
                  fontWeight={600}
                >
                  {t("JavascriptSdk:InterfaceElements")}
                </Text>

                <div className="embedding-panel_checkbox-container">
                  <CheckboxElement
                    label={t("Common:Title")}
                    onChange={onHeaderChange}
                    isChecked={embeddingConfig.showTitle}
                    img={theme.isBase ? HeaderUrl : HeaderDarkUrl}
                    title={t("JavascriptSdk:Header")}
                    description={t("JavascriptSdk:HeaderDescription")}
                  />
                  <CheckboxElement
                    label={t("JavascriptSdk:SearchFilterAndSort")}
                    onChange={onTitleChange}
                    isChecked={embeddingConfig.showFilter}
                    img={theme.isBase ? SearchUrl : SearchDarkUrl}
                    title={t("JavascriptSdk:SearchBlock")}
                    description={t(
                      "JavascriptSdk:ManagerSearchBlockDescription",
                    )}
                  />
                </div>
              </>
            ) : null}

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
          isLoading={isLoading}
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          onClick={onClose}
          label={t("Common:CancelButton")}
          isLoading={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<TStore>(
  ({ dialogsStore, settingsStore, userStore, publicRoomStore }) => {
    const {
      embeddingPanelData,
      setEmbeddingPanelData,
      linkParams,
      setEditLinkPanelIsVisible,
      setLinkParams,
    } = dialogsStore;
    const { theme, currentColorScheme } = settingsStore;
    const { user } = userStore;
    const { fetchExternalLinks } = publicRoomStore;

    return {
      theme,
      currentColorScheme,
      visible: embeddingPanelData.visible,
      itemId: (embeddingPanelData.item as unknown as TRoom)?.id,
      isRoom: (embeddingPanelData.item as unknown as TRoom)?.isRoom,
      setEmbeddingPanelData,
      setEditLinkPanelIsVisible,
      linkParams,
      setLinkParams,
      fetchExternalLinks,
      isAdmin: user?.isAdmin,
    };
  },
)(
  withTranslation(["Files", "EmbeddingPanel", "JavascriptSdk"])(
    observer(EmbeddingPanelComponent),
  ),
);
