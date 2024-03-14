"use client";

import React from "react";

import useI18N from "@/hooks/useI18N";

import { Error404Wrapper } from "@docspace/shared/components/errors/Error404";

const NotFound = ({}) => {
  const { i18n } = useI18N({});

  console.log(i18n);

  return <Error404Wrapper i18nProp={i18n} />;
};

export default NotFound;
