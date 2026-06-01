// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.light.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.dark.svg?url";

import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { EmptyScreenContainer } from "@docspace/ui-kit/components/empty-screen-container";

import styles from "../Members.module.scss";

const EmptyContainer = () => {
  const { t } = useTranslation("Common");
  const { isBase } = useTheme();

  const imageSrc = isBase
    ? EmptyScreenPersonSvgUrl
    : EmptyScreenPersonSvgDarkUrl;

  return (
    <EmptyScreenContainer
      imageSrc={imageSrc}
      imageAlt="Empty screen image"
      headerText={t("NotFoundMembers")}
      descriptionText={t("NotFoundUsersDescription")}
      className={styles.emptyScreen}
    />
  );
};

export default EmptyContainer;
