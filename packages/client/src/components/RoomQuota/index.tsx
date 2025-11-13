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

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { QuotaForm } from "@docspace/shared/components/quota-form";
import { TRoomParams } from "@docspace/shared/utils/rooms";
import { TAgentParams } from "@docspace/shared/utils/aiAgents";

type RoomQuotaProps = {
  setRoomParams: (roomParams: TAgentParams | TRoomParams) => void;
  roomParams: TRoomParams | TAgentParams;
  defaultQuota?: number;
  isEdit?: boolean;
  isTemplate?: boolean;
  isLoading: boolean;
  isAgent?: boolean;
};

const RoomQuota = ({
  setRoomParams,
  roomParams,
  defaultQuota,
  isEdit,
  isTemplate,
  isLoading,
  isAgent,
}: RoomQuotaProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  const onSetQuotaBytesSize = (size: string) => {
    setRoomParams({ ...roomParams, quota: Number(size) });
  };

  const defaultValue = useRef(roomParams.quota!);

  return (
    <QuotaForm
      label={t("Common:StorageQuota")}
      description={
        isAgent ? t("StorageDescriptionAgent") : t("StorageDescription")
      }
      checkboxLabel={
        isAgent ? t("DisableRoomQuotaAgent") : t("DisableRoomQuota")
      }
      onSetQuotaBytesSize={onSetQuotaBytesSize}
      initialSize={isEdit || isTemplate ? defaultValue.current : defaultQuota!}
      isDisabled={
        isLoading ||
        ("storageLocation" in roomParams &&
          roomParams.storageLocation.isThirdparty)
      }
      isLoading={false}
      isError={false}
    />
  );
};

export default inject(
  ({ currentQuotaStore }: TStore, { isAgent }: { isAgent?: boolean }) => {
    const { defaultRoomsQuota, defaultAIAgentsQuota } = currentQuotaStore;

    return { defaultQuota: isAgent ? defaultAIAgentsQuota : defaultRoomsQuota };
  },
)(observer(RoomQuota));
