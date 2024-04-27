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

import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/shared/themes";
import styled from "styled-components";

import SessionsTableHeader from "./SessionsTableHeader";
import SessionsTableRow from "./SessionsTableRow";

import { TableContainer } from "@docspace/shared/components/table";
import { TableBody } from "@docspace/shared/components/table";

const TABLE_VERSION = "5";
const COLUMNS_SIZE = `sessionsColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelSessionsColumnsSize_ver-${TABLE_VERSION}`;

const StyledTableContainer = styled(TableContainer)`
  margin: 0 0 20px;

  .table-container_header {
    position: absolute;
    padding: 0px 20px;
    border-image-source: ${(props) =>
      props.theme.tableContainer.header.borderImageSource} !important;
  }

  .header-container-text {
    color: ${(props) => props.theme.tableContainer.header.textColor};
    font-size: 12px;
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const TableView = ({ t, sectionWidth, userId, sessionsData }) => {
  const [hideColumns, setHideColumns] = useState(false);
  const ref = useRef(null);

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <StyledTableContainer forwardedRef={ref} useReactWindow>
      <SessionsTableHeader
        t={t}
        userId={userId}
        sectionWidth={sectionWidth}
        setHideColumns={setHideColumns}
        containerRef={ref}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        filesLength={sessionsData.length}
        hasMoreFiles={false}
        itemCount={sessionsData.length}
        fetchMoreFiles={() => {}}
      >
        {sessionsData.map((item) => (
          <SessionsTableRow
            t={t}
            key={item.id}
            hideColumns={hideColumns}
            userId={userId}
            item={item}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ userStore }) => {
  const { id: userId } = userStore.user;

  return {
    userId,
  };
})(observer(TableView));
