import { describe, it, expect, vi, beforeEach } from "vitest";

const api = vi.hoisted(() => ({
  getOforms: vi.fn(),
  getOformPurposes: vi.fn(),
  getOformLocales: vi.fn(),
  submitToGallery: vi.fn(),
}));

vi.mock("@docspace/shared/api/oforms", () => api);

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), warning: vi.fn() },
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type {
  TOformFile,
  TOformPurpose,
  TOformsList,
} from "@docspace/shared/api/oforms/types";

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

  it("hides categories without templates of the current type", () => {
    const store = createStore();
    store.setPurposes(purposes);

    const [integrations] = store.parentCategories;
    expect(integrations.subcategories.map(({ id }) => id)).toEqual([101]);
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
    expect(store.currentCategory).toBeNull();
    expect(store.oformsFilter.categoryId).toBe("");
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
});
