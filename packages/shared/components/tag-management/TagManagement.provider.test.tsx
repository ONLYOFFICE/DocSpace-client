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

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { TagType } from "@docspace/ui-kit/components/tag";
import {
  TagManagementProvider,
  useTagManagement,
} from "./TagManagement.provider";

const TestComponent = () => {
  const {
    tags,
    searchValue,
    deferredSearchValue,
    filteredTags,
    showCreateTag,
    setSearchValue,
    clearSearch,
  } = useTagManagement();

  return (
    <div>
      <div data-testid="tags-count">{tags.length}</div>
      <div data-testid="filtered-count">{filteredTags.length}</div>
      <div data-testid="search-value">{searchValue}</div>
      <div data-testid="deferred-search">{deferredSearchValue}</div>
      <div data-testid="show-create">{showCreateTag.toString()}</div>
      <input
        data-testid="search-input"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <button data-testid="clear-button" onClick={clearSearch}>
        Clear
      </button>
      <ul data-testid="filtered-list">
        {filteredTags.map((tag) => (
          <li key={tag.label}>{tag.label}</li>
        ))}
      </ul>
    </div>
  );
};

describe("TagManagementProvider", () => {
  it("throws error when useTagManagement is used outside provider", () => {
    expect(() => render(<TestComponent />)).toThrow(
      "useTagManagement must be used within TagManagementProvider",
    );
  });

  it("initializes with room tags and fetched tags", () => {
    const roomTags = ["tag1", "tag2"];
    const fetchedTags = ["tag3", "tag4"];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    expect(screen.getByTestId("tags-count")).toHaveTextContent("4");
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("4");
  });

  it("filters out default tags from room tags", () => {
    const roomTags: TagType[] = [
      { label: "normalTag", isDefault: false, isThirdParty: false },
      { label: "defaultTag", isDefault: true, isThirdParty: false },
    ];
    const fetchedTags = ["tag3"];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    expect(screen.getByTestId("tags-count")).toHaveTextContent("2");
    const list = screen.getByTestId("filtered-list");
    expect(list).not.toHaveTextContent("defaultTag");
  });

  it("updates search value correctly", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "testing"];
    const fetchedTags: string[] = [];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");

    expect(screen.getByTestId("search-value")).toHaveTextContent("test");
  });

  it("filters tags based on search value", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "testing", "production"];
    const fetchedTags: string[] = [];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");

    await waitFor(() => {
      expect(screen.getByTestId("deferred-search")).toHaveTextContent("test");
    });

    await waitFor(() => {
      const filteredCount = screen.getByTestId("filtered-count");
      expect(parseInt(filteredCount.textContent || "0")).toBeLessThan(3);
    });
  });

  it("clears search value when clearSearch is called", async () => {
    const user = userEvent.setup();
    const roomTags = ["test"];
    const fetchedTags: string[] = [];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");
    expect(screen.getByTestId("search-value")).toHaveTextContent("test");

    const clearButton = screen.getByTestId("clear-button");
    await user.click(clearButton);

    expect(screen.getByTestId("search-value")).toHaveTextContent("");
  });

  it("shows create tag option when no exact match exists", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "testing"];
    const fetchedTags: string[] = [];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{ canCreate: true }}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    const input = screen.getByTestId("search-input");
    await user.type(input, "newTag");

    await waitFor(() => {
      expect(screen.getByTestId("show-create")).toHaveTextContent("true");
    });
  });

  it("does not show create tag option when exact match exists", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "testing"];
    const fetchedTags: string[] = [];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{ canCreate: true }}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");

    await waitFor(() => {
      expect(screen.getByTestId("show-create")).toHaveTextContent("false");
    });
  });

  it("returns all tags when search is empty", () => {
    const roomTags = ["tag1", "tag2", "tag3"];
    const fetchedTags: string[] = [];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    expect(screen.getByTestId("filtered-count")).toHaveTextContent("3");
    expect(screen.getByTestId("show-create")).toHaveTextContent("false");
  });

  it("handles empty room tags and fetched tags", () => {
    render(
      <TagManagementProvider roomTags={[]} fetchedTags={[]} access={{}}>
        <TestComponent />
      </TagManagementProvider>,
    );

    expect(screen.getByTestId("tags-count")).toHaveTextContent("0");
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("0");
  });

  it("prioritizes exact matches in search results", async () => {
    const user = userEvent.setup();
    const roomTags = ["test", "test 2", "testing"];
    const fetchedTags: string[] = [];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    const input = screen.getByTestId("search-input");
    await user.type(input, "test");

    await waitFor(() => {
      const list = screen.getByTestId("filtered-list");
      const items = list.querySelectorAll("li");
      expect(items[0]).toHaveTextContent("test");
    });
  });

  it("uses deferred value for search", async () => {
    const user = userEvent.setup();
    const roomTags = ["test"];
    const fetchedTags: string[] = [];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    const input = screen.getByTestId("search-input");
    await user.type(input, "t");

    expect(screen.getByTestId("search-value")).toHaveTextContent("t");

    await waitFor(() => {
      expect(screen.getByTestId("deferred-search")).toHaveTextContent("t");
    });
  });

  it("merges room tags and fetched tags without duplicates", () => {
    const roomTags = ["tag1", "tag2"];
    const fetchedTags = ["tag2", "tag3"];

    render(
      <TagManagementProvider
        roomTags={roomTags}
        fetchedTags={fetchedTags}
        access={{}}
      >
        <TestComponent />
      </TagManagementProvider>,
    );

    expect(screen.getByTestId("tags-count")).toHaveTextContent("3");
    const list = screen.getByTestId("filtered-list");
    expect(list.textContent).toContain("tag1");
    expect(list.textContent).toContain("tag2");
    expect(list.textContent).toContain("tag3");
  });
});
