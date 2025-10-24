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

import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Row } from "@docspace/shared/components/rows";
import { toastr } from "@docspace/shared/components/toast";

import { RowContent } from "./RowContent";
import { RowProps } from "./RowView.types";

export const OAuthRow = (props: RowProps) => {
  const {
    item,
    sectionWidth,
    changeClientStatus,
    isChecked,
    inProgress,
    getContextMenuItems,
    setSelection,
    setBufferSelection,
  } = props;
  const navigate = useNavigate();

  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  const editClient = () => {
    navigate(`${item.clientId}`);
  };

  const handleToggleEnabled = async () => {
    if (!changeClientStatus) return;
    try {
      await changeClientStatus(item.clientId, !item.enabled);

      if (!item.enabled) {
        toastr.success(t("ApplicationEnabledSuccessfully"));
      } else {
        toastr.success(t("ApplicationDisabledSuccessfully"));
      }
    } catch (e) {
      toastr.error(e as string);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(".checkbox") ||
      target.closest(".table-container_row-checkbox") ||
      e.detail === 0
    ) {
      return;
    }

    if (
      target.closest(".table-container_row-context-menu-wrapper") ||
      target.closest(".toggleButton") ||
      target.closest(".row_context-menu-wrapper")
    ) {
      return setSelection && setSelection("");
    }

    editClient();
  };

  const contextOptions = getContextMenuItems && getContextMenuItems(t, item);

  const element = (
    <img style={{ borderRadius: "3px" }} src={item.logo} alt="App logo" />
  );

  return (
    <Row
      key={item.clientId}
      contextOptions={contextOptions}
      onRowClick={handleRowClick}
      element={element}
      mode="modern"
      checked={isChecked}
      inProgress={inProgress}
      onSelect={() => setSelection && setSelection(item.clientId)}
      className={`oauth2-row${isChecked ? " oauth2-row-selected" : ""}`}
      isIndexEditingMode={false}
      onContextClick={(isRightClick) => {
        if (isRightClick) return;
        setSelection!("");
        setBufferSelection!(item.clientId);
      }}
    >
      <RowContent
        sectionWidth={sectionWidth}
        item={item}
        isChecked={isChecked}
        inProgress={inProgress}
        setSelection={setSelection}
        handleToggleEnabled={handleToggleEnabled}
      />
    </Row>
  );
};
