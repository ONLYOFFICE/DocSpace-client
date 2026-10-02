// JavaScript component wrapped in inject + withTranslation: every prop it uses
// is supplied by those HOCs, so a TSX caller passes none. Without this
// declaration react-i18next 15 resolves the wrapped props to the injected ones
// and asks the call site for all of them.
import type { ComponentType } from "react";

declare const ActiveSessions: ComponentType;

export default ActiveSessions;
