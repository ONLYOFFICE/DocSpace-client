import { describe, it, expect, vi, beforeEach } from "vitest";

const api = vi.hoisted(() => ({
  getOforms: vi.fn(),
  getOformPurposes: vi.fn(),
  getOformLocales: vi.fn(),
  submitToGallery: vi.fn(),
}));

// Partial: the module also exports `OformsContractError`, which the store
// checks with `instanceof` - a full replacement would make it `undefined`.
vi.mock("@docspace/shared/api/oforms", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  ...api,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), warning: vi.fn() },
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type {
  TOformFile,
  TOformPurpose,
  TOformsList,
} from "@docspace/shared/api/oforms/types";

import { OformsContractError } from "@docspace/shared/api/oforms";

import OformsStore from "../OformsStore";

const settingsStore = {
  culture: "en",
  formGallery: {
    domain: "https://cms.example",
    path: "/dashboard/api/oforms/",
    uploadDomain: "",
    uploadPath: "",
  },
} as unknown as SettingsStore;

const userStore = {
  user: { cultureName: "en" },
} as unknown as UserStore;

const template = (id: number): TOformFile => ({
  id,
  documentId: `doc-${id}`,
  title: `Form ${id}`,
  slug: `form-${id}`,
  description: "",
  updatedAt: "",
  preview: null,
  file: null,
});

const list = (ids: number[], total = ids.length): TOformsList => ({
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

const purposes: TOformPurpose[] = [
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
  const store = new OformsStore(settingsStore, userStore, {
    isFormRoomRoot: false,
  });
  store.setOformLocales(["en", "de", "fr"]);
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
  api.getOforms.mockResolvedValue(list([]));
  api.getOformPurposes.mockResolvedValue(purposes);
  api.getOformLocales.mockResolvedValue(["en", "de", "fr"]);
});

describe("OformsStore.oformsApiRoot", () => {
  it("drops the collection segment of the templates path", () => {
    const store = createStore();

    expect(store.oformsApiUrl).toBe("https://cms.example/dashboard/api/oforms/");
    expect(store.oformsApiRoot).toBe("https://cms.example/dashboard/api");
  });
});

describe("OformsStore.parentCategories", () => {
  it("lists the groups of both purposes when none is selected", () => {
    const store = createStore();
    store.setPurposes(purposes);

    expect(store.parentCategories.map(({ id }) => id)).toEqual([10, 30]);
  });

  it("narrows the groups to the selected purpose", () => {
    const store = createStore();
    store.setPurposes(purposes);
    store.oformsFilter.purpose = "personal";

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

describe("OformsStore filter conditions", () => {
  it("adds and removes categories one by one", async () => {
    const store = createStore();
    store.setPurposes(purposes);

    store.toggleOformsCategory("sc-10");
    store.toggleOformsCategory("sc-30");
    expect(store.oformsFilter.categoryIds).toEqual(["sc-10", "sc-30"]);
    expect(store.selectedCategories.map(({ id }) => id)).toEqual([10, 30]);

    store.toggleOformsCategory("sc-10");
    expect(store.oformsFilter.categoryIds).toEqual(["sc-30"]);
  });

  it("removes a category only once when its chip reports the removal twice", () => {
    const store = createStore();
    store.setPurposes(purposes);
    store.oformsFilter.categoryIds = ["sc-10", "sc-30"];

    store.removeOformsCategory("sc-10");
    store.removeOformsCategory("sc-10");

    expect(store.oformsFilter.categoryIds).toEqual(["sc-30"]);
  });

  it("drops the categories of the other purpose on a purpose switch", () => {
    const store = createStore();
    store.setPurposes(purposes);
    store.oformsFilter.categoryIds = ["sc-10", "sc-30"];

    store.filterOformsByPurpose("personal");

    expect(store.oformsFilter.purpose).toBe("personal");
    expect(store.oformsFilter.categoryIds).toEqual(["sc-30"]);
  });

  it("counts only a non-default language, a purpose or a category as a change", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    expect(store.isOformsFilterChanged).toBe(false);

    store.oformsFilter.search = "invoice";
    expect(store.isOformsFilterChanged).toBe(false);

    store.oformsFilter.purpose = "business";
    expect(store.isOformsFilterChanged).toBe(true);
  });

  it("loads the list and the taxonomy together when no category is selected", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    const purposesRequest = deferred<TOformPurpose[]>();
    api.getOformPurposes.mockReturnValueOnce(purposesRequest.promise);
    api.getOforms.mockClear();

    const switching = store.filterOformsByLocale("de");
    await Promise.resolve();

    expect(api.getOforms).toHaveBeenCalledTimes(1);

    purposesRequest.resolve(purposes);
    await switching;
  });

  it("ignores Clear all while a language switch is loading", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    store.oformsFilter.purpose = "business";
    store.setFilterOformsByLocaleIsLoading(true);
    api.getOforms.mockClear();

    await store.clearOformsFilter();

    expect(store.oformsFilter.purpose).toBe("business");
    expect(api.getOforms).not.toHaveBeenCalled();
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
    store.oformsFilter.search = "invoice";
    store.oformsFilter.purpose = "business";
    store.oformsFilter.categoryIds = ["sc-10"];
    await store.filterOformsByLocale("de");
    api.getOformPurposes.mockClear();

    await store.clearOformsFilter();

    expect(store.oformsFilter.locale).toBe("en");
    expect(store.oformsFilter.purpose).toBe("");
    expect(store.oformsFilter.categoryIds).toEqual([]);
    expect(store.oformsFilter.search).toBe("invoice");
    expect(api.getOformPurposes).toHaveBeenCalledWith(
      expect.any(String),
      "en",
      "docx",
    );
    expect(store.isOformsFilterChanged).toBe(false);
  });
});

describe("OformsStore taxonomy loading", () => {
  it("loads the taxonomy together with the first page", async () => {
    const store = createStore();

    await store.initTemplateGallery();

    expect(api.getOformPurposes).toHaveBeenCalledWith(
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

    expect(api.getOformPurposes).toHaveBeenCalledWith(
      expect.any(String),
      "en",
      "xlsx",
    );
  });

  it("follows the gallery language, not the language of the user", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    api.getOformPurposes.mockClear();

    await store.filterOformsByLocale("de");

    expect(api.getOformPurposes).toHaveBeenCalledTimes(1);
    expect(api.getOformPurposes).toHaveBeenCalledWith(
      expect.any(String),
      "de",
      "docx",
    );
    expect(store.filterOformsByLocaleIsLoading).toBe(false);
  });

  it("keeps the selected categories the new language still has", async () => {
    const store = createStore();
    await store.initTemplateGallery();
    store.oformsFilter.categoryIds = ["sc-10", "sc-20", "sc-gone"];
    api.getOforms.mockClear();

    await store.filterOformsByLocale("de");

    expect(store.oformsFilter.categoryIds).toEqual(["sc-10"]);
    const [, requested] = api.getOforms.mock.calls[0];
    expect(requested.categoryIds).toEqual(["sc-10"]);
  });

  it("marks the filter as loaded even when the taxonomy request fails", async () => {
    const store = createStore();
    api.getOformPurposes.mockRejectedValueOnce(new Error("Network Error"));

    await store.fetchPurposes("en", "pdf");

    expect(store.purposes).toEqual([]);
    expect(store.categoryFilterLoaded).toBe(true);
  });
});

describe("OformsStore list loading", () => {
  it("dims the list only while a filter change is pending", async () => {
    const store = createStore();
    const pending = deferred<TOformsList>();
    api.getOforms.mockReturnValueOnce(pending.promise);

    const refetch = store.refetchOforms(store.oformsFilter.clone());

    expect(store.oformsIsLoading).toBe(true);
    expect(store.oformsIsRefetching).toBe(true);

    pending.resolve(list([1, 2]));
    await refetch;

    expect(store.oformsIsLoading).toBe(false);
    expect(store.oformsIsRefetching).toBe(false);
    expect(store.oformFiles?.map(({ id }) => id)).toEqual([1, 2]);
  });

  it("does not dim the list while the next page loads", async () => {
    const store = createStore();
    await store.fetchOforms(store.oformsFilter.clone());
    store.oformsFilter.total = 4;
    store.setOformFiles([template(1), template(2)]);

    const pending = deferred<TOformsList>();
    api.getOforms.mockReturnValueOnce(pending.promise);

    const more = store.fetchMoreOforms();

    expect(store.oformsIsLoading).toBe(true);
    expect(store.oformsIsRefetching).toBe(false);

    pending.resolve(list([3, 4], 4));
    await more;

    expect(store.oformsIsLoading).toBe(false);
    expect(store.oformFiles?.map(({ id }) => id)).toEqual([1, 2, 3, 4]);
  });

  it("does not paginate while a filter change is in flight", async () => {
    const store = createStore();
    store.oformsFilter.total = 10;
    store.setOformFiles([template(1)]);

    const pending = deferred<TOformsList>();
    api.getOforms.mockReturnValueOnce(pending.promise);
    const refetch = store.refetchOforms(store.oformsFilter.clone());

    await store.fetchMoreOforms();

    expect(api.getOforms).toHaveBeenCalledTimes(1);

    pending.resolve(list([2]));
    await refetch;
  });

  it("drops the answer of a filter change that was superseded", async () => {
    const store = createStore();
    const slow = deferred<TOformsList>();
    const fast = deferred<TOformsList>();
    api.getOforms
      .mockReturnValueOnce(slow.promise)
      .mockReturnValueOnce(fast.promise);

    const slowFilter = store.oformsFilter.clone();
    slowFilter.search = "slow";
    const fastFilter = store.oformsFilter.clone();
    fastFilter.search = "fast";

    const first = store.refetchOforms(slowFilter);
    const second = store.refetchOforms(fastFilter);

    fast.resolve(list([2]));
    await second;
    slow.resolve(list([1]));
    await first;

    expect(store.oformFiles?.map(({ id }) => id)).toEqual([2]);
    expect(store.oformsFilter.search).toBe("fast");
    expect(store.oformsIsRefetching).toBe(false);
  });

  it("drops a page that belongs to a list already replaced", async () => {
    const store = createStore();
    store.oformsFilter.total = 10;
    store.setOformFiles([template(1)]);

    const page = deferred<TOformsList>();
    api.getOforms.mockReturnValueOnce(page.promise);
    const more = store.fetchMoreOforms();

    api.getOforms.mockResolvedValueOnce(list([5]));
    await store.fetchOforms(store.oformsFilter.clone());

    page.resolve(list([2], 10));
    await more;

    expect(store.oformFiles?.map(({ id }) => id)).toEqual([5]);
    expect(store.oformsIsLoading).toBe(false);
  });

  it("leaves the loading flag to the refetch that dropped a page", async () => {
    const store = createStore();
    store.oformsFilter.total = 10;
    store.setOformFiles([template(1)]);

    const page = deferred<TOformsList>();
    api.getOforms.mockReturnValueOnce(page.promise);
    const more = store.fetchMoreOforms();

    const replacement = deferred<TOformsList>();
    api.getOforms.mockReturnValueOnce(replacement.promise);
    const refetch = store.refetchOforms(store.oformsFilter.clone());

    page.resolve(list([2], 10));
    await more;

    expect(store.oformsIsLoading).toBe(true);
    expect(store.oformFiles?.map(({ id }) => id)).toEqual([1]);

    replacement.resolve(list([5]));
    await refetch;

    expect(store.oformsIsLoading).toBe(false);
  });

  it("dims the list while a tab switch reloads it", async () => {
    const store = createStore();
    const pending = deferred<TOformsList>();
    api.getOforms.mockReturnValueOnce(pending.promise);

    const reset = store.resetFilters(".xlsx");

    expect(store.oformsIsLoading).toBe(true);
    expect(store.oformsIsRefetching).toBe(true);

    pending.resolve(list([3]));
    await reset;

    expect(store.oformsIsLoading).toBe(false);
    expect(store.oformsIsRefetching).toBe(false);
    expect(store.oformFiles?.map(({ id }) => id)).toEqual([3]);
  });

  it("undims the list when a tab switch outruns a filter change", async () => {
    const store = createStore();
    const slow = deferred<TOformsList>();
    api.getOforms.mockReturnValueOnce(slow.promise);

    const searchFilter = store.oformsFilter.clone();
    searchFilter.search = "slow";
    const refetch = store.refetchOforms(searchFilter);

    api.getOforms.mockResolvedValueOnce(list([7]));
    await store.resetFilters(".xlsx");

    slow.resolve(list([1]));
    await refetch;

    expect(store.oformFiles?.map(({ id }) => id)).toEqual([7]);
    expect(store.oformsIsLoading).toBe(false);
    expect(store.oformsIsRefetching).toBe(false);
  });

  it("stops paginating when the list request fails", async () => {
    const store = createStore();
    store.oformsFilter.total = 10;
    store.setOformFiles([template(1)]);

    api.getOforms.mockRejectedValueOnce({ response: { status: 500 } });
    await store.fetchOforms(store.oformsFilter.clone());

    expect(store.oformsFilter.total).toBe(0);
    expect(store.hasMoreForms).toBe(false);
  });

  it("raises the error screen for a status the CMS was not expected to answer", async () => {
    const store = createStore();

    api.getOforms.mockRejectedValueOnce({ response: { status: 403 } });
    await store.fetchOforms(store.oformsFilter.clone());

    expect(store.oformsLoadError).toBe(true);
    expect(store.oformsNetworkError).toBe(false);
  });

  it("tells a dead network apart from a refusing CMS", async () => {
    const store = createStore();

    api.getOforms.mockRejectedValueOnce({ code: "ERR_NETWORK" });
    await store.fetchOforms(store.oformsFilter.clone());

    expect(store.oformsNetworkError).toBe(true);
    expect(store.oformsLoadError).toBe(false);
  });

  it("answers the locales request with an empty list when it fails", async () => {
    const store = createStore();
    store.setOformLocales(null);

    api.getOformLocales.mockRejectedValueOnce({ response: { status: 403 } });
    await store.fetchOformLocales();

    expect(store.oformLocales).toEqual([]);
  });

  it("raises the error screen when the CMS answers with the previous contract", async () => {
    const store = createStore();

    api.getOforms.mockRejectedValueOnce(new OformsContractError());
    await store.fetchOforms(store.oformsFilter.clone());

    expect(store.oformsLoadError).toBe(true);
    expect(store.oformFiles).toEqual([]);
  });
});
