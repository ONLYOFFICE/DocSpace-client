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

import { describe, expect, it } from "vitest";

import { isAnalyzeResponsesTarget } from "../analyzeResponses";

// The predicate decides both the context-menu label and whether the chat
// attaches the form as the subject of the message, so all three inputs have
// to line up before it flips.
describe("isAnalyzeResponsesTarget", () => {
  it("accepts a form that is being filled and collects into a table", () => {
    expect(
      isAnalyzeResponsesTarget({
        isForm: true,
        startFilling: true,
        externalDbTableName: "form_42",
      }),
    ).toBe(true);
  });

  it("rejects a form with no results table", () => {
    expect(isAnalyzeResponsesTarget({ isForm: true, startFilling: true })).toBe(
      false,
    );
    expect(
      isAnalyzeResponsesTarget({
        isForm: true,
        startFilling: true,
        externalDbTableName: "",
      }),
    ).toBe(false);
    expect(
      isAnalyzeResponsesTarget({
        isForm: true,
        startFilling: true,
        externalDbTableName: null,
      }),
    ).toBe(false);
  });

  it("rejects a form whose filling has not started", () => {
    expect(
      isAnalyzeResponsesTarget({
        isForm: true,
        startFilling: false,
        externalDbTableName: "form_42",
      }),
    ).toBe(false);
    expect(
      isAnalyzeResponsesTarget({
        isForm: true,
        externalDbTableName: "form_42",
      }),
    ).toBe(false);
  });

  it("rejects a non-form and an absent item", () => {
    expect(
      isAnalyzeResponsesTarget({
        startFilling: true,
        externalDbTableName: "form_42",
      }),
    ).toBe(false);
    expect(isAnalyzeResponsesTarget(null)).toBe(false);
    expect(isAnalyzeResponsesTarget(undefined)).toBe(false);
  });
});
