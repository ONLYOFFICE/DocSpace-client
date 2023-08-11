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

namespace ASC.Api.Migration;

[Scope]
[DefaultRoute]
[ApiController]
public class MigrationController : ControllerBase
{
    private const string MigrationCacheKey = "ASC.Migration.Ongoing";
    private readonly CoreBaseSettings _coreBaseSettings;
    private readonly UserManager _userManager;
    private readonly AuthContext _authContext;
    private readonly TempPath _tempPath;
    private readonly StudioNotifyService _studioNotifyService;
    private readonly ICache _cache;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly MigrationCore _migrationCore;

    public MigrationController(
        CoreBaseSettings coreBaseSettings,
        UserManager userManager,
        AuthContext authContext,
        TempPath tempPath,
        StudioNotifyService studioNotifyService,
        ICache cache,
        IHttpContextAccessor httpContextAccessor,
        MigrationCore migrationCore)
    {
        _coreBaseSettings = coreBaseSettings;
        _userManager = userManager;
        _authContext = authContext;
        _tempPath = tempPath;
        _studioNotifyService = studioNotifyService;
        _cache = cache;
        _httpContextAccessor = httpContextAccessor;
        _migrationCore = migrationCore;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    [HttpGet("backuptmp")]
    public async Task<object> GetTmpFolderAsync()
    {
        await DemandPermission();

        var tempFolder = Path.Combine(_tempPath.GetTempPath(), "migration", DateTime.Now.ToString("dd.MM.yyyy_HH_mm"));

        if (!Directory.Exists(tempFolder))
        {
            Directory.CreateDirectory(tempFolder);
        }
        return tempFolder;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    [HttpGet("list")]
    public async Task<string[]> ListAsync()
    {
        await DemandPermission();

        return _migrationCore.GetAvailableMigrations();
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="migratorName"></param>
    /// <param name="dto"></param>
    [HttpPost("init/{migratorName}")]
    public async Task UploadAndInitAsync(string migratorName, MigrationInitRequestsDto dto)
    {
        await DemandPermission();

        await _migrationCore.StartParse(migratorName, dto.Path);
    }

    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    [HttpGet("status")]
    public async Task<MigrationStatusDto> Status()
    {
        await DemandPermission();

        var status = await _migrationCore.GetStatus();

        if (status != null)
        {
            return new MigrationStatusDto
            {
                Progress = status.Percentage,
                Error = status.Exception,
                IsCompleted = status.IsCompleted,
                ParseResult = status.MigrationApiInfo
            };
        }

        return null;
    }

    /// <summary>
    /// 
    /// </summary>
    [HttpPost("cancel")]
    public async Task CancelAsync()
    {
        await DemandPermission();

        await _migrationCore.Stop();
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="info"></param>
    [HttpPost("migrate")]
    public async Task MigrateAsync(MigrationApiInfo info)
    {
        await DemandPermission();

        await _migrationCore.Start(info);
    }

    ///// <summary>
    ///// 
    ///// </summary>
    ///// <returns></returns>
    //[HttpGet("logs")]
    //public async Task LogsAsync()
    //{
    //    await DemandPermission();

    //    var ongoingMigration = GetOngoingMigration();
    //    if (ongoingMigration == null)
    //    {
    //        throw new Exception(MigrationResource.MigrationProgressException);
    //    }

    //    _httpContextAccessor.HttpContext.Response.Headers.Add("Content-Disposition", ContentDispositionUtil.GetHeaderValue("migration.log"));
    //    _httpContextAccessor.HttpContext.Response.ContentType = "text/plain; charset=UTF-8";
    //    await ongoingMigration.Migration.GetLogs().CopyToAsync(_httpContextAccessor.HttpContext.Response.Body);
    //}

    ///// <summary>
    ///// 
    ///// </summary>
    ///// <param name="isSendWelcomeEmail"></param>
    //[HttpPost("finish")]
    //public async Task FinishAsync(bool isSendWelcomeEmail)
    //{
    //    await DemandPermission();

    //    if (isSendWelcomeEmail)
    //    {
    //        var ongoingMigration = GetOngoingMigration();
    //        if (ongoingMigration == null)
    //        {
    //            throw new Exception(MigrationResource.MigrationProgressException);
    //        }
    //        var guidUsers = ongoingMigration.Migration.GetGuidImportedUsers();
    //        foreach (var gu in guidUsers)
    //        {
    //            var u = await _userManager.GetUsersAsync(gu);
    //            await _studioNotifyService.UserInfoActivationAsync(u);
    //        }
    //    }
    //}

    private async Task DemandPermission()
    {
        if (!_coreBaseSettings.Standalone || !await _userManager.IsDocSpaceAdminAsync(_authContext.CurrentAccount.ID))
        {
            throw new SecurityException(Resource.ErrorAccessDenied);
        }
    }
}
