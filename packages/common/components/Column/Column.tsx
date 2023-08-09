import { inject, observer } from "mobx-react";
import { useCallback, useEffect, useState } from "react";

import { ColumnContainer, ColumnHeader, ColumnBody } from "./Column.styled";
import ColumnHeaderContent from "./ColumnHeaderContent";
import ColumnBodyContent from "./ColumnBodyContent";

import type { ColumnProps } from "./Column.props";
import type { StoreType } from "SRC_DIR/types";
import type { IFileByRole } from "@docspace/common/Models";

function Column(props: ColumnProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    props.fetchFilesByRole?.(props.role).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const onSelected = useCallback(
    (file: IFileByRole, checked: boolean) => {
      props.selectedFileByRole?.(file, checked);
    },
    [props.selectedFileByRole]
  );

  return (
    <ColumnContainer>
      <ColumnHeader>
        <ColumnHeaderContent role={props.role} getModel={props.getModel} />
      </ColumnHeader>
      <ColumnBody>
        <ColumnBodyContent
          isLoading={isLoading && !props.firstLoaded}
          filesByRole={props.filesByRole}
          onSelected={onSelected}
          getOptions={props.getModelFile!}
          setBufferSelectionFileByRole={props.setBufferSelectionFileByRole!}
        />
      </ColumnBody>
    </ColumnContainer>
  );
}

export default inject<StoreType, ColumnProps>(
  ({ dashboardStore, dashboardContextOptionStore }, { role: { id } }) => {
    const {
      fetchFilesByRole,
      selectedFileByRole,
      collectionFileByRoleStore,
      setBufferSelectionFileByRole,
    } = dashboardStore;

    const { getModelFile } = dashboardContextOptionStore;

    const filesByRoleStore = collectionFileByRoleStore?.get(id);

    const filesByRole = filesByRoleStore?.FilesByRole ?? [];
    const firstLoaded = Boolean(filesByRoleStore?.firstLoaded);

    return {
      firstLoaded,
      filesByRole,

      fetchFilesByRole,

      selectedFileByRole,
      collectionFileByRoleStore,
      getModelFile,
      setBufferSelectionFileByRole,
    };
  }
)(observer(Column));
