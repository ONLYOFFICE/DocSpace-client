export const enum AuthenticatedAction {
  None = 0,
  Logout = 1,
  Redirect = 2,
}

/**
 * Enum for result of validation confirm link.
 * @readonly
 */
export const enum ValidationResult {
  Ok = 0,
  Invalid = 1,
  Expired = 2,
  TariffLimit = 3,
}
