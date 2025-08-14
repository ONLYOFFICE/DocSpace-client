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

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { TServer } from "@docspace/shared/api/ai/types";

import styles from "../../MCPServers.module.scss";

import { useHeaders } from "../../hooks/useHeaders";
import { useBaseParams } from "../../hooks/useBaseParams";
import { useIcon } from "../../hooks/useIcon";

type EditDialogProps = {
  server: TServer;
  onSubmit: (
    endpoint: string,
    name: string,
    description: string,
    headers: Record<string, string>,
  ) => Promise<void>;
  onClose: VoidFunction;
};

const EditDialog = ({ server, onSubmit, onClose }: EditDialogProps) => {
  const { t } = useTranslation(["MCPServers", "Common", "OAuth"]);

  const [loading, setLoading] = React.useState(false);

  const { getBaseParams, baseParamsComponent } = useBaseParams({
    url: server?.endpoint,
    name: server?.name,
    description: server?.description,
  });
  const { headersComponent, getAPIHeaders } = useHeaders(server?.headers);
  const { iconComponent, getIcon } = useIcon();

  const onSubmitAction = async () => {
    const headers = getAPIHeaders();
    const baseParams = getBaseParams();
    const icon = getIcon();

    if (!baseParams) return;

    console.log(icon);

    setLoading(true);

    await onSubmit(
      baseParams.url,
      baseParams.name,
      baseParams.description,
      headers,
    );

    setLoading(false);

    onClose();
  };

  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
    >
      <ModalDialog.Header>{t("MCPServers:MCPServer")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.bodyContainer}>
          {iconComponent}
          {baseParamsComponent}
          {headersComponent}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:AddButton")}
          scale
          onClick={onSubmitAction}
          isLoading={loading}
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          isDisabled={loading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default EditDialog;
