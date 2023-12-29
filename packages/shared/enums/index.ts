export const enum ParseErrorTypes {
  None = 0,
  EmptyRecipients = 1,
  IncorrectEmail = 2,
}

export const enum ButtonKeys {
  enter = "enter",
  esc = "esc",
  tab = "Tab",
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

export const enum RoomsType {
  // FillingFormsRoom: 1, //TODO: Restore when certs will be done
  EditingRoom = 2,
  // ReviewRoom: 3, //TODO: Restore when certs will be done
  // ReadOnlyRoom: 4, //TODO: Restore when certs will be done
  PublicRoom = 6,
  CustomRoom = 5,
}
