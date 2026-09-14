import type { TTranslations } from "@docspace/ui-kit/providers/translation";

import { getBrandName } from "../constants/brands";
import { getLinkPreview } from "./link-preview";

const DESCRIPTION_KEY = "LinkPreviewDescription";
const TEMPLATE = "{{organizationName}} {{productName}} is a workspace.";

const buildTranslations = (
  values: Record<string, Record<string, string>>,
): TTranslations =>
  new Map(
    Object.entries(values).map(([lng, common]) => [
      lng,
      new Map([["Common", common]]),
    ]),
  );

const withTemplate = (...locales: string[]) =>
  buildTranslations(
    Object.fromEntries(
      locales.map((lng) => [lng, { [DESCRIPTION_KEY]: TEMPLATE }]),
    ),
  );

describe("getLinkPreview", () => {
  it("uses the locale value when the key is translated", () => {
    const translations = buildTranslations({
      ru: { [DESCRIPTION_KEY]: "{{organizationName}} {{productName}} rules" },
      en: { [DESCRIPTION_KEY]: TEMPLATE },
    });

    const { description } = getLinkPreview("Acme", translations, "ru");

    expect(description).toBe(`Acme ${getBrandName("ProductName")} rules`);
  });

  it("falls back to English when the locale lacks the key", () => {
    const translations = buildTranslations({
      ru: { SomethingElse: "nothing to see" },
      en: { [DESCRIPTION_KEY]: "{{organizationName}} in English" },
    });

    const { description } = getLinkPreview("Acme", translations, "ru");

    expect(description).toBe("Acme in English");
  });

  it("leaves the description out when the key is missing everywhere", () => {
    const translations = buildTranslations({ ru: {}, en: {} });

    const { title, description } = getLinkPreview("Acme", translations, "ru");

    expect(title).toBe("Acme");
    expect(description).toBeUndefined();
  });

  it("falls back to the organization name without logoText", () => {
    const translations = buildTranslations({
      en: { [DESCRIPTION_KEY]: "{{organizationName}} in English" },
    });

    const { title, description } = getLinkPreview(undefined, translations, "en");

    expect(title).toBe(getBrandName("OrganizationName"));
    expect(description).toBe(`${getBrandName("OrganizationName")} in English`);
  });

  it("survives missing translations entirely", () => {
    const { title, description } = getLinkPreview("Acme");

    expect(title).toBe("Acme");
    expect(description).toBeUndefined();
  });

  it("treats a brand name with $ patterns as literal text", () => {
    const { description } = getLinkPreview("A$&B", withTemplate("en"), "en");

    expect(description).toBe(
      `A$&B ${getBrandName("ProductName")} is a workspace.`,
    );
  });

  it("does not substitute a placeholder coming from the brand name", () => {
    const { description } = getLinkPreview(
      "{{productName}}",
      withTemplate("en"),
      "en",
    );

    expect(description).toBe(
      `{{productName}} ${getBrandName("ProductName")} is a workspace.`,
    );
  });

  it("keeps an unknown placeholder untouched", () => {
    const translations = buildTranslations({
      en: { [DESCRIPTION_KEY]: "{{organizationName}} and {{unknownThing}}" },
    });

    const { description } = getLinkPreview("Acme", translations, "en");

    expect(description).toBe("Acme and {{unknownThing}}");
  });
});
