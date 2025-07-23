// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import { inject, observer } from "mobx-react";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import HistoryRowsSkeleton from "@docspace/shared/skeletons/history";
import { CustomScrollbarsVirtualListWithAutoFocus } from "@docspace/shared/components/scrollbar";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "@docspace/shared/constants";
import VersionRow from "./VersionRow";
import { StyledBody, StyledVersionList } from "./StyledVersionHistory";

const VirtualScroll = React.forwardRef((props, ref) => (
  <CustomScrollbarsVirtualListWithAutoFocus
    {...props}
    ref={ref}
    paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM}
  />
));
VirtualScroll.displayName = "VirtualScroll";

class SectionBodyContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRestoreProcess: false,
      rowSizes: {},
      showRows: false,
    };

    this.listRef = React.createRef();
    this.timerId = null;
  }

  componentDidMount() {
    const { setFirstLoad, fileId, fileSecurity } = this.props;

    this.getFileVersions(fileId, fileSecurity);

    setFirstLoad(false);
  }

  getFileVersions = (fileId, fileSecurity) => {
    const { fetchFileVersions, setIsLoading } = this.props;
    setIsLoading(true);
    fetchFileVersions(fileId, fileSecurity).then(() => setIsLoading(false));
  };

  onSetRestoreProcess = (restoring) => {
    const { isRestoreProcess } = this.state;

    if (restoring) {
      this.timerId = setTimeout(
        () =>
          this.setState({
            isRestoreProcess: restoring,
          }),
        100,
      );
    } else {
      clearTimeout(this.timerId);
      this.timerId = null;

      restoring !== isRestoreProcess &&
        this.setState({
          isRestoreProcess: restoring,
        });
    }
  };

  onUpdateHeight = (i, itemHeight) => {
    if (this.listRef.current) {
      this.listRef.current.resetAfterIndex(i);
    }

    this.setState((prevState) => ({
      rowSizes: {
        ...prevState.rowSizes,
        [i]: itemHeight + 27, // composed of itemHeight = clientHeight of div and padding-top = 13px and padding-bottom = 12px
      },
    }));

    this.setState({
      showRows: true,
    });
  };

  getSize = (i) => {
    const { rowSizes } = this.state;
    return rowSizes[i] || 66;
  };

  renderRow = ({ index, style }) => {
    const { versions, culture, onClose } = this.props;

    const prevVersion = versions[index > 0 ? index - 1 : index].versionGroup;
    let hasVersion = true;

    if (index > 0 && prevVersion === versions[index].versionGroup) {
      hasVersion = false;
    }
    return (
      <div style={style}>
        <VersionRow
          onClose={onClose}
          getFileVersions={this.getFileVersions}
          isVersion={hasVersion}
          key={`${versions[index].id}-${index}`}
          info={versions[index]}
          versionsListLength={versions.length}
          index={index}
          culture={culture}
          onSetRestoreProcess={this.onSetRestoreProcess}
          onUpdateHeight={this.onUpdateHeight}
        />
      </div>
    );
  };

  render() {
    const { versions, isLoading } = this.props;
    const { isRestoreProcess, showRows } = this.state;

    const renderList = ({ height, width }) => (
      <StyledVersionList
        isRestoreProcess={isRestoreProcess}
        showRows={showRows}
      >
        <List
          ref={this.listRef}
          className="List"
          height={height}
          width={width}
          itemSize={this.getSize}
          itemCount={versions.length}
          itemData={versions}
          outerElementType={VirtualScroll}
        >
          {this.renderRow}
        </List>
      </StyledVersionList>
    );

    return (
      <StyledBody>
        {versions && !isLoading ? (
          <div className="version-list">
            <AutoSizer>{renderList}</AutoSizer>
          </div>
        ) : (
          <div className="loader-history-rows">
            <HistoryRowsSkeleton />
          </div>
        )}
      </StyledBody>
    );
  }
}

export default inject(
  ({ settingsStore, versionHistoryStore, clientLoadingStore }) => {
    const { setFirstLoad, isLoading, setIsSectionBodyLoading } =
      clientLoadingStore;
    const { versions, fetchFileVersions, fileId, fileSecurity } =
      versionHistoryStore;

    return {
      culture: settingsStore.culture,
      isLoading,
      versions,
      fileId,
      fileSecurity,
      setFirstLoad,
      setIsLoading: setIsSectionBodyLoading,
      fetchFileVersions,
    };
  },
)(observer(SectionBodyContent));
