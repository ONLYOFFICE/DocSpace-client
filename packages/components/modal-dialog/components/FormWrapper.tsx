import React, { PropsWithChildren } from "react";

type FormWrapperProps = {
  withForm: boolean;
  className?: string;
};

function FormWrapper({
  withForm,
  children,
  className,
}: PropsWithChildren<FormWrapperProps>) {
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

export default FormWrapper;
