import React from "react";

const defaultValue: { sectionWidth?: number; sectionHeight?: number } = {};

export const Context = React.createContext(defaultValue);

export const { Provider, Consumer } = Context;
