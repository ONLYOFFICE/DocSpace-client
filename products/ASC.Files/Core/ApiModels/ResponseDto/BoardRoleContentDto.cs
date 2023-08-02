// (c) Copyright Ascensio System SIA 2010-2022
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

namespace ASC.Files.Core.ApiModels.ResponseDto;

public class BoardRoleContentDto<T>
{
    public List<FileEntryDto> Files { get; set; }
    public BoardRolesDto Current { get; set; }
    public object PathParts { get; set; }
    public int StartIndex { get; set; }
    public int Count { get; set; }
    public int Total { get; set; }
    public int New { get; set; }

    public BoardRoleContentDto() { }

}

[Scope]
public class BoardRoleContentDtoHelper
{
    private readonly FileSecurity _fileSecurity;
    private readonly IDaoFactory _daoFactory;
    private readonly FileDtoHelper _fileDtoHelper;
    private readonly BoardRolesDtoHelper _boardRolesDtoHelper;
    private readonly BadgesSettingsHelper _badgesSettingsHelper;

    public BoardRoleContentDtoHelper(
        FileSecurity fileSecurity,
        IDaoFactory daoFactory,
        FileDtoHelper fileWrapperHelper,
        BoardRolesDtoHelper boardRolesDtoHelper,
        BadgesSettingsHelper badgesSettingsHelper)
    {
        _fileSecurity = fileSecurity;
        _daoFactory = daoFactory;
        _fileDtoHelper = fileWrapperHelper;
        _boardRolesDtoHelper = boardRolesDtoHelper;
        _badgesSettingsHelper = badgesSettingsHelper;
    }

    public async Task<BoardRoleContentDto<T>> GetAsync<T>(DataWrapper<T> boardRoleEntries, T folderId, int roleId, int startIndex)
    {
        var parentInternalIds = new HashSet<int>();
        var parentThirdPartyIds = new HashSet<string>();

        var files = new List<FileEntry>();

        foreach (var e in boardRoleEntries.Entries)
        {
            if (e.FileEntryType == FileEntryType.File)
            {
                files.Add(e);
            }
        }

        var foldersIntWithRightsTask = GetFoldersWithRightsAsync(parentInternalIds).ToListAsync();
        var foldersStringWithRightsTask = GetFoldersWithRightsAsync(parentThirdPartyIds).ToListAsync();

        var foldersIntWithRights = await foldersIntWithRightsTask;
        var foldersStringWithRights = await foldersStringWithRightsTask;

        var filesTask = GetFilesDto(files).ToListAsync();

        var boardRoleDao = _daoFactory.GetBoardRoleDao<T>();
        var role = await boardRoleDao.GetBoardRoleAsync(folderId, roleId);

        var currentTask = GetBoardRolesDto(role);

        var isEnableBadges = await _badgesSettingsHelper.GetEnabledForCurrentUserAsync();

        var result = new BoardRoleContentDto<T>
        {
            PathParts = boardRoleEntries.FolderPathParts,
            StartIndex = startIndex,
            Total = boardRoleEntries.Total,
            New = isEnableBadges ? boardRoleEntries.New : 0,
            Count = boardRoleEntries.Entries.Count,
            Current = await currentTask
        };

        result.Files = await filesTask.AsTask();

        return result;

        IAsyncEnumerable<Tuple<FileEntry<T1>, bool>> GetFoldersWithRightsAsync<T1>(IEnumerable<T1> ids)
        {
            if (ids.Any())
            {
                var folderDao = _daoFactory.GetFolderDao<T1>();

                return _fileSecurity.CanReadAsync(folderDao.GetFoldersAsync(ids));
            }

            return AsyncEnumerable.Empty<Tuple<FileEntry<T1>, bool>>();
        }

        async IAsyncEnumerable<FileEntryDto> GetFilesDto(IEnumerable<FileEntry> fileEntries)
        {
            foreach (var r in fileEntries)
            {
                if (r is File<int> fol1)
                {
                    yield return await _fileDtoHelper.GetAsync(fol1, foldersIntWithRights);
                }
                else if (r is File<string> fol2)
                {
                    yield return await _fileDtoHelper.GetAsync(fol2, foldersStringWithRights);
                }
            }
        }

        async Task<BoardRolesDto> GetBoardRolesDto(BoardRole role)
        {
            return await _boardRolesDtoHelper.GetAsync(role);
        }

    }
}
