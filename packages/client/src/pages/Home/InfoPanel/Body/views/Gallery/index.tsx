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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

import { getCorrectDate } from "@docspace/shared/utils";

import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import OformsStore from "SRC_DIR/store/OformsStore";

import commonStyles from "../../helpers/Common.module.scss";

import NoItem from "../../sub-components/NoItem";

import styles from "./Gallery.module.scss";
import ItemTitle from "./ItemTitle";

type GalleryProps = {
  gallerySelected?: OformsStore["gallerySelected"] | any;
  getIcon?: FilesSettingsStore["getIcon"];
  culture?: string;
};

const Gallery = ({ gallerySelected, getIcon, culture }: GalleryProps) => {
  const { t } = useTranslation([
    "InfoPanel",
    "FormGallery",
    "Common",
    "Translations",
  ]);

  if (!gallerySelected) return <NoItem isGallery />;

  const thumbnailBlank = getIcon?.(96, ".pdf");
  const thumbnailUrl =
    gallerySelected?.attributes?.template_image?.data?.attributes?.formats
      ?.small?.url;

  const formTitle = gallerySelected?.attributes?.name_form;

  return (
    <>
      <ItemTitle gallerySelected={gallerySelected} />
      {thumbnailUrl ? (
        <div className={styles.galleryThumbnail}>
          <img className={styles.galleryImg} src={thumbnailUrl} alt="" />
        </div>
      ) : (
        <div
          className={classNames(
            styles.galleryNoThumbnail,
            "no-thumbnail-img-wrapper",
          )}
        >
          <ReactSVG
            className={styles.noThumbnailImg}
            src={thumbnailBlank ?? ""}
          />
        </div>
      )}

      <div className={commonStyles.link}>
        <Link
          className="link"
          href={`mailto:marketing@onlyoffice.com?subject=Suggesting changes for ${formTitle}&body=Suggesting changes for ${formTitle}.`}
          target={LinkTarget.blank}
          type={LinkType.action}
          isHovered
          color="accent"
        >
          {t("FormGallery:SuggestChanges")}
        </Link>
      </div>

      <div className={commonStyles.subtitle}>
        <Text fontWeight="600" fontSize="14px">
          {t("Description")}
        </Text>
      </div>

      <Text
        className={styles.galleryFormDescription}
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
      >
        {gallerySelected?.attributes?.template_desc ||
          gallerySelected?.attributes?.description_card}
      </Text>

      <div className={commonStyles.subtitle}>
        <Text fontWeight="600" fontSize="14px">
          {t("Properties")}
        </Text>
      </div>

      <div className={commonStyles.properties}>
        <div className="property">
          <Text className="property-title">{t("InfoPanel:DateModified")}</Text>
          <Text className="property-content">
            {getCorrectDate(
              culture ?? "en",
              gallerySelected.attributes.updatedAt,
            )}
          </Text>
        </div>
      </div>
    </>
  );
};

export default inject(
  ({ settingsStore, filesSettingsStore, oformsStore }: TStore) => {
    const { culture } = settingsStore;

    const { gallerySelected } = oformsStore;

    const { getIcon } = filesSettingsStore;

    return {
      getIcon,

      gallerySelected,
      culture,
    };
  },
)(observer(Gallery));
