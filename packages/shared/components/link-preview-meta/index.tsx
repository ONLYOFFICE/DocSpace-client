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

import {
  LINK_PREVIEW_IMAGE_HEIGHT,
  LINK_PREVIEW_IMAGE_ROUTE,
  LINK_PREVIEW_IMAGE_TYPE,
  LINK_PREVIEW_IMAGE_WIDTH,
  type TLinkPreview,
} from "../../utils/link-preview";

type LinkPreviewMetaProps = TLinkPreview & {
  baseUrl?: string;
};

const LinkPreviewMeta = ({
  baseUrl,
  title,
  description,
  imageVersion,
}: LinkPreviewMetaProps) => {
  const imageQuery = imageVersion
    ? `?v=${encodeURIComponent(imageVersion)}`
    : "";

  const imageUrl = baseUrl?.startsWith("http")
    ? `${baseUrl}${LINK_PREVIEW_IMAGE_ROUTE}${imageQuery}`
    : undefined;

  return (
    <>
      {description ? <meta name="description" content={description} /> : null}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      {description ? (
        <meta property="og:description" content={description} />
      ) : null}
      {imageUrl ? (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:type" content={LINK_PREVIEW_IMAGE_TYPE} />
          <meta property="og:image:width" content={LINK_PREVIEW_IMAGE_WIDTH} />
          <meta
            property="og:image:height"
            content={LINK_PREVIEW_IMAGE_HEIGHT}
          />
          <meta property="og:image:alt" content={title} />
        </>
      ) : null}

      <meta
        name="twitter:card"
        content={imageUrl ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={title} />
      {description ? (
        <meta name="twitter:description" content={description} />
      ) : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
    </>
  );
};

export default LinkPreviewMeta;
