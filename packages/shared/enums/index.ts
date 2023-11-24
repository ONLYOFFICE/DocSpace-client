/**
 * Enum for type of email value errors.
 * @readonly
 */
export const enum ParseErrorTypes {
  None = 0,
  EmptyRecipients = 1,
  IncorrectEmail = 2,
}

export const enum ErrorKeys {
  LocalDomain = "LocalDomain",
  IncorrectDomain = "IncorrectDomain",
  DomainIpAddress = "DomainIpAddress",
  PunycodeDomain = "PunycodeDomain",
  PunycodeLocalPart = "PunycodeLocalPart",
  IncorrectLocalPart = "IncorrectLocalPart",
  SpacesInLocalPart = "SpacesInLocalPart",
  MaxLengthExceeded = "MaxLengthExceeded",
  IncorrectEmail = "IncorrectEmail",
  ManyEmails = "ManyEmails",
  EmptyEmail = "EmptyEmail",
}
