import React from "react";

import { ModalDialogFormWrapperProps } from "../ModalDialog.types";

function FormWrapper({
  withForm,
  children,
  className,
}: ModalDialogFormWrapperProps) {
  if (!withForm) return children;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

export { FormWrapper };
