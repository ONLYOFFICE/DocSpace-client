export const enum ScopeType {
  read = "read",
  write = "write",
}

export const enum ScopeGroup {
  files = "files",
  accounts = "accounts",
  profiles = "profiles",
  rooms = "rooms",
  openid = "openid",
}

export const enum AuthenticationMethod {
  none = "none",
  "client_secret_post" = "client_secret_post",
}
