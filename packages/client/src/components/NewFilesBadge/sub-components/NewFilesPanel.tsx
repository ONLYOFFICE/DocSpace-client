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

import api from "@docspace/shared/api";
import { TNewFiles } from "@docspace/shared/api/files/types";
import { Portal } from "@docspace/shared/components/portal";
import { toastr } from "@docspace/shared/components/toast";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { isMobile } from "@docspace/shared/utils";

import { NewFilesPanelProps } from "../NewFilesBadge.types";
import { StyledPanel } from "../NewFilesBadge.styled";

export const NewFilesPanel = ({
  position,
  folderId,
  onClose,
}: NewFilesPanelProps) => {
  const [data, setData] = React.useState<TNewFiles[]>([]);

  const requestRunning = React.useRef<boolean>(false);
  const dataFetched = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (!folderId || dataFetched.current || requestRunning.current) return;

    const getData = async () => {
      try {
        const newFiles = await api.files.getNewFiles(folderId);
        dataFetched.current = true;
        requestRunning.current = false;

        setData(newFiles);
      } catch (e) {
        requestRunning.current = false;

        toastr.error(e as string);
      }
    };

    requestRunning.current = true;

    getData();
  }, [folderId]);

  const isRooms = folderId === "rooms";

  const markAsReadButton = <Button scale label="Mark as read" />;

  const panel = (
    <StyledPanel className="new-files-panel" position={position}>
      sad
    </StyledPanel>
  );

  console.log(data, isRooms);

  const mobilePanel = (
    <ModalDialog
      visible
      isCloseable
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withFooterBorder
      withBodyScroll
    >
      <ModalDialog.Header>New files panel</ModalDialog.Header>
      <ModalDialog.Body>asd</ModalDialog.Body>
      <ModalDialog.Footer>{markAsReadButton}</ModalDialog.Footer>
    </ModalDialog>
  );

  const portal = <Portal element={panel} />;
  return isMobile() ? mobilePanel : portal;
};
