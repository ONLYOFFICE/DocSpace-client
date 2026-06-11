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

import EditorsSvg from "PUBLIC_DIR/images/icons/16/docs-connect.editors.react.svg";
import MsOfficeSvg from "PUBLIC_DIR/images/icons/16/docs-connect.ms-office.react.svg";
import CollaborationSvg from "PUBLIC_DIR/images/icons/16/docs-connect.collaboration.react.svg";
import CloudSvg from "PUBLIC_DIR/images/icons/16/docs-connect.cloud.react.svg";
import EmbedSvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-javascript-sdk.react.svg";
import PluginSvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-plugin-sdk.react.svg";
import OAuthSvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-oauth.react.svg";
import KeySvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-api-keys.react.svg";

import WordSvg from "PUBLIC_DIR/images/icons/32/word.svg";
import CellSvg from "PUBLIC_DIR/images/icons/32/cell.svg";
import SlideSvg from "PUBLIC_DIR/images/icons/32/slide.svg";
import PdfSvg from "PUBLIC_DIR/images/icons/32/pdf.svg";

import ArrowSvg from "PUBLIC_DIR/images/arrow2.react.svg";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType, LinkTarget } from "@docspace/ui-kit/components/link";
import { globalColors } from "@docspace/ui-kit/providers";

import { getBrandName } from "@docspace/shared/constants/brands";

import styles from "./PromoPage.module.scss";

const API_DOCS_URL = "https://api.onlyoffice.com/";

const FeatureIcon = ({
  Icon,
  color,
}: {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}) => (
  <div className={styles.featureIcon} style={{ backgroundColor: `${color}1a` }}>
    <span className={styles.featureIconInner} style={{ color }}>
      <Icon />
    </span>
  </div>
);

interface PromoPageProps {
  startTrial?: () => void;
}

const PromoPage = ({ startTrial }: PromoPageProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);

  const editorsName = getBrandName("ProductEditorsName");
  const docsName = `${getBrandName("OrganizationName")} ${editorsName}`;

  // Colors drive the tinted icon box; the glyphs themselves are currentColor.
  // t() keys are static literals so the translation-usage scanner can see them.
  const features = [
    {
      title: t("DocsConnect:FeatureEditorsTitle"),
      description: t("DocsConnect:FeatureEditorsDescription"),
      Icon: EditorsSvg,
      color: globalColors.lightBlueMain,
    },
    {
      title: t("DocsConnect:FeatureCompatibilityTitle"),
      description: t("DocsConnect:FeatureCompatibilityDescription"),
      Icon: MsOfficeSvg,
      color: "#13B7EC",
    },
    {
      title: t("DocsConnect:FeatureCollaborationTitle"),
      description: t("DocsConnect:FeatureCollaborationDescription"),
      Icon: CollaborationSvg,
      color: globalColors.secondGreen,
    },
    {
      title: t("DocsConnect:FeatureIntegrationTitle"),
      description: t("DocsConnect:FeatureIntegrationDescription", {
        editorsName,
      }),
      Icon: EmbedSvg,
      color: globalColors.indigoBlue,
    },
    {
      title: t("DocsConnect:FeatureExtensibleTitle"),
      description: t("DocsConnect:FeatureExtensibleDescription"),
      Icon: PluginSvg,
      color: globalColors.purple,
    },
    {
      title: t("DocsConnect:FeatureSecureTitle"),
      description: t("DocsConnect:FeatureSecureDescription"),
      Icon: OAuthSvg,
      color: globalColors.mainRed,
    },
  ];

  const editors = [
    {
      title: t("DocsConnect:EditorDocumentTitle"),
      description: t("DocsConnect:EditorDocumentDescription"),
      Icon: WordSvg,
    },
    {
      title: t("DocsConnect:EditorSpreadsheetTitle"),
      description: t("DocsConnect:EditorSpreadsheetDescription"),
      Icon: CellSvg,
    },
    {
      title: t("DocsConnect:EditorPresentationTitle"),
      description: t("DocsConnect:EditorPresentationDescription"),
      Icon: SlideSvg,
    },
    {
      title: t("DocsConnect:EditorPdfTitle"),
      description: t("DocsConnect:EditorPdfDescription"),
      Icon: PdfSvg,
    },
  ];

  const why = [
    {
      title: t("DocsConnect:WhyCloudTitle"),
      description: t("DocsConnect:WhyCloudDescription"),
      Icon: CloudSvg,
      color: globalColors.lightBlueMain,
    },
    {
      title: t("DocsConnect:WhyKeysTitle"),
      description: t("DocsConnect:WhyKeysDescription"),
      Icon: KeySvg,
      color: globalColors.indigoBlue,
    },
    {
      title: t("DocsConnect:WhyPanelTitle"),
      description: t("DocsConnect:WhyPanelDescription"),
      Icon: OAuthSvg,
      color: globalColors.secondGreen,
    },
  ];

  const onViewApiDocs = () => {
    // TODO(docs-connect): point to the real API documentation URL.
    window.open(API_DOCS_URL, "_blank");
  };

  const renderCtaButtons = () => (
    <div className={styles.ctaButtons}>
      <Button
        primary
        size={ButtonSize.normal}
        label={t("DocsConnect:StartFreeTrial")}
        onClick={() => startTrial?.()}
      />
      <Button
        size={ButtonSize.normal}
        label={t("DocsConnect:ViewApiDocs")}
        onClick={onViewApiDocs}
      />
    </div>
  );

  return (
    <div className={styles.promo}>
      <section className={styles.hero}>
        <Heading level={HeadingLevel.h1} className={styles.heroTitle}>
          {t("DocsConnect:DocsConnect")}
        </Heading>
        <Text className={styles.heroSubtitle}>
          {t("DocsConnect:PromoSubtitle", { productName: docsName })}
        </Text>
        {renderCtaButtons()}
      </section>

      <section className={styles.section}>
        <Heading level={HeadingLevel.h2} className={styles.sectionTitle}>
          {t("DocsConnect:EverythingTitle")}
        </Heading>
        <Text className={styles.sectionSubtitle}>
          {t("DocsConnect:EverythingSubtitle")}
        </Text>
        <div className={styles.grid3}>
          {features.map(({ title, description, Icon, color }) => (
            <div key={title} className={styles.featureCard}>
              <FeatureIcon Icon={Icon} color={color} />
              <Text fontSize="14px" fontWeight={600}>
                {title}
              </Text>
              <Text fontSize="12px" className={styles.sectionSubtitle}>
                {description}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={HeadingLevel.h2} className={styles.sectionTitle}>
          {t("DocsConnect:EditorsTitle")}
        </Heading>
        <Text className={styles.sectionSubtitle}>
          {t("DocsConnect:EditorsSubtitle")}
        </Text>
        <div className={styles.grid4}>
          {editors.map(({ title, description, Icon }) => (
            <div key={title} className={styles.featureCard}>
              <Icon width="32" height="32" />
              <Text fontSize="14px" fontWeight={600}>
                {title}
              </Text>
              <Text fontSize="12px" className={styles.sectionSubtitle}>
                {description}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={HeadingLevel.h2} className={styles.sectionTitle}>
          {t("DocsConnect:IntegrateTitle")}
        </Heading>
        <Text className={styles.sectionSubtitle}>
          {t("DocsConnect:IntegrateSubtitle")}
        </Text>
        <div className={styles.grid2}>
          <div className={styles.featureCard}>
            <Text fontSize="14px" fontWeight={600}>
              {t("DocsConnect:IntegrateConnectorsTitle")}
            </Text>
            <Text fontSize="12px" className={styles.sectionSubtitle}>
              {t("DocsConnect:IntegrateConnectorsDescription", {
                productName: docsName,
              })}
            </Text>
            <hr className={styles.cardDivider} />
            <Link
              className={styles.cardLink}
              type={LinkType.page}
              color="accent"
              fontSize="13px"
              fontWeight={600}
              onClick={onViewApiDocs}
            >
              {t("DocsConnect:BrowseAllConnectors")} {/*  */}
              <ArrowSvg />
            </Link>
          </div>
          <div className={styles.featureCard}>
            <Text fontSize="14px" fontWeight={600}>
              {t("DocsConnect:IntegrateApiTitle")}
            </Text>
            <Text fontSize="12px" className={styles.sectionSubtitle}>
              {t("DocsConnect:IntegrateApiDescription", { editorsName })}
            </Text>
            <hr className={styles.cardDivider} />
            <Link
              className={styles.cardLink}
              type={LinkType.page}
              target={LinkTarget.blank}
              href={API_DOCS_URL}
              color="accent"
              fontSize="13px"
              fontWeight={600}
            >
              {t("DocsConnect:ReadApiDocs")}
              {/*  */}
              <ArrowSvg />
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={HeadingLevel.h2} className={styles.sectionTitle}>
          {t("DocsConnect:WhyTitle", { productName: docsName })}
        </Heading>
        <Text className={styles.sectionSubtitle}>
          {t("DocsConnect:WhySubtitle", { productName: docsName })}
        </Text>
        <div className={styles.grid3}>
          {why.map(({ title, description, Icon, color }) => (
            <div key={title} className={styles.featureCard}>
              <FeatureIcon Icon={Icon} color={color} />
              <Text fontSize="14px" fontWeight={600}>
                {title}
              </Text>
              <Text fontSize="12px" className={styles.sectionSubtitle}>
                {description}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaBand}>
        <Heading level={HeadingLevel.h2} className={styles.sectionTitle}>
          {t("DocsConnect:StartBuildingTitle")}
        </Heading>
        <Text className={styles.ctaSubtitle}>
          {t("DocsConnect:StartBuildingSubtitle")}
        </Text>
        {renderCtaButtons()}
      </section>
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  startTrial: docsConnectStore.startTrial,
}))(observer(PromoPage));

