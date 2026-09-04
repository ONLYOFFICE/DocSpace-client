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

import { describe, it, expect, vi, beforeEach } from "vitest";

import { toastr } from "@docspace/ui-kit/components/toast";

import { messageActions } from "SRC_DIR/helpers/plugins/utils";
import { PluginActions, PluginToastType } from "SRC_DIR/helpers/plugins/enums";
import type { TMessageActionsParams } from "SRC_DIR/helpers/plugins/types";

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("SRC_DIR/helpers/info-panel", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  showInfoPanel: vi.fn(),
  openMembersTab: vi.fn(),
  openShareTab: vi.fn(),
  setView: vi.fn(),
  setFileView: vi.fn(),
  setRoomsView: vi.fn(),
}));

const PLUGIN_NAME = "TestPlugin";

const createParams = () => ({
  pluginName: PLUGIN_NAME,
  setElementProps: vi.fn(),
  updatePropsContext: vi.fn(),
  updateCreateDialogProps: vi.fn(),
  setSettingsPluginDialogVisible: vi.fn(),
  updatePluginStatus: vi.fn(),
  setPluginDialogVisible: vi.fn(),
  setPluginDialogProps: vi.fn(),
  setPluginSelectorVisible: vi.fn(),
  setPluginSelectorProps: vi.fn(),
  addPluginFloatingOperations: vi.fn(),
  removePluginFloatingOperations: vi.fn(),
  updatePluginFloatingOperations: vi.fn(),
  updateContextMenuItems: vi.fn(),
  updateInfoPanelItems: vi.fn(),
  updateMainButtonItems: vi.fn(),
  updateProfileMenuItems: vi.fn(),
  updateEventListenerItems: vi.fn(),
  updateFileItems: vi.fn(),
  updatePlugin: vi.fn(),
  setPluginMediaViewerVisible: vi.fn(),
  setPluginMediaViewerProps: vi.fn(),
});

type TParams = ReturnType<typeof createParams>;

const dispatch = (message: unknown, params: TParams) =>
  messageActions({ ...params, message } as TMessageActionsParams);

// Every scope is refreshed by its own action only. A plugin that returns one of
// them must not see another scope re-read as a side effect.
const REFRESH_ACTIONS: [PluginActions, keyof TParams][] = [
  [PluginActions.updateContextMenuItems, "updateContextMenuItems"],
  [PluginActions.updateInfoPanelItems, "updateInfoPanelItems"],
  [PluginActions.updateMainButtonItems, "updateMainButtonItems"],
  [PluginActions.updateProfileMenuItems, "updateProfileMenuItems"],
  [PluginActions.updateEventListenerItems, "updateEventListenerItems"],
  [PluginActions.updateFileItems, "updateFileItems"],
];

describe("messageActions", () => {
  let params: TParams;

  beforeEach(() => {
    params = createParams();
  });

  it.each(REFRESH_ACTIONS)("%s refreshes only its own scope", (action, key) => {
    dispatch({ actions: [action] }, params);

    expect(params[key]).toHaveBeenCalledTimes(1);
    expect(params[key]).toHaveBeenCalledWith(PLUGIN_NAME);

    REFRESH_ACTIONS.filter(([, other]) => other !== key).forEach(([, other]) => {
      expect(params[other]).not.toHaveBeenCalled();
    });
  });

  it("runs every action of a message, in the order they were sent", () => {
    dispatch(
      {
        actions: [
          PluginActions.updateFileItems,
          PluginActions.updateStatus,
        ],
      },
      params,
    );

    expect(params.updateFileItems).toHaveBeenCalledWith(PLUGIN_NAME);
    expect(params.updatePluginStatus).toHaveBeenCalledWith(PLUGIN_NAME);
    expect(
      params.updateFileItems.mock.invocationCallOrder[0],
    ).toBeLessThan(params.updatePluginStatus.mock.invocationCallOrder[0]);
  });

  it("ignores a message without actions", () => {
    dispatch({ actions: [] }, params);
    dispatch(undefined, params);

    expect(params.updateFileItems).not.toHaveBeenCalled();
    expect(params.updatePluginStatus).not.toHaveBeenCalled();
  });

  it("keeps the element props when updateProps carries no payload", () => {
    dispatch({ actions: [PluginActions.updateProps] }, params);

    expect(params.setElementProps).not.toHaveBeenCalled();

    dispatch(
      { actions: [PluginActions.updateProps], newProps: { label: "next" } },
      params,
    );

    expect(params.setElementProps).toHaveBeenCalledWith({ label: "next" });
  });

  it("opens a modal with the plugin name attached, and closes it without props", () => {
    dispatch(
      {
        actions: [PluginActions.showModal],
        modalDialogProps: { dialogHeader: "Title" },
      },
      params,
    );

    expect(params.setPluginDialogVisible).toHaveBeenCalledWith(true);
    expect(params.setPluginDialogProps).toHaveBeenCalledWith({
      dialogHeader: "Title",
      pluginName: PLUGIN_NAME,
    });

    dispatch({ actions: [PluginActions.closeModal] }, params);

    expect(params.setPluginDialogVisible).toHaveBeenLastCalledWith(false);
    expect(params.setPluginDialogProps).toHaveBeenLastCalledWith(null);
  });

  it("shows a toast per type", () => {
    dispatch(
      {
        actions: [PluginActions.showToast],
        toastProps: [
          { type: PluginToastType.success, title: "done" },
          { type: PluginToastType.error, title: "failed" },
        ],
      },
      params,
    );

    expect(toastr.success).toHaveBeenCalledWith("done");
    expect(toastr.error).toHaveBeenCalledWith("failed");
    expect(toastr.info).not.toHaveBeenCalled();
  });

  it("keeps running the later actions when an earlier one has no payload", () => {
    dispatch(
      {
        actions: [PluginActions.showSelector, PluginActions.showToast],
        toastProps: [{ type: PluginToastType.info, title: "still shown" }],
      },
      params,
    );

    expect(params.setPluginSelectorVisible).not.toHaveBeenCalled();
    expect(toastr.info).toHaveBeenCalledWith("still shown");

    dispatch(
      {
        actions: [PluginActions.navigate, PluginActions.updateStatus],
      },
      params,
    );

    expect(params.updatePluginStatus).toHaveBeenCalledWith(PLUGIN_NAME);
  });

  it("saves settings only when the message carries them", () => {
    dispatch({ actions: [PluginActions.saveSettings] }, params);

    expect(params.updatePlugin).not.toHaveBeenCalled();

    dispatch(
      { actions: [PluginActions.saveSettings], settings: "value" },
      params,
    );

    expect(params.updatePlugin).toHaveBeenCalledWith(PLUGIN_NAME, null, "value");
  });
});
