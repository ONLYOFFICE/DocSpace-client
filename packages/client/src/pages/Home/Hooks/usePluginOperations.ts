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
