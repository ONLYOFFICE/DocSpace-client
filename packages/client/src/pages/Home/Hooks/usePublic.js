import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const usePublic = ({
  location,
  fetchFiles,
  fetchPublicRoom,
  fetchPreviewMediaFile,
}) => {
  const { id } = useParams();

  useEffect(() => {
    const isMedia = fetchPreviewMediaFile(id, () =>
      fetchPublicRoom(fetchFiles),
    );

    if (isMedia) return;

    fetchPublicRoom(fetchFiles);
  }, [location.search]);
};

export default usePublic;
