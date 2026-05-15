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

import SpacesSvg from "PUBLIC_DIR/images/spaces.react.svg";
import SettingsReactSvg from "PUBLIC_DIR/images/icons/16/catalog-settings-common.svg";
import PaymentIcon from "PUBLIC_DIR/images/icons/16/catalog-settings-payment.svg";
import GiftReactSvg from "PUBLIC_DIR/images/gift.react.svg";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { useRouter, usePathname } from "next/navigation";
import classNames from "classnames";
import { ReactSVG } from "react-svg";

import { DeviceType } from "@docspace/shared/enums";
import { ArticleItem } from "@docspace/ui-kit/components/article/item";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { Portal } from "@docspace/ui-kit/components/portal";
import { useStores } from "@/hooks/useStores";
import useDeviceType from "@/hooks/useDeviceType";

import { ArticleHeader } from "./article-header";
import { HideButton } from "./article-hide-button";

import styles from "./article.module.scss";

export const Article = observer(({ isCommunity }: { isCommunity: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    articleStore: { showText, setShowText, articleOpen, setArticleOpen },
  } = useStores();

  const { t } = useTranslation("Common");

  const { currentDeviceType } = useDeviceType();

  const [activePath, setActivePath] = useState(pathname);

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
    const targetPath = `/${key}`;
    setActivePath(targetPath);
    router.push(targetPath);
  };

  const articleComponent = (
    <article
      className={classNames(styles.article, {
        [styles.showText]: showText,
        [styles.articleOpen]: articleOpen,
      })}
    >
      <div className={styles.articleContent}>
        <ArticleHeader />
        <ArticleItem
          key="spaces"
          text={t("Common:Spaces")}
          iconNode={<SpacesSvg />}
          showText={showText}
          onClick={() => onItemClick("spaces")}
          isActive={activePath.includes("spaces")}
          folderId="management_catalog-spaces"
          linkData={{ path: "/spaces", state: {} }}
          withAnimation
        />
        <ArticleItem
          key="settings"
          text={t("Common:Settings")}
          iconNode={<SettingsReactSvg />}
          showText={showText}
          onClick={() => onItemClick("settings/branding")}
          isActive={activePath.includes("settings")}
          folderId="management_catalog-settings"
          linkData={{ path: "/settings/branding", state: {} }}
          withAnimation
        />
        {!isCommunity ? (
          <ArticleItem
            key="payments"
            text={t("Common:PaymentsTitle")}
            iconNode={<PaymentIcon />}
            showText={showText}
            onClick={() => onItemClick("payments")}
            isActive={activePath.includes("payments")}
            folderId="management_catalog-payments"
            linkData={{ path: "/payments", state: {} }}
            withAnimation
          />
        ) : (
          <ArticleItem
            key="bonus"
            text={t("Common:Bonus")}
            iconNode={<GiftReactSvg />}
            showText={showText}
            onClick={() => onItemClick("bonus")}
            isActive={activePath.includes("bonus")}
            folderId="management_catalog-bonus"
            linkData={{ path: "/bonus", state: {} }}
            withAnimation
          />
        )}
      </div>
      <HideButton />
    </article>
  );

  const renderPortalArticle = () => {
    const articleElement = (
      <>
        <Backdrop
          visible={articleOpen}
          onClick={() => setArticleOpen(false)}
          withBackground
        />
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
