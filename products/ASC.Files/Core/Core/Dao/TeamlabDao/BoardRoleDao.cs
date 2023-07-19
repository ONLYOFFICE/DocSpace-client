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

namespace ASC.Files.Core.Data;

[Scope]
internal class BoardRoleDao : AbstractDao, IBoardRoleDao<int>
{

    private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1);
    private readonly IMapper _mapper;

    public BoardRoleDao(
        UserManager userManager,
        IDbContextFactory<FilesDbContext> dbContextManager,
        TenantManager tenantManager,
        TenantUtil tenantUtil,
        SetupInfo setupInfo,
        MaxTotalSizeStatistic maxTotalSizeStatistic,
        CoreBaseSettings coreBaseSettings,
        CoreConfiguration coreConfiguration,
        SettingsManager settingsManager,
        AuthContext authContext,
        IServiceProvider serviceProvider,
        ICache cache,
        IMapper mapper)
        : base(
              dbContextManager,
              userManager,
              tenantManager,
              tenantUtil,
              setupInfo,
              maxTotalSizeStatistic,
              coreBaseSettings,
              coreConfiguration,
              settingsManager,
              authContext,
              serviceProvider,
              cache)
    {
        _mapper = mapper;
    }


    public async IAsyncEnumerable<BoardRole> GetBoardRolesAsync(int boardId)
    {
        using var filesDbContext = _dbContextFactory.CreateDbContext();

        var sqlQuery = Query(filesDbContext.FilesBoardRole)
                   .Where(r => r.BoardId == boardId);

        await foreach (var e in sqlQuery.AsAsyncEnumerable())
        {
            yield return ToBoardRole(e);
        }

    }
    public async IAsyncEnumerable<File<int>> GetBoardFilesByRole(int boardId, int roleId)
    {
        using var filesDbContext = _dbContextFactory.CreateDbContext();

        var q = Query(filesDbContext.Files)
            .Join(filesDbContext.TagLink, f => f.Id.ToString(), t => t.EntryId, (files, tagLinks) => new { files, tagLinks })
            .Join(filesDbContext.FilesBoardRole, r => r.tagLinks.TagId, t => t.TagId, (result, boardInfo) => new DbFileBoardQuery { File = result.files, Board = boardInfo })
            .Where(r => r.Board.BoardId == boardId)
            .Where(r => r.Board.RoleId == roleId);

        await foreach (var e in q.AsAsyncEnumerable())
        {
            yield return _mapper.Map<DbFileBoardQuery, File<int>>(e);
        }
    }


    public async Task<BoardRole> GetBoardRoleAsync(int boardId, int roleId)
    {
        using var filesDbContext = _dbContextFactory.CreateDbContext();

        var sqlQuery = Query(filesDbContext.FilesBoardRole)
                   .Where(r => r.BoardId == boardId)
                   .Where(r => r.RoleId == roleId);

        var r = await sqlQuery.Take(1).SingleOrDefaultAsync();

        return ToBoardRole(r);
    }

    public async Task<IEnumerable<BoardRole>> SaveBoardRoleAsync(IEnumerable<BoardRole> boarRoles)
    {
        var result = new List<BoardRole>();

        await _semaphore.WaitAsync();

        using var filesDbContext = _dbContextFactory.CreateDbContext();
        var strategy = filesDbContext.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            using var filesDbContext = _dbContextFactory.CreateDbContext();
            using var tx = await filesDbContext.Database.BeginTransactionAsync();

            foreach (var br in boarRoles)
            {
                result.Add(await SaveBoardRoleAsync(br));
            }

            await tx.CommitAsync();
        });

        _semaphore.Release();

        return result;

    }

    private async Task<BoardRole> SaveBoardRoleAsync(BoardRole boardRole)
    {
        using var filesDbContext = _dbContextFactory.CreateDbContext();

        var boardRoleDb = new DbFilesBoardRole
        {
            TenantId = TenantID,
            BoardId = boardRole.BoardId,
            RoleId = boardRole.RoleId,
            TagId = boardRole.TagId,
            RoleTitle = boardRole.Title,
            Color = boardRole.Color,
            QueueNumber = boardRole.QueueNumber,
            AssignedTo = boardRole.AssignedTo,
            Type = boardRole.Type

        };

        var boardRoleResult = await filesDbContext.FilesBoardRole.AddAsync(boardRoleDb);
        await filesDbContext.SaveChangesAsync();

        return _mapper.Map<DbFilesBoardRole, BoardRole>(boardRoleResult.Entity);
    }

    protected BoardRole ToBoardRole(DbFilesBoardRole r)
    {
        var result = _mapper.Map<DbFilesBoardRole, BoardRole>(r);

        return result;
    }

}
