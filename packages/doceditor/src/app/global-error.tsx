"use client";

import { useCallback, useState, useLayoutEffect } from "react";

import { getUser } from "@docspace/shared/api/people";
import { getSettings } from "@docspace/shared/api/settings";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TSettings } from "@docspace/shared/api/settings/types";

import Error from "@/components/Error/Error";

export default function GlobalError({ error }: { error: Error }) {
  const [user, setUser] = useState<TUser>();
  const [settigns, setSettigns] = useState<TSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setError] = useState<boolean>(false);

  const getData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userData, settignsData] = await Promise.all([
        getUser(),
        getSettings(),
      ]);

      setSettigns(settignsData);
      setUser(userData);
    } catch (error) {
      setError(true);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    getData();
  }, [getData]);

  if (isError) return;

  return (
    <html>
      <body>
        {!isLoading && (
          <Error user={user!} settings={settigns!} error={error} />
        )}
      </body>
    </html>
  );
}
