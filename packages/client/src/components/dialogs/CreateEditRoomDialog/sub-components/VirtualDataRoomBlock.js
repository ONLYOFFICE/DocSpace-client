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

import { useState, useRef } from "react";
import { Trans } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";

import FileLifetime from "./FileLifetime";
import Watermarks from "./Watermarks";

import styles from "../CreateEditRoomDialog.module.scss";

const Block = ({
  headerText,
  bodyText,
  onChange,
  isDisabled,
  isChecked,
  children,
  dataTestId,
}) => {
  return (
    <div className="virtual-data-room-block" data-testid={dataTestId}>
      <div className="virtual-data-room-block_header">
        <Text fontWeight={600} fontSize="13px">
          {headerText}
        </Text>
        <ToggleButton
          isDisabled={isDisabled}
          isChecked={isChecked}
          onChange={onChange}
          className="virtual-data-room-block_toggle"
          dataTestId={dataTestId ? `${dataTestId}_toggle` : undefined}
        />
      </div>
      <Text
        fontWeight={400}
        fontSize="12px"
        className="virtual-data-room-block_description"
      >
        {bodyText}
      </Text>
      {isChecked ? (
        <div className="virtual-data-room-block_content">{children}</div>
      ) : null}
    </div>
  );
};

const VirtualDataRoomBlock = ({
  t,
  roomParams,
  setRoomParams,
  isEdit,
  showLifetimeDialog,
  setLifetimeDialogVisible,
}) => {
  const role = t("Common:RoleViewer");

  const initialInfo = useRef(null);

  if (initialInfo.current === null) {
    initialInfo.current = { ...roomParams };
  }
  const initialRoomParams = initialInfo.current;

  const [fileLifetimeChecked, setFileLifetimeChecked] = useState(
    !!roomParams?.lifetime,
  );
  const [copyAndDownloadChecked, setCopyAndDownloadChecked] = useState(
    !!roomParams?.denyDownload,
  );

  const [watermarksChecked, setWatermarksChecked] = useState(
    !!roomParams.watermark,
  );

  const onChangeAddWatermarksToDocuments = () => {
    if (watermarksChecked)
      setRoomParams({
        ...roomParams,
        watermark: null,
      });

    setWatermarksChecked(!watermarksChecked);
  };

  const onChangeAutomaticIndexing = () => {
    setRoomParams({ ...roomParams, indexing: !roomParams.indexing });
  };

  const onChangeFileLifetime = () => {
    if (fileLifetimeChecked) {
      setRoomParams({ ...roomParams, lifetime: null });
      setFileLifetimeChecked(!fileLifetimeChecked);
    } else if (isEdit && showLifetimeDialog) {
      setLifetimeDialogVisible(true, () =>
        setFileLifetimeChecked(!fileLifetimeChecked),
      );
    } else {
      setFileLifetimeChecked(!fileLifetimeChecked);
    }
  };

  const onChangeRestrictCopyAndDownload = () => {
    setRoomParams({ ...roomParams, denyDownload: !roomParams.denyDownload });

    setCopyAndDownloadChecked(!copyAndDownloadChecked);
  };

  return (
    <div className={styles.virtualDataRoomBlock}>
      <Block
        headerText={t("AutomaticIndexing")}
        bodyText={t("AutomaticIndexingDescription")}
        onChange={onChangeAutomaticIndexing}
        isDisabled={false}
        isChecked={roomParams.indexing}
        dataTestId="virtual_data_room_automatic_indexing"
      />
      <Block
        headerText={t("FileLifetime")}
        bodyText={t("FileLifetimeDescription")}
        onChange={onChangeFileLifetime}
        isDisabled={false}
        isChecked={fileLifetimeChecked}
        setLifetimeDialogVisible={setLifetimeDialogVisible}
        dataTestId="virtual_data_room_file_lifetime"
      >
        <FileLifetime
          t={t}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
        />
      </Block>
      <Block
        headerText={t("RestrictCopyAndDownload")}
        bodyText={
          <Trans t={t} i18nKey="RestrictCopyAndDownloadDescription">
            Enable this setting to disable downloads and content copying for
            users with the {{ role }} role.
          </Trans>
        }
        onChange={onChangeRestrictCopyAndDownload}
        isDisabled={false}
        isChecked={copyAndDownloadChecked}
        dataTestId="virtual_data_room_restrict_copy_download"
      />

      <Block
        headerText={t("AddWatermarksToDocuments")}
        bodyText={t("AddWatermarksToDocumentsDescription")}
        onChange={onChangeAddWatermarksToDocuments}
        isDisabled={false}
        isChecked={watermarksChecked}
        dataTestId="virtual_data_room_add_watermarks"
      >
        <Watermarks
          isEdit={isEdit}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          initialRoomParams={initialRoomParams}
        />
      </Block>
    </div>
  );
};

export default VirtualDataRoomBlock;
