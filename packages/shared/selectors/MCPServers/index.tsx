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

import { getAvailableServersList } from "../../api/ai";
import { TServer } from "../../api/ai/types";

import { Selector, TSelectorItem } from "../../components/selector";
import { getServerIcon } from "../../utils/getServerIcon";

import { RowLoader } from "../../skeletons/selector";

type MCPServersSelectorProps = {
  onSubmit: (servers: TSelectorItem[]) => void;
  onClose: VoidFunction;
};

const MCPServersSelector = ({ onSubmit, onClose }: MCPServersSelectorProps) => {
  const { t } = useTranslation(["Common"]);

  const [servers, setServers] = React.useState<TSelectorItem[]>([]);
  const [selectedServers, setSelectedServers] = React.useState<TSelectorItem[]>(
    [],
  );

  const startCurrentIndexRef = React.useRef(0);
  const [totalServers, setTotalServers] = React.useState(0);

  const isRequestLoading = React.useRef(false);

  const convertServerToOption = React.useCallback(
    (server: TServer): TSelectorItem => {
      return {
        key: server.id,
        id: server.id,
        label: server.name,
        icon: getServerIcon(server.serverType) ?? "",
        isInputItem: false,
        onAcceptInput: () => {},
        onCancelInput: () => {},
        defaultInputValue: "",
        placeholder: "",
      };
    },
    [],
  );

  const fetchServers = React.useCallback(async () => {
    if (isRequestLoading.current) return;

    isRequestLoading.current = true;
    const response = await getAvailableServersList(0, 100);

    if (response) {
      const items = response.items.map(convertServerToOption);

      setServers(items);

      setTotalServers(response.total);
      startCurrentIndexRef.current = 100;
    }

    isRequestLoading.current = false;
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

      startCurrentIndexRef.current += 100;
      setTotalServers(response.total);
    }

    isRequestLoading.current = false;
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
    onClose();
  };

  React.useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return (
    <Selector
      items={servers}
      emptyScreenImage=""
      emptyScreenHeader=""
      emptyScreenDescription=""
      searchEmptyScreenImage=""
      searchEmptyScreenHeader=""
      searchEmptyScreenDescription=""
      submitButtonLabel={t("Common:AddButton")}
      disableSubmitButton={false}
      onSubmit={onSubmitAction}
      rowLoader={<RowLoader />}
      hasNextPage={servers.length < totalServers}
      isNextPageLoading={false}
      totalItems={totalServers}
      loadNextPage={fetchMoreServer}
      isLoading={servers.length === 0}
      isMultiSelect
      useAside
      onClose={onClose}
      onSelect={onSelect}
      withHeader
      headerProps={{
        headerLabel: t("Common:ListMCPServers"),
        withoutBackButton: false,
        onBackClick: onClose,
        onCloseClick: onClose,
        withoutBorder: false,
      }}
      withCancelButton
      cancelButtonLabel={t("Common:CancelButton")}
      onCancel={onClose}
    />
  );
};

export default MCPServersSelector;
