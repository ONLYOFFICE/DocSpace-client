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

import { useTranslation, Trans } from "react-i18next";

import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { Text } from "@docspace/ui-kit/components/text";
import { DeviceType } from "@docspace/shared/enums";
import { Consumer } from "@docspace/ui-kit/utils/context";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";

import { ViewAsType } from "SRC_DIR/store/OAuthStore";
import { EmptyServerErrorContainer } from "SRC_DIR/components/EmptyContainer/EmptyServerErrorContainer";

import RegisterNewButton from "../RegisterNewButton";

import TableView from "./TableView";
import RowView from "./RowView";

import styles from "./List.styled.module.scss";
import OAuthLoader from "./Loader";
import { getBrandName } from "@docspace/shared/constants/brands";

interface ListProps {
  clients: IClientProps[];
  viewAs: ViewAsType;
  currentDeviceType: DeviceType;
  apiOAuthLink: string;
  logoText: string;
  isLoading?: boolean;
  isError: boolean;
}

const List = ({
  clients,
  viewAs,
  currentDeviceType,
  apiOAuthLink,
  logoText,
  isLoading,
  isError,
}: ListProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const descText = (
    <Trans
      ns="OAuth"
      t={t}
      i18nKey="OAuthAppDescription"
      values={{
        productName: getBrandName("ProductName"),
        organizationName: logoText,
      }}
    />
  );

  return (
    <div className={styles.styledContainer}>
      <Text
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
        className="description"
      >
        {descText}
      </Text>
      {apiOAuthLink ? (
        <Link
          target={LinkTarget.blank}
          type={LinkType.page}
          fontWeight={600}
          isHovered
          href={apiOAuthLink}
          tag="a"
          style={isError ? undefined : { marginBottom: "20px" }}
          color="accent"
          dataTestId="oauth_guide_link"
        >
          {t("OAuth:ReadOAuthGuide")}
        </Link>
      ) : null}

      {isError ? (
        <EmptyServerErrorContainer />
      ) : (
        <>
          <RegisterNewButton
            currentDeviceType={currentDeviceType}
            isDisabled={isLoading}
          />
          {isLoading ? (
            <OAuthLoader viewAs={viewAs} />
          ) : (
            <Consumer>
              {(context) =>
                viewAs === "table" ? (
                  <TableView
                    items={clients || []}
                    sectionWidth={context.sectionWidth || 0}
                  />
                ) : (
                  <RowView
                    items={clients || []}
                    sectionWidth={context.sectionWidth || 0}
                  />
                )
              }
            </Consumer>
          )}
        </>
      )}
    </div>
  );
};

export default List;
