import globalColors from "./globalColors";
import GlobalStyle from "./globalStyles";
import NoUserSelect from "./commonStyles";

export { globalColors, GlobalStyle, NoUserSelect };

export const LoaderStyle = Object.freeze({
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
});

export const LANGUAGE = "asc_language";

export const MOBILE_FOOTER_HEIGHT = "64px";
export const INFO_PANEL_WIDTH = 400;

// TODO: REMOVE NEXT LINES LATER

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
