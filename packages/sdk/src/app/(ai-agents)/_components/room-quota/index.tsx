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

"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { QuotaForm } from "@docspace/shared/components/quota-form";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";

// SDK port of client RoomQuota. The store-driven `defaultQuota` (sourced from
// currentQuotaStore.defaultAIAgentsQuota) is accepted as a prop, since the
// SDK doesn't replicate CurrentQuotaStore.

type RoomQuotaProps = {
  setRoomParams: (roomParams: Partial<TAgentParams>) => void;
  roomParams: TAgentParams;
  defaultQuota?: number;
  isEdit?: boolean;
  isLoading: boolean;
  isAgent?: boolean;
};

const RoomQuota = ({
  setRoomParams,
  roomParams,
  defaultQuota,
  isEdit,
  isLoading,
  isAgent,
}: RoomQuotaProps) => {
  const { t } = useTranslation(["Common"]);

  const onSetQuotaBytesSize = (size: string) => {
    setRoomParams({ ...roomParams, quota: Number(size) });
  };

  const defaultValue = useRef(roomParams.quota ?? 0);

  return (
    <QuotaForm
      label={t("Common:StorageQuota", { defaultValue: "Storage quota" })}
      description={
        isAgent
          ? t("Common:StorageDescriptionAgent", {
              defaultValue:
                "Set a storage quota for this agent. When the limit is reached, new files cannot be uploaded.",
            })
          : t("Common:StorageDescription", {
              defaultValue: "Set a storage quota for this room.",
            })
      }
      checkboxLabel={
        isAgent
          ? t("Common:DisableRoomQuotaAgent", {
              defaultValue: "Disable storage quota for this agent",
            })
          : t("Common:DisableRoomQuota", {
              defaultValue: "Disable storage quota",
            })
      }
      onSetQuotaBytesSize={onSetQuotaBytesSize}
      initialSize={isEdit ? defaultValue.current : (defaultQuota ?? 0)}
      isDisabled={isLoading}
      isLoading={false}
      isError={false}
    />
  );
};

export default RoomQuota;
