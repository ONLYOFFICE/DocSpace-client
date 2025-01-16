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

"use client";

import SpacesSvgUrl from "PUBLIC_DIR/images/spaces.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-common.svg?url";
import PaymentIconUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-payment.svg?url";
import GiftReactSvgUrl from "PUBLIC_DIR/images/gift.react.svg?url";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "styled-components";
import { observer } from "mobx-react";

import { DeviceType } from "@docspace/shared/enums";
import { ArticleItemNext as ArticleItem } from "@docspace/shared/components/article-item";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Portal } from "@docspace/shared/components/portal";

import { useStores } from "@/hooks/useStores";
import useDeviceType from "@/hooks/useDeviceType";

import { StyledArticle, StyledCrossIcon } from "./article.styled";
import { ArticleHeader } from "./article-header";
import { HideButton } from "./article-hide-button";

export const Article = observer(() => {
  const {
    articleStore: { showText, setShowText, articleOpen, setArticleOpen },
  } = useStores();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { currentDeviceType } = useDeviceType();

  useEffect(() => {
    if (currentDeviceType === DeviceType.mobile) {
      setShowText(true);
      return;
    }

    if (currentDeviceType === DeviceType.tablet) {
      setShowText(false);
      return;
    }

    setShowText(true);
  }, [setShowText, currentDeviceType]);

  const onItemClick = (key: string) => {
    if (currentDeviceType === DeviceType.mobile) setArticleOpen(!articleOpen);
    router.push(`/${key}`);
  };

  const articleComponent = (
    <StyledArticle showText={showText} articleOpen={articleOpen}>
      <div className="article__content">
        <ArticleHeader />
        <ArticleItem
          key="spaces"
          text="Spaces"
          icon={SpacesSvgUrl}
          showText={showText}
          onClick={() => onItemClick("spaces")}
          isActive={pathname === "/spaces"}
          folderId="management_catalog-spaces"
          $currentColorScheme={theme?.currentColorScheme}
          linkData={{ path: "/spaces", state: {} }}
        />
        <ArticleItem
          key="settings"
          text="Settings"
          icon={SettingsReactSvgUrl}
          showText={showText}
          onClick={() => onItemClick("settings")}
          isActive={pathname.includes("/settings")}
          folderId="management_catalog-settings"
          $currentColorScheme={theme?.currentColorScheme}
          linkData={{ path: "/settings", state: {} }}
        />
        <ArticleItem
          key="payments"
          text="Payments"
          icon={PaymentIconUrl}
          showText={showText}
          onClick={() => onItemClick("payments")}
          isActive={pathname === "/payments"}
          folderId="management_catalog-payments"
          $currentColorScheme={theme?.currentColorScheme}
          linkData={{ path: "/payments", state: {} }}
        />
        <ArticleItem
          key="bonus"
          text="Bonus"
          icon={GiftReactSvgUrl}
          showText={showText}
          onClick={() => onItemClick("bonus")}
          isActive={pathname === "/bonus"}
          folderId="management_catalog-bonus"
          $currentColorScheme={theme?.currentColorScheme}
          linkData={{ path: "/bonus", state: {} }}
        />
      </div>
      <HideButton />
    </StyledArticle>
  );

  const renderPortalArticle = () => {
    const articleElement = (
      <>
        <Backdrop
          visible={articleOpen}
          onClick={() => setArticleOpen(false)}
          withBackground
          //withBlur
        />
        {articleOpen && <StyledCrossIcon />}
        {articleComponent}
      </>
    );

    return (
      <Portal
        element={articleElement}
        appendTo={document.body}
        visible={articleOpen}
      />
    );
  };

  return currentDeviceType === DeviceType.mobile
    ? renderPortalArticle()
    : articleComponent;
});

