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

import { useState, useRef } from "react";
import { Trans } from "react-i18next";
import { TFunction } from "i18next";

import { TRoomParams } from "@docspace/shared/utils/rooms";

import FileLifetime from "./FileLifetime";
import Block from "./Block";
import Watermarks from "./Watermarks";

type TVirtualDataRoomParams = TRoomParams & {
  stealthMode?: boolean;
};

type VirtualDataRoomBlockProps = {
  t: TFunction;
  roomParams: TVirtualDataRoomParams;
  setRoomParams: (params: TVirtualDataRoomParams) => void;
  isEdit: boolean;
  showLifetimeDialog: boolean;
  setLifetimeDialogVisible: (visible: boolean, callback?: () => void) => void;
  setStealthModeDialogVisible: (
    visible: boolean,
    callback?: () => void,
    isEnable?: boolean,
  ) => void;
};

const VirtualDataRoomBlock = ({
  t,
  roomParams,
  setRoomParams,
  isEdit,
  showLifetimeDialog,
  setLifetimeDialogVisible,
  setStealthModeDialogVisible,
}: VirtualDataRoomBlockProps) => {
  const role = t("Common:RoleViewer");

  const initialInfo = useRef<TVirtualDataRoomParams | null>(null);

  if (initialInfo.current === null) {
    initialInfo.current = { ...roomParams };
  }
  const initialRoomParams = initialInfo.current;

  const [fileLifetimeChecked, setFileLifetimeChecked] = useState(
    !!roomParams?.lifetime,
  );

  const [stealthModeChecked, setStealthModeChecked] = useState(
    !!roomParams?.stealthMode,
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
        watermark: undefined,
      });

    setWatermarksChecked(!watermarksChecked);
  };

  const onChangeAutomaticIndexing = () => {
    setRoomParams({ ...roomParams, indexing: !roomParams.indexing });
  };

  const onChangeFileLifetime = () => {
    if (fileLifetimeChecked) {
      setRoomParams({ ...roomParams, lifetime: undefined });
      setFileLifetimeChecked(!fileLifetimeChecked);
    } else if (isEdit && showLifetimeDialog) {
      setLifetimeDialogVisible(true, () =>
        setFileLifetimeChecked(!fileLifetimeChecked),
      );
    } else {
      setFileLifetimeChecked(!fileLifetimeChecked);
    }
  };

  const onChangeStealthMode = () => {
    console.log("onChangeStealthMode", stealthModeChecked, isEdit);

    if (isEdit) {
      setStealthModeDialogVisible(
        true,
        () => setStealthModeChecked(!stealthModeChecked),
        stealthModeChecked,
      );
    } else {
      setStealthModeChecked(!stealthModeChecked);
      setRoomParams({
        ...roomParams,
        stealthMode: stealthModeChecked ? undefined : true,
      });
    }
  };

  const onChangeRestrictCopyAndDownload = () => {
    setRoomParams({ ...roomParams, denyDownload: !roomParams.denyDownload });

    setCopyAndDownloadChecked(!copyAndDownloadChecked);
  };

  return (
    <div>
      <Block
        headerText={t("AutomaticIndexing")}
        bodyText={t("AutomaticIndexingDescription")}
        onChange={onChangeAutomaticIndexing}
        isDisabled={false}
        isChecked={roomParams.indexing ?? false}
        dataTestId="virtual_data_room_automatic_indexing"
      />
      <Block
        headerText={t("FileLifetime")}
        bodyText={t("FileLifetimeDescription")}
        onChange={onChangeFileLifetime}
        isDisabled={false}
        isChecked={fileLifetimeChecked}
        dataTestId="virtual_data_room_file_lifetime"
      >
        <FileLifetime
          t={t}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
        />
      </Block>
      <Block
        headerText={t("StealthMode")}
        bodyText={t("StealthModeDescription")}
        onChange={onChangeStealthMode}
        isDisabled={false}
        isChecked={stealthModeChecked}
        dataTestId="virtual_data_room_file_stealth"
        isNew
      />
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
