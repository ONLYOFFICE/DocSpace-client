import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";

const StyledLoader = styled.div`
  .submenu {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    .item {
      width: 72px;
    }
  }

  .description {
    max-width: 700px;
    margin-bottom: 20px;
  }

  .category {
    margin-top: 24px;
    width: 238px;
  }
`;

const SSOLoader = (props) => {
  const { isToggleSSO } = props;
  return (
    <StyledLoader>
      {!isToggleSSO && (
        <div className="submenu">
          <RectangleSkeleton className="item" height="28px" />
          <RectangleSkeleton className="item" height="28px" />
        </div>
      )}
      <RectangleSkeleton className="description" height="60px" />
      <RectangleSkeleton height="64px" />

      <RectangleSkeleton className="category" height="22px" />
      <StyledSettingsSeparator />
      <RectangleSkeleton className="category" height="22px" />
    </StyledLoader>
  );
};

export default SSOLoader;
