/**
 * Enum for type of email value errors.
 * @readonly
 */
export const parseErrorTypes = Object.freeze({
  None: 0,
  EmptyRecipients: 1,
  IncorrectEmail: 2,
});

export const errorKeys = Object.freeze({
  LocalDomain: "LocalDomain",
  IncorrectDomain: "IncorrectDomain",
  DomainIpAddress: "DomainIpAddress",
  PunycodeDomain: "PunycodeDomain",
  PunycodeLocalPart: "PunycodeLocalPart",
  IncorrectLocalPart: "IncorrectLocalPart",
  SpacesInLocalPart: "SpacesInLocalPart",
  MaxLengthExceeded: "MaxLengthExceeded",
  IncorrectEmail: "IncorrectEmail",
  ManyEmails: "ManyEmails",
  EmptyEmail: "EmptyEmail",
});

export const LoaderStyle = {
  title: "",
  width: "100%",
  height: "32",
  backgroundColor: "#000000",
  foregroundColor: "#000000",
  backgroundOpacity: 0.1,
  foregroundOpacity: 0.15,
  borderRadius: "3",
  radius: "3",
  speed: 2,
  animate: true,
};
