// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";

const get = vi.fn(async (_url: string) => ({ data: {} }));

vi.mock("axios", () => ({
  default: { get: (url: string) => get(url), post: vi.fn() },
}));

// eslint-disable-next-line import/first
import { getOforms, getOformPurposes, getOformLocales } from ".";
// eslint-disable-next-line import/first
import OformsFilter from "./filter";

const CMS = "https://cms.example/dashboard/api";

const rawTemplate = {
  id: 3,
  documentId: "doc-3",
  name_form: "Lease agreement",
  url: "lease-agreement",
  description_card: "Short",
  template_desc: "Long",
  updatedAt: "2026-01-02T00:00:00.000Z",
  card_prewiew: {
    id: 10,
    documentId: "img-10",
    url: "https://static.example/card.png",
    width: 916,
    height: 648,
  },
  file_oform: [
    {
      id: 20,
      documentId: "file-20",
      url: "/uploads/lease.pdf",
      name: "lease.pdf",
      ext: ".pdf",
      size: 766.5,
    },
  ],
};

describe("getOforms", () => {
  beforeEach(() => get.mockClear());

  it("requests the card fields and appends the filter params", async () => {
    get.mockResolvedValueOnce({ data: { data: [], meta: null } });

    const filter = OformsFilter.getDefaultDocx();
    filter.locale = "de";
    filter.purpose = "business";
    filter.categoryId = "cat-1";
    filter.search = "invoice";
    filter.sortBy = "name_form";
    filter.sortOrder = "asc";

    await getOforms(`${CMS}/oforms`, filter);

    const [url] = get.mock.calls[0];
    expect(url.startsWith(`${CMS}/oforms?fields[0]=name_form&`)).toBe(true);
    expect(url).toContain("populate[card_prewiew][fields][1]=width");
    expect(url).toContain("populate[file_oform][fields][3]=size");
    expect(url).toContain("pagination[page]=1");
    expect(url).toContain("pagination[pageSize]=150");
    expect(url).toContain("locale=de");
    expect(url).toContain("filters[name_form][$containsi]=invoice");
    expect(url).toContain("filters[form_exts][ext][$eq]=docx");
    expect(url).toContain("filters[subcategories][documentId][$eq]=cat-1");
    expect(url).toContain(
      "filters[subcategories][parent_categories][purpose][key][$eq]=business",
    );
    expect(url).toContain("sort[0]=name_form%3Aasc");
  });

  it("leaves empty filters out and falls back to sorting by name", async () => {
    get.mockResolvedValueOnce({ data: { data: [] } });

    await getOforms(`${CMS}/oforms`, OformsFilter.getDefault());

    const [url] = get.mock.calls[0];
    expect(url).not.toContain("filters[subcategories]");
    expect(url).not.toContain("$containsi");
    expect(url).not.toContain("locale=");
    expect(url).toContain("sort[0]=name_form%3Aasc");
  });

  it("maps a template to the gallery model", async () => {
    get.mockResolvedValueOnce({
      data: {
        data: [rawTemplate],
        meta: { pagination: { page: 2, pageSize: 1, pageCount: 5, total: 5 } },
      },
    });

    const { templates, pagination } = await getOforms(
      `${CMS}/oforms`,
      OformsFilter.getDefault(),
    );

    expect(pagination).toEqual({ page: 2, pageSize: 1, pageCount: 5, total: 5 });
    expect(templates).toEqual([
      {
        id: 3,
        documentId: "doc-3",
        title: "Lease agreement",
        slug: "lease-agreement",
        description: "Long",
        updatedAt: "2026-01-02T00:00:00.000Z",
        preview: { url: "https://static.example/card.png", width: 916, height: 648 },
        file: {
          url: "https://cms.example/uploads/lease.pdf",
          name: "lease.pdf",
          ext: ".pdf",
          size: 766.5,
        },
      },
    ]);
  });

  it("falls back to the card description and tolerates missing media", async () => {
    get.mockResolvedValueOnce({
      data: {
        data: [
          {
            ...rawTemplate,
            template_desc: null,
            card_prewiew: null,
            file_oform: [],
          },
        ],
      },
    });

    const { templates, pagination } = await getOforms(
      `${CMS}/oforms`,
      OformsFilter.getDefault(),
    );

    expect(templates[0].description).toBe("Short");
    expect(templates[0].preview).toBeNull();
    expect(templates[0].file).toBeNull();
    expect(pagination).toEqual({ page: 1, pageSize: 0, pageCount: 0, total: 1 });
  });
});

describe("getOformPurposes", () => {
  beforeEach(() => get.mockClear());

  it("asks for the localized tree with per-extension counts", async () => {
    get.mockResolvedValueOnce({ data: { data: [] } });

    await getOformPurposes(`${CMS}/purposes`, "fr", "pdf");

    const [url] = get.mock.calls[0];
    const sub = "populate[parent_categories][populate][subcategories]";
    expect(url).toContain(`${sub}[populate][oforms][count]=true`);
    expect(url).toContain(
      `${sub}[populate][oforms][filters][form_exts][ext][$eq]=pdf`,
    );
    expect(url.endsWith("&locale=fr")).toBe(true);
  });

  it("maps the tree and keeps the template count of every leaf", async () => {
    get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 1,
            documentId: "p-1",
            key: "business",
            name: "Business",
            parent_categories: [
              {
                id: 11,
                documentId: "pc-11",
                name: "Integrations",
                urlReq: "integrations",
                subcategories: [
                  {
                    id: 111,
                    documentId: "sc-111",
                    name: "Odoo",
                    urlReq: "odoo",
                    oforms: { count: 24 },
                  },
                  { id: 112, documentId: "sc-112", name: "Empty", urlReq: "empty" },
                ],
              },
            ],
          },
        ],
      },
    });

    const purposes = await getOformPurposes(`${CMS}/purposes`, "en", "pdf");

    expect(purposes).toEqual([
      {
        id: 1,
        documentId: "p-1",
        key: "business",
        name: "Business",
        parentCategories: [
          {
            id: 11,
            documentId: "pc-11",
            name: "Integrations",
            slug: "integrations",
            templatesCount: 0,
            subcategories: [
              {
                id: 111,
                documentId: "sc-111",
                name: "Odoo",
                slug: "odoo",
                templatesCount: 24,
              },
              {
                id: 112,
                documentId: "sc-112",
                name: "Empty",
                slug: "empty",
                templatesCount: 0,
              },
            ],
          },
        ],
      },
    ]);
  });
});

describe("getOformLocales", () => {
  it("returns the locale codes only", async () => {
    get.mockResolvedValueOnce({
      data: [{ code: "en" }, { code: "de" }, { code: "" }],
    });

    expect(await getOformLocales(`${CMS}/i18n/locales`)).toEqual(["en", "de"]);
  });
});
