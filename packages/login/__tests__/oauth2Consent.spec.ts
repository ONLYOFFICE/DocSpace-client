import type { Page } from "@playwright/test";

import { successClient } from "@docspace/shared/__mocks__/handlers/oauth/client";

import { test, expect } from "./fixtures/base";

const SELF_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const LOADER = 'data-testid="app-loader"';
const ALLOW_BUTTON = "consent_allow_button";

const toBase64Url = (value: string) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const pendingAuthorizationUri = toBase64Url(
  "http://localhost:8092/oauth2/authorize" +
    "?response_type=code" +
    `&client_id=${successClient.client_id}` +
    "&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fdocspace%2Foauth%2Fcallback" +
    "&scope=accounts%3Aread",
);

const validSignature = () => {
  const payload = toBase64Url(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  );

  return `eyJhbGciOiJIUzI1NiJ9.${payload}.signature`;
};

const consentUrl = (baseUrl: string) =>
  `${baseUrl}/login/consent?client_id=${successClient.client_id}`;

const getServerHtml = async (page: Page, url: string) => {
  await page.route("**/oauth2/authorize*", (route) =>
    route.fulfill({ status: 200, body: "authorize stub" }),
  );

  const response = await page.goto(url, { waitUntil: "commit" });

  expect(response?.status()).toBe(200);

  return response!.text();
};

test("oauth2 consent loader while signature pending", async ({
  page,
  context,
  baseUrl,
}) => {
  await context.addCookies([
    { name: "asc_auth_key", value: "test", url: baseUrl },
    {
      name: "x-redirect-authorization-uri",
      value: pendingAuthorizationUri,
      url: baseUrl,
    },
  ]);

  const html = await getServerHtml(page, consentUrl(baseUrl));

  expect(html).toContain(LOADER);
  expect(html).not.toContain(ALLOW_BUTTON);
});

test("oauth2 consent render with signature", async ({
  page,
  context,
  baseUrl,
}) => {
  await context.addCookies([
    { name: "asc_auth_key", value: "test", url: baseUrl },
    {
      name: "x-redirect-authorization-uri",
      value: pendingAuthorizationUri,
      url: baseUrl,
    },
    { name: `x-signature-${SELF_ID}`, value: validSignature(), url: baseUrl },
  ]);

  const html = await getServerHtml(page, consentUrl(baseUrl));

  expect(html).toContain(ALLOW_BUTTON);
  expect(html).not.toContain(LOADER);
});

test("oauth2 consent render without pending redirect", async ({
  page,
  context,
  baseUrl,
}) => {
  await context.addCookies([
    { name: "asc_auth_key", value: "test", url: baseUrl },
  ]);

  await page.goto(consentUrl(baseUrl));

  await expect(page.getByTestId(ALLOW_BUTTON)).toBeVisible();
});
