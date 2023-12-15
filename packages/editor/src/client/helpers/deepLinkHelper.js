function DeepLinker(options) {
  if (!options) {
    throw new Error("no options");
  }

  let hasFocus = true;
  let didHide = false;

  function onBlur() {
    hasFocus = false;
  }

  function onVisibilityChange(e) {
    if (e.target.visibilityState === "hidden") {
      didHide = true;
    }
  }

  function onFocus() {
    if (didHide) {
      if (options.onReturn) {
        options.onReturn();
      }

      didHide = false;
    } else {
      if (!hasFocus && options.onFallback) {
        setTimeout(function () {
          if (!didHide) {
            options.onFallback();
          }
        }, 1000);
      }
    }

    hasFocus = true;
  }

  function bindEvents(mode) {
    [
      [window, "blur", onBlur],
      [document, "visibilitychange", onVisibilityChange],
      [window, "focus", onFocus],
    ].forEach(function (conf) {
      conf[0][mode + "EventListener"](conf[1], conf[2]);
    });
  }

  bindEvents("add");

  this.destroy = bindEvents.bind(null, "remove");
  this.openURL = function (url) {
    var dialogTimeout = 500;

    setTimeout(function () {
      if (hasFocus && options.onIgnored) {
        options.onIgnored();
      }
    }, dialogTimeout);

    window.location = url;
  };
}

export const getDeepLink = (
  location,
  email,
  file,
  deepLinkConfig,
  originalUrl
) => {
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
  const deepLinkData = window.btoa(
    encodeURIComponent(JSON.stringify(jsonData))
  );

  const linker = new DeepLinker({
    onIgnored: function () {
      redirectToStore(deepLinkConfig);
    },
    onFallback: function () {
      redirectToStore(deepLinkConfig);
    },
    onReturn: function () {
      //redirectToStore(deepLinkConfig);
    },
  });

  linker.openURL(`${deepLinkConfig?.url}?data=${deepLinkData}`);
};

const redirectToStore = (deepLinkConfig) => {
  const nav = navigator.userAgent;
  const isIOS = nav.includes("iPhone;") || nav.includes("iPad;");

  const storeUrl = isIOS
    ? `https://apps.apple.com/app/id${deepLinkConfig?.iosPackageId}`
    : `https://play.google.com/store/apps/details?id=${deepLinkConfig?.androidPackageName}`;

  window.location.replace(storeUrl);
};
