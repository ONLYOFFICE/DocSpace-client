/*
 * Copyright (C) Ascensio System SIA, 2009-2026. AGPL-3.0-only.
 */

"use client";

import React from "react";

import {
  frameCallEvent,
  getFrameId,
} from "@docspace/shared/utils/common";

import type { ArbiterCommonData } from "@/types/arbiter";

import useInitArbiterStores from "../_hooks/useInitArbiterStores";

type AiArbiterShellProps = {
  commonData: ArbiterCommonData;
  children: React.ReactNode;
};

const AiArbiterShell = ({ commonData, children }: AiArbiterShellProps) => {
  const isReady = useInitArbiterStores(commonData);

  const appReadySent = React.useRef(false);
  React.useEffect(() => {
    if (isReady && !appReadySent.current) {
      appReadySent.current = true;
      frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
    }
  }, [isReady]);

  if (!isReady) return null;

  return <>{children}</>;
};

export default AiArbiterShell;
