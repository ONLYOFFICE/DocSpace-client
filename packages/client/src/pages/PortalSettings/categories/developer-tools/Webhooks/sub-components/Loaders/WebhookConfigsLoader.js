import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const LoaderWrapper = styled.div`
  width: 100%;

  .webhookTextLoader {
    display: block;
    margin-bottom: 24px;
  }
  .webhookButtonLoader {
    display: block;
    margin-bottom: 16px;
  }

  .labelsLoader {
    width: 435px;
    display: flex;
    justify-content: space-between;
  }
  .iconsLoader {
    width: 131px;
    display: flex;
    justify-content: space-between;
  }

  .roundedStatusLoader {
    border-radius: 10px;
  }
`;

const NavContainerLoader = styled.nav`
  width: 184px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TableHeaderLoader = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 33px;
`;

const TableRowLoader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 27px;
`;

export const WebhookConfigsLoader = () => {
  const RowLoader = () => (
    <TableRowLoader>
      <RectangleSkeleton width="888px" height="20px" />
      <div className="iconsLoader">
        <RectangleSkeleton
          width="28px"
          height="16px"
          className="roundedStatusLoader"
        />
        <RectangleSkeleton width="16px" height="16px" />
      </div>
    </TableRowLoader>
  );

  return (
    <LoaderWrapper>
      <NavContainerLoader>
        <RectangleSkeleton width="82px" height="32px" />
        <RectangleSkeleton width="82px" height="32px" />
      </NavContainerLoader>

      <RectangleSkeleton
        width="700px"
        height="88px"
        className="webhookTextLoader"
      />

      <RectangleSkeleton
        width="159px"
        height="32px"
        className="webhookButtonLoader"
      />

      <TableHeaderLoader>
        <div className="labelsLoader">
          <RectangleSkeleton width="51px" height="16px" />
          <RectangleSkeleton width="60px" height="16px" />
        </div>
        <div className="iconsLoader">
          <RectangleSkeleton width="62px" height="16px" />
          <RectangleSkeleton width="16px" height="16px" />
        </div>
      </TableHeaderLoader>

      <RowLoader />
      <RowLoader />
      <RowLoader />
      <RowLoader />
      <RowLoader />
    </LoaderWrapper>
  );
};
