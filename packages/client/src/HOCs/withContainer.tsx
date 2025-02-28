import React from "react";
import { inject, observer } from "mobx-react";
import { fakeFormFillingList } from "@docspace/shared/utils/formFillingTourData";

interface InjectedProps {
  filesStore?: {
    filesList: unknown[];
  };
  dialogsStore?: {
    formFillingTipsVisible: boolean;
    welcomeFormFillingTipsVisible: boolean;
  };
}

interface WithContainerProps {
  list: unknown[];
  isTutorialEnabled: boolean;
}

const withContainer = <P extends WithContainerProps>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const ComponentWithContainer = inject(
    "filesStore",
    "dialogsStore",
  )(
    observer((props: P & InjectedProps) => {
      const { filesStore, dialogsStore, ...rest } = props;

      if (!filesStore || !dialogsStore) {
        console.error("Required stores are not injected");
        return null;
      }

      const { filesList } = filesStore;
      const { formFillingTipsVisible, welcomeFormFillingTipsVisible } =
        dialogsStore;

      const isTutorialEnabled =
        formFillingTipsVisible || welcomeFormFillingTipsVisible;

      const list = isTutorialEnabled ? fakeFormFillingList : filesList;

      return (
        <WrappedComponent
          {...(rest as P)}
          list={list}
          isTutorialEnabled={isTutorialEnabled}
        />
      );
    }),
  );

  return ComponentWithContainer;
};

export default withContainer;
