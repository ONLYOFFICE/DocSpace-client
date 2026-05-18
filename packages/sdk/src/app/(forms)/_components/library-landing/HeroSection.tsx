// (c) Copyright Ascensio System SIA 2009-2026
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

import React from "react";
import { useTranslation } from "react-i18next";

import HeroIllustrationUrl from "PUBLIC_DIR/images/library-hero.react.svg?url";

import HeroSearchBar from "./HeroSearchBar";
import styles from "./LibraryLanding.module.scss";

type HeroSectionProps = {
  templatesCount: number;
  language: string;
  langId: number | null;
  roomId?: string;
  libraryId?: string;
};

const HeroSection = ({
  templatesCount,
  language,
  langId,
  roomId,
  libraryId,
}: HeroSectionProps) => {
  const { t } = useTranslation("Common");

  const steps = [
    {
      title: t("Common:LibraryStep1Title"),
      desc: t("Common:LibraryStep1Desc", { count: templatesCount, language }),
    },
    {
      title: t("Common:LibraryStep2Title"),
      desc: t("Common:LibraryStep2Desc"),
    },
    {
      title: t("Common:LibraryStep3Title"),
      desc: t("Common:LibraryStep3Desc"),
    },
  ];

  return (
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>{t("Common:LibraryHeroTitle")}</h1>
      <p className={styles.heroDescription}>
        {t("Common:LibraryHeroDescription")}
      </p>

      <HeroSearchBar langId={langId} roomId={roomId} libraryId={libraryId} />

      <div className={styles.heroContent}>
        {/* biome-ignore lint/performance/noImgElement: static SVG via ?url import */}
        <img
          className={styles.heroIllustration}
          src={HeroIllustrationUrl}
          alt=""
          draggable={false}
        />

        <div className={styles.heroSteps}>
          <h3 className={styles.heroStepsTitle}>
            {t("Common:LibraryHowItWorks")}
          </h3>
          <ol className={styles.stepsList}>
            {steps.map((step, i) => (
              <li key={i} className={styles.stepItem}>
                <span className={styles.stepNumber}>{i + 1}</span>
                <div>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepDesc}>{step.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
