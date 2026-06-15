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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";

import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";

import OformsStore from "SRC_DIR/store/OformsStore";

import commonStyles from "../../helpers/Common.module.scss";

import NoItem from "../../sub-components/NoItem";

import styles from "./Gallery.module.scss";
import ItemTitle from "./ItemTitle";

type GalleryProps = {
  gallerySelected?:
    | OformsStore["gallerySelected"]
    | {
        attributes: {
          card_prewiew: {
            data: {
              id: number;
              attributes: {
                url: string;
              };
            };
          };
          name_form: string;
          template_desc: string;
          description_card: string;
          updatedAt: string;
          template_image: {
            data: {
              id: number;
              attributes: {
                formats: {
                  thumbnail: {
                    ext: string;
                    url: string;
                    hash: string;
                    mime: string;
                    name: string;
                    path: string | null;
                    size: number;
                    width: number;
                    height: number;
                  };
                };
              };
            };
          };
          file_oform: {
            data: {
              id: number;
              attributes: { size: number };
            }[];
          };
        };
      };
  culture?: string;
};

const Gallery = ({ gallerySelected, culture }: GalleryProps) => {
  const { t } = useTranslation([
    "InfoPanel",
    "FormGallery",
    "Common",
    "Translations",
  ]);

  if (!gallerySelected) return <NoItem isGallery />;

  const thumbnailUrl =
    gallerySelected.attributes.card_prewiew.data.attributes.url;
  const formTitle = gallerySelected.attributes.name_form;
  const size = gallerySelected.attributes.file_oform.data[0].attributes.size;
  const sizeWithExtra =
    size < 1024 ? `${size.toFixed(0)} KB` : `${(size / 1024).toFixed(0)} MB`;

  return (
    <div data-testid="info_panel_gallery_container">
      <ItemTitle gallerySelected={gallerySelected} />
      <div
        className={styles.galleryThumbnail}
        data-testid="info_panel_gallery_thumbnail"
      >
        <img
          className={styles.galleryImg}
          src={thumbnailUrl}
          alt=""
          data-testid="info_panel_gallery_image"
        />
      </div>

      <div
        className={commonStyles.link}
        data-testid="info_panel_gallery_suggest_changes_container"
      >
        <Link
          className="link"
          href={`mailto:marketing@onlyoffice.com?subject=Suggesting changes for ${formTitle}&body=Suggesting changes for ${formTitle}.`}
          target={LinkTarget.blank}
          type={LinkType.action}
          isHovered
          color="accent"
          dataTestId="info_panel_gallery_suggest_changes_link"
        >
          {t("FormGallery:SuggestChanges")}
        </Link>
      </div>
      <div
        className={classNames(styles.select, commonStyles.subtitle)}
        data-testid="info_panel_gallery_description_header"
      >
        <Text fontWeight="600" fontSize="14px">
          {t("Common:DescriptionLabel")}
        </Text>
      </div>
      <Text
        className={styles.galleryFormDescription}
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
        data-testid="info_panel_gallery_description_text"
      >
        {gallerySelected.attributes.template_desc ||
          gallerySelected.attributes.description_card}
      </Text>
      <div
        className={classNames(styles.select, commonStyles.subtitle)}
        data-testid="info_panel_gallery_properties_header"
      >
        <Text fontWeight="600" fontSize="14px">
          {t("Properties")}
        </Text>
      </div>
      <div
        className={commonStyles.properties}
        data-testid="info_panel_gallery_properties"
      >
        <div
          className="property"
          data-testid="info_panel_gallery_date_modified_property"
        >
          <Text className={classNames(styles.select, "property-title")}>
            {t("InfoPanel:LastUpdateInfo")}
          </Text>
          <Text className={classNames(styles.select, "property-content")}>
            {getCorrectDate(
              culture ?? "en",
              gallerySelected.attributes.updatedAt,
            )}
          </Text>
        </div>
        <div
          className="property"
          data-testid="info_panel_gallery_size_property"
        >
          <Text className={classNames(styles.select, "property-title")}>
            {t("Common:Size")}
          </Text>
          <Text className={classNames(styles.select, "property-content")}>
            {sizeWithExtra}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default inject(({ settingsStore, oformsStore }: TStore) => {
  const { culture } = settingsStore;

  const { gallerySelected } = oformsStore;

  return {
    gallerySelected,
    culture,
  };
})(observer(Gallery));
