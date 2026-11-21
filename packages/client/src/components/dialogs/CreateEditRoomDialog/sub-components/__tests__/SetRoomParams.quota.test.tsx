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

import { render, screen, within } from "@testing-library/react";
import { Provider } from "mobx-react";
import type { ComponentType } from "react";
import { describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import SetRoomParamsComponent from "../SetRoomParams";

vi.mock("SRC_DIR/HOCs/withLoader", () => ({
  default: (Component: ComponentType) => () => Component,
}));
vi.mock("SRC_DIR/i18n", () => ({ default: { t: (key: string) => key } }));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  withTranslation: () => (Component: ComponentType) => Component,
}));
vi.mock("SRC_DIR/components/TagInput", () => ({ default: () => null }));
vi.mock("SRC_DIR/components/ItemIcon", () => ({ default: () => null }));
vi.mock("../TemplateAccess/TemplateAccess", () => ({ default: () => null }));
vi.mock("../FormRoomBlock", () => ({
  default: () => <div data-testid="form-room-database-settings" />,
}));

const SetRoomParams = SetRoomParamsComponent as unknown as ComponentType<
  Record<string, unknown>
>;

function renderTemplateSettings(type: RoomsType) {
  render(
    <Provider
      settingsStore={{ externalDbEnabled: true }}
      dialogsStore={{
        getLogoCoverModel: () => [],
        setCoverSelection: vi.fn(),
        setRoomCoverDialogProps: vi.fn(),
      }}
      currentQuotaStore={{
        isDefaultRoomsQuotaSet: true,
        defaultRoomsQuota: 1048576,
      }}
      filesStore={{}}
      infoPanelStore={{ infoPanelSelection: {}, getInfoPanelItemIcon: vi.fn() }}
      avatarEditorDialogStore={{}}
      filesSettingsStore={{}}
      authStore={{ isRoomAdmin: true }}
    >
      <SetRoomParams
        t={(key: string) => key}
        isTemplate
        roomParams={{
          type,
          title: "Template",
          icon: {},
          storageLocation: {},
          quota: 1048576,
        }}
        setRoomParams={vi.fn()}
      />
    </Provider>,
  );
  return within(screen.getByTestId("quota-form"));
}

describe("Save as template quota (bug 84269)", () => {
  it("uses Form space quota copy and hides database settings", () => {
    const quota = renderTemplateSettings(RoomsType.FormRoom);

    expect(
      quota.getByRole("checkbox", { name: "DisableRoomQuotaFormSpace" }),
    ).toBeInTheDocument();
    expect(quota.getByText("StorageDescriptionFormSpace")).toBeInTheDocument();
    expect(
      screen.queryByTestId("form-room-database-settings"),
    ).not.toBeInTheDocument();
  });

  it("uses room quota copy for a regular room", () => {
    const quota = renderTemplateSettings(RoomsType.CustomRoom);

    expect(
      quota.getByRole("checkbox", { name: "DisableRoomQuota" }),
    ).toBeInTheDocument();
    expect(quota.getByText("StorageDescription")).toBeInTheDocument();
  });
});
