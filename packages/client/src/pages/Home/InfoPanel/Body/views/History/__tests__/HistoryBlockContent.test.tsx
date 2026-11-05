/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it } from "vitest";

import { FeedActionKeys } from "@docspace/shared/api/rooms/types";

import { getFeedInfo } from "../FeedInfo";
import HistoryBlockContent from "../HistoryBlockContent";

const keysIssuedFeed = {
  id: 7,
  action: { id: 5164, key: FeedActionKeys.FileKeysSet },
  date: "2026-11-05T10:00:00",
  initiator: { id: "user-1" },
  data: { id: 701, title: "a1b2c3.docx", parentId: 10 },
  related: [],
} as never;

// Spec: private-rooms/file-operations, "Key writes are left out of the History tab"
describe("History — key writes", () => {
  it("Key write listed: no feed info", () => {
    expect(getFeedInfo(keysIssuedFeed)).toBeUndefined();
  });

  it("Key write listed: nothing rendered", () => {
    const { container } = render(
      <Provider infoPanelStore={{ historyWithFileList: true }}>
        <HistoryBlockContent feed={keysIssuedFeed} />
      </Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
