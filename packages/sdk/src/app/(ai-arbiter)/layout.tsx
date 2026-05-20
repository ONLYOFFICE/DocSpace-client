/*
 * Copyright (C) Ascensio System SIA, 2009-2026. AGPL-3.0-only.
 */

import { AiArbiterStoreProviders } from "./_store";

export default function AiArbiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <AiArbiterStoreProviders>{children}</AiArbiterStoreProviders>
    </main>
  );
}
