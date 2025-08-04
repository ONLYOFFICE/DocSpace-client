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

import React from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { TServer } from "@docspace/shared/api/ai/types";
import { getServersList } from "@docspace/shared/api/ai";

import styles from "./MCPServers.module.scss";

const MCPServers = () => {
  const { t } = useTranslation(["MCPServers", "Common"]);
  const [serversList, setServersList] = React.useState<TServer[]>([]);

  React.useEffect(() => {
    const fetchServersList = async () => {
      const servers = await getServersList(0, 100);
      if (servers) {
        setServersList(servers.items);
      }
    };

    fetchServersList();
  }, []);

  return (
    <div className={styles.mcpServerContainer}>
      <Text
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
        className={styles.description}
      >
        {t("Description")}
      </Text>
      <Link
        target={LinkTarget.blank}
        type={LinkType.page}
        fontWeight={600}
        isHovered
        href=""
        style={{ marginBottom: "8px" }}
        color="accent"
      >
        {t("Common:LearnMore")}
      </Link>
      <Button
        primary
        size={ButtonSize.small}
        label={t("AddServer")}
        scale={false}
        className={styles.button}
      />
      <div>
        {serversList.map((server) => (
          <div key={server.id}>{server.name}</div>
        ))}
      </div>
    </div>
  );
};

export default MCPServers;
