export const getDeepLink = (location, email, file, url, originalUrl) => {
  const jsonData = {
    portal: location,
    email: email,
    file: {
      id: file.id,
      title: file.title,
      extension: file.fileExst,
    },
    folder: {
      id: file.folderId,
      parentId: file.rootFolderId,
      rootFolderType: file.rootFolderType,
    },
    originalUrl: originalUrl,
  };
  const deepLinkData = window.btoa(JSON.stringify(jsonData));

  return `${url}?data=${deepLinkData}`;
};
