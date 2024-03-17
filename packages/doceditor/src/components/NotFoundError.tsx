"use client";

import React from "react";

import useI18N from "@/hooks/useI18N";

import { Error404Wrapper } from "@docspace/shared/components/errors/Error404";

const NotFoundError = ({}) => {
  const { i18n } = useI18N({});

  return <Error404Wrapper i18nProp={i18n} />;
};

export default NotFoundError;
