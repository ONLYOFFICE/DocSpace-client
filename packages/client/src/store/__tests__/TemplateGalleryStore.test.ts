import { describe, it, expect, vi, beforeEach } from "vitest";

const api = vi.hoisted(() => ({
  getGalleryTemplates: vi.fn(),
  getGalleryPurposes: vi.fn(),
  getGalleryLocales: vi.fn(),
  submitToGallery: vi.fn(),
}));

// Partial: the module also exports `TemplateGalleryContractError`, which the
// store checks with `instanceof` - a full replacement would make it
// `undefined`.
vi.mock("@docspace/shared/api/template-gallery", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  ...api,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), warning: vi.fn() },
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type {
  TGalleryTemplate,
  TGalleryPurpose,
  TGalleryTemplatesList,
} from "@docspace/shared/api/template-gallery/types";

import { TemplateGalleryContractError } from "@docspace/shared/api/template-gallery";

import TemplateGalleryStore from "../TemplateGalleryStore";

const settingsStore = {
  culture: "en",
  templateGallery: {
    domain: "https://cms.example",
    path: "/dashboard/api/oforms/",
    uploadDomain: "",
    uploadPath: "",
  },
} as unknown as SettingsStore;

const userStore = {
  user: { cultureName: "en" },
} as unknown as UserStore;

const template = (id: number): TGalleryTemplate => ({
  id,
  documentId: `doc-${id}`,
  title: `Form ${id}`,
  slug: `form-${id}`,
  description: "",
  updatedAt: "",
  preview: null,
  file: null,
});

const list = (ids: number[], total = ids.length): TGalleryTemplatesList => ({
  templates: ids.map(template),
  pagination: { page: 1, pageSize: 150, pageCount: 1, total },
});

const category = (id: number, templatesCount: number) => ({
  id,
  documentId: `sc-${id}`,
  name: `Category ${id}`,
  slug: `category-${id}`,
  templatesCount,
});

const purposes: TGalleryPurpose[] = [
  {
    id: 1,
    documentId: "p-1",
    key: "business",
    name: "Business",
    parentCategories: [
      {
        ...category(10, 0),
        subcategories: [category(101, 5), category(102, 0)],
      },
      {
        ...category(20, 0),
        subcategories: [category(201, 0)],
      },
    ],
  },
  {
    id: 2,
    documentId: "p-2",
    key: "personal",
    name: "Personal",
    parentCategories: [
      {
        ...category(30, 0),
        subcategories: [category(301, 2)],
      },
    ],
  },
];

const createStore = () => {
  const store = new TemplateGalleryStore(settingsStore, userStore, {
    isFormRoomRoot: false,
  });
  store.setGalleryLocales(["en", "de", "fr"]);
  return store;
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

beforeEach(() => {
  api.getGalleryTemplates.mockResolvedValue(list([]));
  api.getGalleryPurposes.mockResolvedValue(purposes);
  api.getGalleryLocales.mockResolvedValue(["en", "de", "fr"]);
});

describe("TemplateGalleryStore.galleryApiRoot", () => {
  it("drops the collection segment of the templates path", () => {
    const store = createStore();

    expect(store.galleryApiUrl).toBe(
      "https://cms.example/dashboard/api/oforms/",
    );
    expect(store.galleryApiRoot).toBe("https://cms.example/dashboard/api");
  });
});

describe("TemplateGalleryStore.parentCategories", () => {
  it("lists the groups of both purposes when none is selected", () => {
    const store = createStore();
    store.setPurposes(purposes);

    expect(store.parentCategories.map(({ id }) => id)).toEqual([10, 30]);
  });

  it("narrows the groups to the selected purpose", () => {
    const store = createStore();
    store.setPurposes(purposes);
    store.galleryFilter.purpose = "personal";

    expect(store.parentCategories.map(({ id }) => id)).toEqual([30]);
  });

  it("lists the groups in alphabetical order across purposes", () => {
    const store = createStore();
    store.setPurposes([
      {
        ...purposes[0],
        parentCategories: [
          { ...category(11, 0), name: "Sales", subcategories: [category(111, 1)] },
          { ...category(12, 0), name: "Finance", subcategories: [category(121, 1)] },
        ],
      },
      {
        ...purposes[1],
        parentCategories: [
          { ...category(31, 0), name: "Leisure", subcategories: [category(311, 1)] },
        ],
      },
    ]);

    expect(store.parentCategories.map(({ name }) => name)).toEqual([
      "Finance",
      "Leisure",
      "Sales",
    ]);
  });

  it("hides categories without templates of the current type", () => {
    const store = createStore();
    store.setPurposes(purposes);

    const [integrations] = store.parentCategories;
    expect(integrations.subcategories.map(({ id }) => id)).toEqual([101]);
  });
});

describe("TemplateGalleryStore filter conditions", () => {
  it("adds and removes categories one by one", async () => {
    const store = createStore();
    store.setPurposes(purposes);

    store.toggleGalleryCategory("sc-10");
    store.toggleGalleryCategory("sc-30");
    expect(store.galleryFilter.categoryIds).toEqual(["sc-10", "sc-30"]);
    expect(store.selectedCategories.map(({ id }) => id)).toEqual([10, 30]);

    store.toggleGalleryCategory("sc-10");
    expect(store.galleryFilter.categoryIds).toEqual(["sc-30"]);
  });

  it("removes a category only once when its chip reports the removal twice", () => {
    const store = createStore();
    store.setPurposes(purposes);
    store.galleryFilter.categoryIds = ["sc-10", "sc-30"];

    store.removeGalleryCategory("sc-10");
    store.removeGalleryCategory("sc-10");

    expect(store.galleryFilter.categoryIds).toEqual(["sc-30"]);
  });

  it("drops the categories of the other purpose on a purpose switch", () => {
    const store = createStore();
    store.setPurposes(purposes);
    store.galleryFilter.categoryIds = ["sc-10", "sc-30"];

    store.filterGalleryByPurpose("personal");

    expect(store.galleryFilter.purpose).toBe("personal");
    expect(store.galleryFilter.categoryIds).toEqual(["sc-30"]);
  });

  it("counts only a non-default language, a purpose or a category as a change", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    expect(store.isGalleryFilterChanged).toBe(false);

    store.galleryFilter.search = "invoice";
    expect(store.isGalleryFilterChanged).toBe(false);

    store.galleryFilter.purpose = "business";
    expect(store.isGalleryFilterChanged).toBe(true);
  });

  it("loads the list and the taxonomy together when no category is selected", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    const purposesRequest = deferred<TGalleryPurpose[]>();
    api.getGalleryPurposes.mockReturnValueOnce(purposesRequest.promise);
    api.getGalleryTemplates.mockClear();

    const switching = store.filterGalleryByLocale("de");
    await Promise.resolve();

    expect(api.getGalleryTemplates).toHaveBeenCalledTimes(1);

    purposesRequest.resolve(purposes);
    await switching;
  });

  it("ignores Clear all while a language switch is loading", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    store.galleryFilter.purpose = "business";
    store.setFilterGalleryByLocaleIsLoading(true);
    api.getGalleryTemplates.mockClear();

    await store.clearGalleryFilter();

    expect(store.galleryFilter.purpose).toBe("business");
    expect(api.getGalleryTemplates).not.toHaveBeenCalled();
  });

  it("closes the filter panel on a tab switch", async () => {
    const store = createStore();
    store.setFilterPanelVisible(true);

    await store.resetFilters(".xlsx");

    expect(store.filterPanelVisible).toBe(false);
  });

  it("closes the filter panel together with the gallery", () => {
    const store = createStore();
    store.setTemplateGalleryVisible(true);
    store.setFilterPanelVisible(true);

    store.setTemplateGalleryVisible(false);

    expect(store.filterPanelVisible).toBe(false);
  });

  it("clears every condition but the search", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    store.galleryFilter.search = "invoice";
    store.galleryFilter.purpose = "business";
    store.galleryFilter.categoryIds = ["sc-10"];
    await store.filterGalleryByLocale("de");
    api.getGalleryPurposes.mockClear();

    await store.clearGalleryFilter();

    expect(store.galleryFilter.locale).toBe("en");
    expect(store.galleryFilter.purpose).toBe("");
    expect(store.galleryFilter.categoryIds).toEqual([]);
    expect(store.galleryFilter.search).toBe("invoice");
    expect(api.getGalleryPurposes).toHaveBeenCalledWith(
      expect.any(String),
      "en",
      "docx",
    );
    expect(store.isGalleryFilterChanged).toBe(false);
  });
});

describe("TemplateGalleryStore taxonomy loading", () => {
  it("loads the taxonomy together with the first page", async () => {
    const store = createStore();

    await store.initTemplateGallery();

    expect(api.getGalleryPurposes).toHaveBeenCalledWith(
      "https://cms.example/dashboard/api/purposes",
      "en",
      "docx",
    );
    expect(store.purposes).toEqual(purposes);
    expect(store.categoryFilterLoaded).toBe(true);
  });

  it("reloads the taxonomy for the new file type on reset", async () => {
    const store = createStore();

    await store.resetFilters(".xlsx");

    expect(api.getGalleryPurposes).toHaveBeenCalledWith(
      expect.any(String),
      "en",
      "xlsx",
    );
  });

  it("follows the gallery language, not the language of the user", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    api.getGalleryPurposes.mockClear();

    await store.filterGalleryByLocale("de");

    expect(api.getGalleryPurposes).toHaveBeenCalledTimes(1);
    expect(api.getGalleryPurposes).toHaveBeenCalledWith(
      expect.any(String),
      "de",
      "docx",
    );
    expect(store.filterGalleryByLocaleIsLoading).toBe(false);
  });

  it("keeps the selected categories the new language still has", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    store.galleryFilter.categoryIds = ["sc-10", "sc-20", "sc-gone"];
    api.getGalleryTemplates.mockClear();

    await store.filterGalleryByLocale("de");

    expect(store.galleryFilter.categoryIds).toEqual(["sc-10"]);
    const [, requested] = api.getGalleryTemplates.mock.calls[0];
    expect(requested.categoryIds).toEqual(["sc-10"]);
  });

  it("marks the filter as loaded even when the taxonomy request fails", async () => {
    const store = createStore();
    api.getGalleryPurposes.mockRejectedValueOnce(new Error("Network Error"));

    await store.fetchPurposes("en", "pdf");

    expect(store.purposes).toEqual([]);
    expect(store.categoryFilterLoaded).toBe(true);
  });

  it("keeps the taxonomy of the latest tab when an earlier one answers later", async () => {
    const store = createStore();
    const stale = deferred<TGalleryPurpose[]>();
    const latest = [purposes[1]];
    api.getGalleryPurposes
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(latest);

    const spreadsheets = store.resetFilters(".xlsx");
    await store.resetFilters(".docx");

    stale.resolve(purposes);
    await spreadsheets;

    expect(store.purposes).toEqual(latest);
  });
});

describe("TemplateGalleryStore list loading", () => {
  it("dims the list only while a filter change is pending", async () => {
    const store = createStore();
    const pending = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates.mockReturnValueOnce(pending.promise);

    const refetch = store.refetchGalleryTemplates(store.galleryFilter.clone());

    expect(store.galleryIsLoading).toBe(true);
    expect(store.galleryIsRefetching).toBe(true);

    pending.resolve(list([1, 2]));
    await refetch;

    expect(store.galleryIsLoading).toBe(false);
    expect(store.galleryIsRefetching).toBe(false);
    expect(store.galleryTemplates?.map(({ id }) => id)).toEqual([1, 2]);
  });

  it("does not dim the list while the next page loads", async () => {
    const store = createStore();
    await store.fetchGalleryTemplates(store.galleryFilter.clone());
    store.galleryFilter.total = 4;
    store.setGalleryTemplates([template(1), template(2)]);

    const pending = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates.mockReturnValueOnce(pending.promise);

    const more = store.fetchMoreGalleryTemplates();

    expect(store.galleryIsLoading).toBe(true);
    expect(store.galleryIsRefetching).toBe(false);

    pending.resolve(list([3, 4], 4));
    await more;

    expect(store.galleryIsLoading).toBe(false);
    expect(store.galleryTemplates?.map(({ id }) => id)).toEqual([1, 2, 3, 4]);
  });

  it("does not paginate while a filter change is in flight", async () => {
    const store = createStore();
    store.galleryFilter.total = 10;
    store.setGalleryTemplates([template(1)]);

    const pending = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates.mockReturnValueOnce(pending.promise);
    const refetch = store.refetchGalleryTemplates(store.galleryFilter.clone());

    await store.fetchMoreGalleryTemplates();

    expect(api.getGalleryTemplates).toHaveBeenCalledTimes(1);

    pending.resolve(list([2]));
    await refetch;
  });

  it("drops the answer of a filter change that was superseded", async () => {
    const store = createStore();
    const slow = deferred<TGalleryTemplatesList>();
    const fast = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates
      .mockReturnValueOnce(slow.promise)
      .mockReturnValueOnce(fast.promise);

    const slowFilter = store.galleryFilter.clone();
    slowFilter.search = "slow";
    const fastFilter = store.galleryFilter.clone();
    fastFilter.search = "fast";

    const first = store.refetchGalleryTemplates(slowFilter);
    const second = store.refetchGalleryTemplates(fastFilter);

    fast.resolve(list([2]));
    await second;
    slow.resolve(list([1]));
    await first;

    expect(store.galleryTemplates?.map(({ id }) => id)).toEqual([2]);
    expect(store.galleryFilter.search).toBe("fast");
    expect(store.galleryIsRefetching).toBe(false);
  });

  it("drops a page that belongs to a list already replaced", async () => {
    const store = createStore();
    store.galleryFilter.total = 10;
    store.setGalleryTemplates([template(1)]);

    const page = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates.mockReturnValueOnce(page.promise);
    const more = store.fetchMoreGalleryTemplates();

    api.getGalleryTemplates.mockResolvedValueOnce(list([5]));
    await store.fetchGalleryTemplates(store.galleryFilter.clone());

    page.resolve(list([2], 10));
    await more;

    expect(store.galleryTemplates?.map(({ id }) => id)).toEqual([5]);
    expect(store.galleryIsLoading).toBe(false);
  });

  it("leaves the loading flag to the refetch that dropped a page", async () => {
    const store = createStore();
    store.galleryFilter.total = 10;
    store.setGalleryTemplates([template(1)]);

    const page = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates.mockReturnValueOnce(page.promise);
    const more = store.fetchMoreGalleryTemplates();

    const replacement = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates.mockReturnValueOnce(replacement.promise);
    const refetch = store.refetchGalleryTemplates(store.galleryFilter.clone());

    page.resolve(list([2], 10));
    await more;

    expect(store.galleryIsLoading).toBe(true);
    expect(store.galleryTemplates?.map(({ id }) => id)).toEqual([1]);

    replacement.resolve(list([5]));
    await refetch;

    expect(store.galleryIsLoading).toBe(false);
  });

  it("dims the list while a tab switch reloads it", async () => {
    const store = createStore();
    const pending = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates.mockReturnValueOnce(pending.promise);

    const reset = store.resetFilters(".xlsx");

    expect(store.galleryIsLoading).toBe(true);
    expect(store.galleryIsRefetching).toBe(true);

    pending.resolve(list([3]));
    await reset;

    expect(store.galleryIsLoading).toBe(false);
    expect(store.galleryIsRefetching).toBe(false);
    expect(store.galleryTemplates?.map(({ id }) => id)).toEqual([3]);
  });

  it("undims the list when a tab switch outruns a filter change", async () => {
    const store = createStore();
    const slow = deferred<TGalleryTemplatesList>();
    api.getGalleryTemplates.mockReturnValueOnce(slow.promise);

    const searchFilter = store.galleryFilter.clone();
    searchFilter.search = "slow";
    const refetch = store.refetchGalleryTemplates(searchFilter);

    api.getGalleryTemplates.mockResolvedValueOnce(list([7]));
    await store.resetFilters(".xlsx");

    slow.resolve(list([1]));
    await refetch;

    expect(store.galleryTemplates?.map(({ id }) => id)).toEqual([7]);
    expect(store.galleryIsLoading).toBe(false);
    expect(store.galleryIsRefetching).toBe(false);
  });

  it("stops paginating when the list request fails", async () => {
    const store = createStore();
    store.galleryFilter.total = 10;
    store.setGalleryTemplates([template(1)]);

    api.getGalleryTemplates.mockRejectedValueOnce({
      response: { status: 500 },
    });
    await store.fetchGalleryTemplates(store.galleryFilter.clone());

    expect(store.galleryFilter.total).toBe(0);
    expect(store.hasMoreForms).toBe(false);
  });

  it("raises the error screen for a status the CMS was not expected to answer", async () => {
    const store = createStore();

    api.getGalleryTemplates.mockRejectedValueOnce({
      response: { status: 403 },
    });
    await store.fetchGalleryTemplates(store.galleryFilter.clone());

    expect(store.galleryLoadError).toBe(true);
    expect(store.galleryNetworkError).toBe(false);
  });

  it("tells a dead network apart from a refusing CMS", async () => {
    const store = createStore();

    api.getGalleryTemplates.mockRejectedValueOnce({ code: "ERR_NETWORK" });
    await store.fetchGalleryTemplates(store.galleryFilter.clone());

    expect(store.galleryNetworkError).toBe(true);
    expect(store.galleryLoadError).toBe(false);
  });

  it("answers the locales request with an empty list when it fails", async () => {
    const store = createStore();
    store.setGalleryLocales(null);

    api.getGalleryLocales.mockRejectedValueOnce({ response: { status: 403 } });
    await store.fetchGalleryLocales();

    expect(store.galleryLocales).toEqual([]);
  });

  it("raises the error screen when the CMS answers with the previous contract", async () => {
    const store = createStore();

    api.getGalleryTemplates.mockRejectedValueOnce(
      new TemplateGalleryContractError(),
    );
    await store.fetchGalleryTemplates(store.galleryFilter.clone());

    expect(store.galleryLoadError).toBe(true);
    expect(store.galleryTemplates).toEqual([]);
  });
});
