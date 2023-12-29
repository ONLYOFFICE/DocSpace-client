import React from "react";

import { Loader, LoaderTypes } from "../loader";

import { ButtonProps } from "./Button.types";
import ButtonTheme from "./Button.theme";
import { ButtonSize } from "./Button.enums";

export { ButtonSize };

const Button = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<ButtonProps>
>((props, ref) => {
  const { isLoading, icon, label, primary } = props;
  return (
    <ButtonTheme {...props} ref={ref} data-testid="button">
      {isLoading && (
        <Loader
          className="loader"
          color=""
          size="20px"
          type={LoaderTypes.track}
          label={label}
          primary={primary || false}
        />
      )}
      <div className="button-content not-selectable">
        {icon && <div className="icon">{icon}</div>}
        {label}
      </div>
    </ButtonTheme>
  );
});

Button.displayName = "Button";
export { Button };
