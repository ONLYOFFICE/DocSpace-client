export const enum AuthenticatedAction {
  None = 0,
  Logout = 1,
  Redirect = 2,
}

/**
 * Enum for sort by field name
 * @readonly
 */
export const enum SortByFieldName {
  Name = "AZ",
  ModifiedDate = "DateAndTime",
  CreationDate = "DateAndTimeCreation",
  Author = "Author",
  Size = "Size",
  Type = "Type",
  Room = "Room",
  Tags = "Tags",
  RoomType = "roomType",
  LastOpened = "LastOpened",
  UsedSpace = "usedspace",
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
