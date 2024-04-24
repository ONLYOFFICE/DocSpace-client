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

import React from "react";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { getCorrectDate } from "@docspace/shared/utils";

import { PluginStatus } from "SRC_DIR/helpers/plugins/enums";
import { Link } from "@docspace/shared/components/link";

import { getPluginUrl } from "../utils";

const StyledInfo = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr;
  grid-template-rows: 1fr;

  gap: 24px;

  max-width: 684px;

  margin-bottom: 24px;

  .plugin-info-image {
    width: 100%;
  }

  .plugin-info-container {
    display: grid;
    grid-template-columns: max-content 1fr;
    grid-template-rows: auto;

    gap: 16px;

    .row-name {
      color: #858585;
    }
  }
`;

const PluginInfo = ({
  image,
  version,
  author,
  status,
  description,
  createBy,
  createOn,
  homePage,

  url,
}) => {
  const getPluginStatusDesc = () => {
    switch (status) {
      case PluginStatus.active:
        return "Not need enter settings";
      case PluginStatus.hide:
      case PluginStatus.pending:
        return "Need enter settings";
    }
  };

  const pluginStatusDesc = getPluginStatusDesc();

  const uploadDate = getCorrectDate("en", createOn);

  const imgSrc = getPluginUrl(url, `/assets/${image}`);

  return (
    <StyledInfo>
      {image ? <img className="plugin-info-image" src={imgSrc} /> : <div></div>}
      <div className="plugin-info-container">
        <Text className="row-name">Version</Text>
        <Text>{version}</Text>
        <Text className="row-name">Author</Text>
        <Text>{author}</Text>
        <Text className="row-name">Uploader </Text>
        <Text>{createBy}</Text>
        <Text className="row-name">Upload date </Text>
        <Text>{uploadDate}</Text>
        <Text className="row-name">Status </Text>
        <Text>{pluginStatusDesc}</Text>
        <Text className="row-name">Homepage </Text>
        <Link target="_blank" href={homePage}>
          {homePage}
        </Link>
        <Text className="row-name">Description </Text>
        <Text>{description}</Text>
      </div>
    </StyledInfo>
  );
};

export default PluginInfo;
