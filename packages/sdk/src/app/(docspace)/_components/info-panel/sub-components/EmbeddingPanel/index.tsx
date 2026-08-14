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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";
import copy from "copy-to-clipboard";
import isEqual from "lodash/isEqual";
import type { TFunction } from "i18next";

import { objectToGetParams } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { getExternalLinks } from "@docspace/shared/api/files";
import { getExternalLinks as getRoomExternalLinks } from "@docspace/shared/api/rooms";
import type { TFileLink } from "@docspace/shared/api/files/types";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr, type TData } from "@docspace/ui-kit/components/toast";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import HeaderUrl from "PUBLIC_DIR/images/sdk-presets_header.react.svg?url";
import HeaderDarkUrl from "PUBLIC_DIR/images/sdk-presets_header_dark.png";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.png";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import CrossReactSvg from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { useInfoPanelStore } from "@/app/(docspace)/_store/InfoPanelStore";

import { dimensionsModel } from "./constants";
import { DisplayBlock } from "./sub-components/DisplayBlock";
import { CheckboxElement } from "./sub-components/CheckboxElement";
import styles from "./EmbeddingPanel.module.scss";

type TOptionType = TOption & {
  sharedTo: TFileLink["sharedTo"];
};

type EmbeddingPanelProps = {
  isAdmin?: boolean;
};

const EmbeddingPanel = observer(({ isAdmin = false }: EmbeddingPanelProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const infoPanelStore = useInfoPanelStore();
  const {
    embeddingPanelData,
    linkParams,
    setLinkParams,
    setEmbeddingPanelData,
    setEditLinkPanelIsVisible,
  } = infoPanelStore;

  const visible = Boolean(embeddingPanelData?.visible);
  const item = embeddingPanelData?.item ?? linkParams?.item;
  const itemId = item?.id;
  const isRoom = item && "isRoom" in item ? Boolean(item.isRoom) : false;
  const link = linkParams?.link;

  const [sharedLinksOptions, setSharedLinksOptions] = React.useState<
    TOptionType[]
  >([]);
  const [selectedLink, setSelectedLink] = React.useState<TOptionType>();
  const [barIsVisible, setBarIsVisible] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const [widthValue, setWidthValue] = React.useState("100");
  const [widthDimension, setWidthDimension] = React.useState<TOption>(
    dimensionsModel[0],
  );
  const [heightValue, setHeightValue] = React.useState("820");
  const [heightDimension, setHeightDimension] = React.useState<TOption>(
    dimensionsModel[1],
  );

  const fileConfig = {
    src: window.location.origin,
    frameId: "ds-frame",
    mode: "editor",
    id: itemId,
    width: `${widthValue}${dimensionsModel[0].label}`,
    height: `${heightValue}${dimensionsModel[1].label}`,
    init: true,
    showTitle: false,
    showFilter: false,
    requestToken: link?.sharedTo?.requestToken,
  };

  const roomConfig = {
    src: window.location.origin,
    frameId: "ds-frame",
    mode: "public-room",
    id: itemId,
    width: `${widthValue}${dimensionsModel[0].label}`,
    height: `${heightValue}${dimensionsModel[1].label}`,
    showHeader: true,
    showTitle: true,
    showMenu: false,
    showFilter: true,
    requestToken: link?.sharedTo?.requestToken,
    init: true,
  };

  const isFile = Boolean(itemId) && !isRoom;

  const [embeddingConfig, setEmbeddingConfig] = React.useState(
    isFile ? fileConfig : roomConfig,
  );

  const params = objectToGetParams(embeddingConfig);
  const codeBlock = `<div id="${embeddingConfig.frameId}">Fallback text</div>\n<script src="${SDK_SCRIPT_URL}${params}"></script>`;

  const currentLink = selectedLink ?? link;

  const linkTitle = currentLink?.sharedTo?.title;
  const withPassword = currentLink?.sharedTo?.password;
  const denyDownload = currentLink?.sharedTo?.denyDownload;

  const contentRestrictedTitle = t("Common:ContentRestricted");
  const withPasswordTitle = t("Common:LinkProtectedWithPassword");

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

  const onChangeWidthDimension = (option: TOption) => {
    setWidthDimension(option);
    setEmbeddingConfig((config) => {
      return { ...config, width: `${widthValue}${option.label}` };
    });
  };

  const onChangeHeightDimension = (option: TOption) => {
    setHeightDimension(option);
    setEmbeddingConfig((config) => {
      return { ...config, height: `${heightValue}${option.label}` };
    });
  };

  const onCopyLink = () => {
    copy(codeBlock);
    toastr.success(t("Common:CodeSuccessfullyCopied"));
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
    if (!linkParams) return;
    setLinkParams({
      ...linkParams,
      link: (selectedLink ?? link) as TFileLink,
    });
    setEditLinkPanelIsVisible(true);
  };

  const onChangeSharedLink = (option: TOption) => {
    setSelectedLink(option as TOptionType);
    setEmbeddingConfig((config) => {
      return {
        ...config,
        requestToken: (option as TOptionType)?.sharedTo?.requestToken,
      };
    });
  };

  const onCloseBar = () => {
    setBarIsVisible(false);
  };

  const onOpenDevTools = () => {
    window.open(
      combineUrl(window.location.origin, "/developer-tools/javascript-sdk"),
      "_blank",
    );
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const getLinks = React.useCallback(async () => {
    if (!itemId) return;
    try {
      setIsLoading(true);

      const links = isFile
        ? (await getExternalLinks(itemId)).items
        : ((await getRoomExternalLinks(itemId, 1)) as TFileLink[]);

      if (links && links.length) {
        const linksOptions = links.map((l: TFileLink) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, isFile]);

  React.useEffect(() => {
    if (itemId && !link) {
      getLinks();
    }
  }, [itemId, getLinks, link]);

  const usePrevious = (value: TFileLink | null) => {
    const ref = React.useRef<TFileLink | null>(null);
    React.useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevLink = usePrevious(link ?? null);

  React.useEffect(() => {
    if (sharedLinksOptions?.length && prevLink && link && !isEqual(prevLink, link)) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link, prevLink, sharedLinksOptions]);

  const barTitle = (
    <div className={styles.embeddingPanelBarHeader}>
      <Link
        isHovered
        type={LinkType.action}
        fontSize="13px"
        fontWeight={600}
        color="accent"
        onClick={onEditLink}
        isTextOverflow
      >
        {linkTitle}
      </Link>
      <Text fontSize="12px" fontWeight={600}>
        {t("Common:Protected")}
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
      dataTestId="embedding_panel_modal"
    >
      <ModalDialog.Header>{t("Common:EmbeddingSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.embeddingPanelBody}>
          {barIsVisible ? (
            <div className={styles.embeddingPanelBanner}>
              <Text fontSize="12px" fontWeight={400}>
                {isAdmin ? (
                  <Trans
                    t={t as TFunction}
                    ns="Common"
                    i18nKey="EmbeddingBarAllowList"
                    components={{
                      1: (
                        <Link
                          onClick={onOpenDevTools}
                          color="accent"
                          isHovered
                          dataTestId="embedding_panel_dev_tools_link"
                        />
                      ),
                    }}
                  >
                    {`"Add the website URL for embedding to the <1>allow list</1>."`}
                  </Trans>
                ) : (
                  t("Common:EmbeddingBarDescription")
                )}
              </Text>
              <IconButton
                className={styles.embeddingPanelBannerCloseIcon}
                size={12}
                iconName={CrossReactSvg}
                onClick={onCloseBar}
                dataTestId="embedding_panel_banner_close"
              />
            </div>
          ) : null}
          <div>
            {sharedLinksOptions && sharedLinksOptions.length > 1 ? (
              <>
                <Text
                  className={styles.embeddingPanelHeaderLink}
                  fontSize="15px"
                  fontWeight={600}
                >
                  {t("Common:Link")}
                </Text>
                <ComboBox
                  className={styles.embeddingPanelComboBox}
                  scaled
                  onSelect={onChangeSharedLink}
                  options={sharedLinksOptions}
                  selectedOption={selectedLink as TOption}
                  displaySelectedOption
                  directionY="bottom"
                  withLabel={false}
                  dataTestId="embedding_panel_link_selector"
                />
              </>
            ) : null}

            {showLinkBar ? (
              <PublicRoomBar
                className={styles.embeddingPanelBar}
                headerText={barTitle}
                bodyText={barSubTitle}
                iconName={TabletLinkReactSvgUrl}
                barIsVisible={barIsVisible}
              />
            ) : null}

            <Text
              className={styles.embeddingPanelHeaderText}
              fontSize="15px"
              fontWeight={600}
            >
              {t("Common:DisplaySettings")}
            </Text>

            <div className={styles.embeddingPanelInputsContainer}>
              <DisplayBlock
                label={t("Common:Width")}
                name="embed_width"
                inputValue={widthValue}
                onInputChange={onChangeWidth}
                selectedOption={widthDimension}
                onSelectDimension={onChangeWidthDimension}
              />
              <DisplayBlock
                label={t("Common:Height")}
                name="embed_height"
                inputValue={heightValue}
                onInputChange={onChangeHeight}
                selectedOption={heightDimension}
                onSelectDimension={onChangeHeightDimension}
              />
            </div>

            {!isFile ? (
              <>
                <Text
                  className={styles.embeddingPanelHeaderText}
                  fontSize="15px"
                  fontWeight={600}
                >
                  {t("Common:InterfaceElements")}
                </Text>

                <div className={styles.embeddingPanelCheckboxContainer}>
                  <CheckboxElement
                    label={t("Common:Title")}
                    onChange={onHeaderChange}
                    isChecked={embeddingConfig.showTitle}
                    img={isBase ? HeaderUrl : HeaderDarkUrl}
                    title={t("Common:Header")}
                    description={t("Common:HeaderDescription")}
                    dataTestId="show_title"
                  />
                  <CheckboxElement
                    label={t("Common:SearchFilterAndSort")}
                    onChange={onTitleChange}
                    isChecked={embeddingConfig.showFilter}
                    img={isBase ? SearchUrl : SearchDarkUrl}
                    title={t("Common:SearchBlock")}
                    dataTestId="show_filter"
                    description={t("Common:ManagerSearchBlockDescription")}
                  />
                </div>
              </>
            ) : null}

            <div className={styles.embeddingPanelCodeContainer}>
              <Text
                className={styles.embeddingPanelHeaderText}
                fontSize="15px"
                fontWeight={600}
              >
                {t("Common:Code")}
              </Text>
              <IconButton
                className={styles.embeddingPanelCopyIcon}
                size={16}
                iconName={CopyReactSvgUrl}
                onClick={onCopyLink}
                dataTestId="embedding_panel_copy_code"
              />
              <Textarea
                isReadOnly
                value={codeBlock}
                heightTextArea="150px"
                dataTestId="embedding_panel_code_textarea"
              />
            </div>
          </div>
        </div>
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
          testId="embedding_panel_copy_button"
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          onClick={onClose}
          label={t("Common:CancelButton")}
          isLoading={isLoading}
          testId="embedding_panel_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
});

export default EmbeddingPanel;
