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
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";

import { TColorScheme, TTheme } from "@docspace/shared/themes";
import { TTranslation } from "@docspace/shared/types";

import ZoomIcon from "PUBLIC_DIR/images/zoom.integration.react.svg?url";
import WordpressIcon from "PUBLIC_DIR/images/wordpress.integration.react.svg?url";
import DrupalIcon from "PUBLIC_DIR/images/drupal.integration.react.svg?url";
import ArrowIcon from "PUBLIC_DIR/images/arrow.integration.react.svg?url";

import {
  IntegrationContainer,
  CategoryHeader,
} from "./StyledPortalIntegration";

const allConnectors = "https://www.onlyoffice.com/all-connectors.aspx";
const zoom = "https://www.onlyoffice.com/office-for-zoom.aspx";
const wordPress = "https://www.onlyoffice.com/office-for-wordpress.aspx";
const drupal = "https://www.onlyoffice.com/office-for-drupal.aspx";

export const Integration = (props: {
  t: TTranslation;
  theme: TTheme;
  currentColorScheme: TColorScheme;
  className: string;
}) => {
  const { t, theme, currentColorScheme, className } = props;

  return (
    <IntegrationContainer
      className={className}
      theme={theme}
      color={currentColorScheme.main?.accent}
    >
      <CategoryHeader className="integration-header">
        {t("IntegrationExamples")}
      </CategoryHeader>
      <Text lineHeight="20px" color={theme.sdkPresets.secondaryColor}>
        {t("IntegrationDescription", { productName: t("Common:ProductName") })}
      </Text>
      <div className="icons">
        <div className="icon" title="Zoom">
          <ReactSVG
            className="icon-zoom"
            src={ZoomIcon}
            onClick={() => window.open(zoom, "_blank")}
          />
        </div>

        <div className="icon" title="WordPress">
          <ReactSVG
            className="icon-wordpress"
            src={WordpressIcon}
            onClick={() => window.open(wordPress, "_blank")}
          />
        </div>

        <div className="icon" title="Drupal">
          <ReactSVG
            className="icon-drupal"
            src={DrupalIcon}
            onClick={() => window.open(drupal, "_blank")}
          />
        </div>
      </div>
      <div className="link-container">
        <Link
          className="link"
          noHover
          color={currentColorScheme.main?.accent}
          onClick={() => window.open(allConnectors, "_blank")}
        >
          {t("SeeAllConnectors")}
        </Link>

        <div className="icon">
          <ReactSVG
            className="icon-arrow"
            src={ArrowIcon}
            onClick={() => window.open(allConnectors, "_blank")}
          />
        </div>
      </div>
    </IntegrationContainer>
  );
};
