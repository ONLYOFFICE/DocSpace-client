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

import { useTranslation } from "react-i18next";

import { CollapsibleCard } from "@docspace/ui-kit/components/collapsible-card";
import { Text } from "@docspace/ui-kit/components/text";
import { getBrandName } from "@docspace/shared/constants/brands";

import ArrowIcon from "PUBLIC_DIR/images/arrow2.react.svg";

import styles from "../Dashboard.module.scss";

const PLATFORMS: { id: string; name: string; url: string }[] = [
  {
    id: "nextcloud",
    name: "Nextcloud",
    url: "https://www.onlyoffice.com",
  },
  {
    id: "owncloud",
    name: "ownCloud",
    url: "https://www.onlyoffice.com",
  },
  {
    id: "confluence",
    name: "Confluence",
    url: "https://www.onlyoffice.com",
  },
  {
    id: "alfresco",
    name: "Alfresco",
    url: "https://www.onlyoffice.com",
  },
  {
    id: "moodle",
    name: "Moodle",
    url: "https://www.onlyoffice.com",
  },
  {
    id: "seafile",
    name: "Seafile",
    url: "https://www.onlyoffice.com",
  },
  {
    id: "odoo",
    name: "Odoo",
    url: "https://www.onlyoffice.com",
  },
];

const VIEW_ALL_URL = "https://www.onlyoffice.com/all-connectors.aspx";

export const IntegrationsCard = () => {
  const { t } = useTranslation(["Common"]);

  return (
    <CollapsibleCard
      title={t("Common:AlreadyUsingAnotherPlatform")}
      description={t("Common:IntegrationsDescription", {
        productName: getBrandName("ProductName"),
      })}
      defaultOpen
    >
      <div className={styles.integrationsGrid}>
        {PLATFORMS.map((platform) => (
          <a
            key={platform.id}
            className={styles.integrationTile}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text as="p" className={styles.integrationName} isBold>
              {platform.name}
            </Text>
            <span className={styles.integrationLink}>
              {t("Common:Connect")}
              <ArrowIcon
                aria-hidden="true"
                className={styles.integrationArrow}
              />
            </span>
          </a>
        ))}
        <a
          className={`${styles.integrationTile} ${styles.integrationTileMore}`}
          href={VIEW_ALL_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Text as="p" className={styles.integrationName} isBold>
            {t("Common:PlusMore", { count: 20 })}
          </Text>
          <span className={styles.integrationLink}>
            {t("Common:ViewAll")}
            <ArrowIcon aria-hidden="true" className={styles.integrationArrow} />
          </span>
        </a>
      </div>
    </CollapsibleCard>
  );
};

export default IntegrationsCard;

