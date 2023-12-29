import React from "react";

const defaultValue = {};

export const Context = React.createContext(defaultValue);

export const { Provider, Consumer } = Context;
