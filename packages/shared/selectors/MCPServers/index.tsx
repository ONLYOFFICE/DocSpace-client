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

import EmptyScreenRoomSvgUrl from "PUBLIC_DIR/images/emptyview/empty.room.selector.light.svg?url";
import EmptyScreenRoomDarkSvgUrl from "PUBLIC_DIR/images/emptyview/empty.room.selector.dark.svg?url";

import { getAvailableServersList } from "../../api/ai";
import type { TServer } from "../../api/ai/types";
import { ServerType } from "../../api/ai/enums";

import { Selector, type TSelectorItem } from "../../components/selector";
import { getServerIcon } from "../../utils";
import { RowLoader } from "../../skeletons/selector";
import { useTheme } from "../../hooks/useTheme";

type MCPServersSelectorProps = {
  onSubmit: (servers: TSelectorItem[]) => void;
  onClose: VoidFunction;
  onBackClick: VoidFunction;

  initedSelectedServers?: string[];
};

const MCPServersSelector = ({
  initedSelectedServers,
  onSubmit,
  onClose,
  onBackClick,
}: MCPServersSelectorProps) => {
  const { t } = useTranslation(["Common"]);

  const { isBase } = useTheme();

  const [servers, setServers] = React.useState<TSelectorItem[]>([]);
  const [selectedServers, setSelectedServers] = React.useState<TSelectorItem[]>(
    [],
  );
  const [initedSelectedServersItems, setInitedSelectedServersItems] =
    React.useState<TSelectorItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const startCurrentIndexRef = React.useRef(0);
  const [totalServers, setTotalServers] = React.useState(0);

  const isRequestLoading = React.useRef(false);

  const convertServerToOption = React.useCallback(
    (server: TServer): TSelectorItem => {
      const name =
        server.serverType === ServerType.Portal
          ? `${t("Common:OrganizationName")} ${t("Common:ProductName")}`
          : server.name;

      return {
        key: server.id,
        id: server.id,
        label: name,
        icon:
          (server.icon?.icon32 || getServerIcon(server.serverType, isBase)) ??
          "",
        isMCP: true,
        isSelected: initedSelectedServers?.includes(server.id),
      };
    },
    [isBase, initedSelectedServers, t],
  );

  const fetchServers = React.useCallback(async () => {
    if (isRequestLoading.current) return;

    isRequestLoading.current = true;
    setIsLoading(true);
    const response = await getAvailableServersList(0, 100);

    if (response) {
      const items = response.items.map(convertServerToOption);

      const selectedItems = items.filter((i) => i.isSelected);

      setServers(items);
      setInitedSelectedServersItems(selectedItems);
      setSelectedServers(selectedItems);

      setTotalServers(response.total);
      startCurrentIndexRef.current = 100;
    }

    isRequestLoading.current = false;
    setIsLoading(false);
  }, [convertServerToOption]);

  const fetchMoreServer = React.useCallback(async () => {
    if (isRequestLoading.current) return;
    isRequestLoading.current = true;
    const response = await getAvailableServersList(
      startCurrentIndexRef.current,
      100,
    );

    if (response) {
      const items = response.items.map(convertServerToOption);

      setServers((prev) => [...prev, ...items]);

      const selectedItems = items.filter((i) => i.isSelected);

      setInitedSelectedServersItems((prev) => [...prev, ...selectedItems]);
      setSelectedServers((prev) => [...prev, ...selectedItems]);

      startCurrentIndexRef.current += 100;
      setTotalServers(response.total);
    }

    isRequestLoading.current = false;
    setIsLoading(false);
  }, [convertServerToOption]);

  const onSelect = (item: TSelectorItem) => {
    const isIncluded = selectedServers.some((i) => i.id === item.id);

    if (isIncluded) {
      setSelectedServers((prev) => prev.filter((id) => id.id !== item.id));
    } else {
      setSelectedServers((prev) => [...prev, item]);
    }
  };

  const onSubmitAction = () => {
    onSubmit(selectedServers);
    onBackClick();
  };

  React.useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return (
    <Selector
      items={servers}
      emptyScreenImage={
        isBase ? EmptyScreenRoomSvgUrl : EmptyScreenRoomDarkSvgUrl
      }
      emptyScreenHeader={t("Common:NoMCPServers", {
        mcpServers: t("Common:MCPSettingTitle"),
      })}
      emptyScreenDescription={t("Common:NoMCPServersDescription", {
        mcpServers: t("Common:MCPSettingTitle"),
        productName: t("Common:ProductName"),
      })}
      searchEmptyScreenImage={
        isBase ? EmptyScreenRoomSvgUrl : EmptyScreenRoomDarkSvgUrl
      }
      searchEmptyScreenHeader={t("Common:NotFoundTitle")}
      searchEmptyScreenDescription={t("Common:SearchEmptyRoomsDescription")}
      submitButtonLabel={t("Common:AddButton")}
      disableSubmitButton={false}
      onSubmit={onSubmitAction}
      rowLoader={<RowLoader />}
      hasNextPage={servers.length < totalServers}
      isNextPageLoading={false}
      totalItems={totalServers}
      loadNextPage={fetchMoreServer}
      isLoading={isLoading}
      isMultiSelect
      useAside={false}
      onClose={onClose}
      onSelect={onSelect}
      withHeader
      headerProps={{
        headerLabel: t("Common:AvailableMCPServers"),
        withoutBackButton: false,
        onBackClick: onBackClick,
        onCloseClick: onClose,
        withoutBorder: false,
      }}
      withCancelButton
      cancelButtonLabel={t("Common:CancelButton")}
      onCancel={onBackClick}
      selectedItems={initedSelectedServersItems}
    />
  );
};

export default MCPServersSelector;
