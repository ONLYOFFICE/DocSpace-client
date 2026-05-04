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
import { Row, RowContent } from "@docspace/ui-kit/components/rows";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { isMobile } from "@docspace/shared/utils";

import { useContextOptions } from "../useContextOptions";
import { RowItemType } from "../../types";
import { ApiKeysLifetimeIcon } from "../ApiKeysLifetimeIcon";
import { getStatusByDate } from "../../utils";
import styles from "./RowView.module.scss";

const RowItem = (props: RowItemType) => {
  const {
    item,
    culture,
    sectionWidth,
    onChangeApiKeyParams,
    onDeleteApiKey,
    onEditApiKey,
  } = props;

  const { t } = useTranslation(["Common"]);
  const { contextOptions } = useContextOptions(
    t,
    item,
    onEditApiKey,
    onDeleteApiKey,
  );

  const expiresAtDate = item.expiresAt
    ? getStatusByDate(item.expiresAt, culture)
    : "";

  return (
    <Row contextOptions={contextOptions}>
      <RowContent className={styles.rowContent} sectionWidth={sectionWidth}>
        <div>
          <div className="api-keys_name">
            <Text fontWeight={600} fontSize="14px">
              {item.name}
            </Text>
            <ApiKeysLifetimeIcon
              t={t}
              item={item}
              expiresAtDate={expiresAtDate}
              expiresAt={item.expiresAt}
            />
          </div>
          {!isMobile() ? (
            <div>
              <Text
                fontWeight={600}
                fontSize="12px"
                className="row-content_text"
              >
                {item.key} | {item.createBy.displayName}
              </Text>
            </div>
          ) : null}
        </div>

        <div className={styles.toggleButtonWrapper}>
          <ToggleButton
            className="toggleButton"
            isChecked={item.isActive}
            onChange={() =>
              onChangeApiKeyParams(item.id, { isActive: !item.isActive })
            }
          />
        </div>
      </RowContent>
    </Row>
  );
};

export default RowItem;
