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
    props.fetchFilesByRole?.(props.role.id).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const onSelected = useCallback(
    (file: IFileByRole, checked: boolean) => {
      props.selectedFileByRole?.(file, checked);
    },
    [props.selectedFileByRole]
  );

  const filesByRoleStore = props.collectionFileByRoleStore?.get(props.role.id);

  return (
    <ColumnContainer>
      <ColumnHeader>
        <ColumnHeaderContent role={props.role} getModel={props.getModel} />
      </ColumnHeader>
      <ColumnBody>
        <ColumnBodyContent
          isLoading={isLoading}
          filesByRole={filesByRoleStore?.FilesByRole}
          onSelected={onSelected}
        />
      </ColumnBody>
    </ColumnContainer>
  );
}

export default inject<StoreType>(({ dashboardStore }) => {
  const {
    filesByRole,
    fetchFilesByRole,
    selectedFilesByRoleMap,
    selectedFileByRole,
    collectionFileByRoleStore,
  } = dashboardStore;

  return {
    filesByRole,
    fetchFilesByRole,
    selectedFilesByRoleMap,
    selectedFileByRole,
    collectionFileByRoleStore,
  };
})(observer(Column));
