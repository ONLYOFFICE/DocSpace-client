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

import React, { useEffect, useMemo, useCallback } from "react";
import type { Operation } from "@docspace/ui-kit/components/operations-progress-button/OperationsProgressButton.types";
import type { IFloatingOperationsButtonClient } from "SRC_DIR/helpers/plugins/types";
import type PluginStore from "SRC_DIR/store/PluginStore";

interface UsePluginOperationsParams {
  pluginFloatingOperationsArray: IFloatingOperationsButtonClient[];
  removePluginFloatingOperations: PluginStore["removePluginFloatingOperations"];
  dispatchMessage: PluginStore["dispatchMessage"];
  getPluginIconUrl: PluginStore["getPluginIconUrl"];
}
interface UsePluginOperationsReturn {
  pluginOperations: Operation[];
  pluginOperationsCompleted?: boolean;
  pluginOperationsAlert?: boolean;
  pluginShowCancelButton?: boolean;
  handlePluginCancelOperation: () => void;
  handlePluginClearOperation: (operationId: string) => void;
}

export const usePluginOperations = ({
  pluginFloatingOperationsArray,
  dispatchMessage,
  getPluginIconUrl,
  removePluginFloatingOperations,
}: UsePluginOperationsParams): UsePluginOperationsReturn => {
  const loadedPluginsRef = React.useRef<Set<string>>(new Set());

  const prefix = (pluginName: string) => `${pluginName}-`;

  const pluginOperations = useMemo(() => {
    if (pluginFloatingOperationsArray.length === 0) {
      return [];
    }

    const allOperations: Operation[] = [];

    pluginFloatingOperationsArray.forEach((pluginProps) => {
      const { pluginName, operations } = pluginProps;

      if (!operations) return;

      const mappedOperations = operations.map(({ icon, id, ...rest }) => ({
        ...rest,
        id: `${prefix(pluginName)}${id}`,
        iconUrl: icon ? getPluginIconUrl(pluginName, icon) : undefined,
      }));

      allOperations.push(...mappedOperations);
    });

    return allOperations;
  }, [pluginFloatingOperationsArray, getPluginIconUrl]);

  const handlePluginCancelOperation = useCallback(async () => {
    await Promise.all(
      pluginFloatingOperationsArray.map(async (pluginProps) => {
        if (!pluginProps.cancelOperation) return;

        const message = await pluginProps.cancelOperation();
        dispatchMessage({
          message,
          pluginName: pluginProps.pluginName,
        });
      }),
    );
  }, [pluginFloatingOperationsArray, dispatchMessage]);

  const handlePluginClearOperation = useCallback(
    async (operationId?: string) => {
      if (!operationId) {
        // operations button is hidden, remove all plugin operations
        pluginFloatingOperationsArray.forEach((pluginProps) => {
          removePluginFloatingOperations(pluginProps.id);
        });
        loadedPluginsRef.current = new Set();
        return;
      }

      const floatingOperationsProps = pluginFloatingOperationsArray.find(
        (pluginProps) => operationId.startsWith(pluginProps.pluginName),
      );

      if (!floatingOperationsProps) return;

      const { pluginName, onCancelOperationFromList } = floatingOperationsProps;

      if (!onCancelOperationFromList) return;

      const pureOperationId = operationId.replace(`${prefix(pluginName)}`, "");

      const message = await onCancelOperationFromList(pureOperationId);
      dispatchMessage({
        message,
        pluginName,
      });
    },
    [pluginFloatingOperationsArray, dispatchMessage],
  );

  // Track plugin keys to detect changes in plugin composition
  const pluginKeys = useMemo(() => {
    return pluginFloatingOperationsArray
      .map(({ pluginName, id }) => `${prefix(pluginName)}${id}`)
      .sort()
      .join(",");
  }, [pluginFloatingOperationsArray]);

  useEffect(() => {
    pluginFloatingOperationsArray.forEach((pluginProps) => {
      const { pluginName, id } = pluginProps;

      const operationsKey = `${prefix(pluginName)}${id}`;

      if (loadedPluginsRef.current.has(operationsKey)) return;
      if (!pluginProps.onLoad) return;

      const dispatchMessageAction: Parameters<typeof pluginProps.onLoad>[0] = (
        message,
      ) => {
        dispatchMessage({
          message,
          pluginName,
        });
      };

      loadedPluginsRef.current.add(operationsKey);
      pluginProps.onLoad(dispatchMessageAction);
    });

    loadedPluginsRef.current = new Set(
      pluginFloatingOperationsArray.map(
        ({ pluginName, id }) => `${prefix(pluginName)}${id}`,
      ),
    );
  }, [pluginKeys, dispatchMessage]);

  const pluginOperationsCompleted = useMemo(() => {
    if (pluginFloatingOperationsArray.length === 0) return undefined;

    return pluginFloatingOperationsArray.every(
      (p) => p.operationsCompleted === true,
    );
  }, [pluginFloatingOperationsArray]);

  const pluginOperationsAlert = useMemo(() => {
    if (pluginFloatingOperationsArray.length === 0) return undefined;

    return pluginFloatingOperationsArray.some(
      (p) => p.operationsAlert === true,
    );
  }, [pluginFloatingOperationsArray]);

  const pluginShowCancelButton = useMemo(() => {
    if (pluginFloatingOperationsArray.length === 0) return false;

    return pluginFloatingOperationsArray.some((p) => {
      const hasOperations = p.operations && p.operations.length > 0;
      return hasOperations && p.showCancelButton === true;
    });
  }, [pluginFloatingOperationsArray]);

  return {
    pluginOperations,
    pluginOperationsCompleted,
    pluginOperationsAlert,
    pluginShowCancelButton,
    handlePluginCancelOperation,
    handlePluginClearOperation,
  };
};

export default usePluginOperations;
