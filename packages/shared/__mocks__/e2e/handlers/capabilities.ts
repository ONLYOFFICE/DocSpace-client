import { http, HttpResponse } from "msw";

export const capabilitiesWithSSO = {
  response: {
    ldapEnabled: false,
    providers: [],
    ssoLabel: "Single Sign-on",
    oauthEnabled: true,
    ssoUrl: "http://192.168.0.16/sso/login",
    identityServerEnabled: true,
  },
  count: 1,
  links: [
    {
      href: "http://192.168.0.16/api/2.0/capabilities",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export default http.get("/api/2.0/capabilities", async () => {
  return HttpResponse.json(capabilitiesWithSSO);
});
