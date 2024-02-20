import { useState, useEffect, useRef, useTransition } from "react";
import { getGroupById } from "@docspace/shared/api/groups";

const useFetchGroup = (groupId, fetchedGroupId, setGroup) => {
  const isMount = useRef(true);
  const abortControllerRef = useRef(new AbortController());

  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const fetchGroup = async () => {
    if (!groupId) return;
    if (fetchedGroupId === groupId) return;

    if (isLoading) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
    } else {
      setIsLoading(true);
    }

    getGroupById(groupId, abortControllerRef.current?.signal)
      .then((data) => {
        if (isMount.current) startTransition(() => setGroup(data));
      })
      .catch((err) => {
        if (err.message !== "canceled") console.error(err);
      })
      .finally(() => {
        if (isMount.current) setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!isMount.current) return;
    fetchGroup();
  }, [groupId, fetchedGroupId]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      isMount.current = false;
    };
  }, []);
};

export default useFetchGroup;
