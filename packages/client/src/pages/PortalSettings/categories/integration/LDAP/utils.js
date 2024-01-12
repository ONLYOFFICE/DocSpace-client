export const onChangeUrl = () => {
  const currentUrl = window.location.href.replace(window.location.origin, "");

  const newUrl = "/portal-settings/integration/ldap";

  if (newUrl === currentUrl) return;

  return newUrl;
};
