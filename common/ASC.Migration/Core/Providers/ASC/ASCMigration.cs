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

namespace ASC.Migration.Core.Core.Providers;

[Scope]
public class ASCMigration : AbstractMigration<ASCMigrationInfo, ASCMigratingUser, ASCMigratingFiles>
{
    private string _takeout;
    private string _tmpFolder;
    private readonly IServiceProvider _serviceProvider;
    private readonly MigratorMeta _meta;
    private readonly UserManager _userManager;
    private IDataReadOperator _dataReader;
    public override MigratorMeta Meta => _meta;

    public ASCMigration(MigrationLogger migrationLogger,
        IServiceProvider serviceProvider,
        UserManager userManager) : base(migrationLogger)
    {
        _meta = new("ASC", 5, false);
        _serviceProvider = serviceProvider;
        _userManager = userManager;
    }

    public override void Init(string path, CancellationToken cancellationToken)
    {
        _logger.Init();
        _cancellationToken = cancellationToken;
        var files = Directory.GetFiles(path);
        if (!files.Any() || !files.Any(f => f.EndsWith(".gz")))
        {
            throw new Exception("Folder must not be empty and should contain only .gz files.");
        }
        for (var i = 0; i < files.Length; i++)
        {
            if (files[i].EndsWith(".gz"))
            {
                _takeout = files[i];
            }
        }

        _migrationInfo = new ASCMigrationInfo();
        _migrationInfo.MigratorName = _meta.Name;
        _tmpFolder = path;
        _dataReader = new ZipReadOperator(_takeout, false);
    }
    public override async Task<MigrationApiInfo> Parse(bool reportProgress = true)
    {
        if (reportProgress)
        {
            ReportProgress(0, MigrationResource.StartOfDataProcessing);
        }
        using var stream = _dataReader.GetEntry("databases/core/core_user");
        var data = new DataTable();
        data.ReadXml(stream);
        var progressStep = 100 / data.Rows.Count;
        var i = 1;
        foreach (var row in data.Rows.Cast<DataRow>())
        {
            if (_cancellationToken.IsCancellationRequested)
            {
                if (reportProgress)
                {
                    ReportProgress(100, MigrationResource.MigrationCanceled);
                }
                return null;
            }

            var u = new ASCUser() 
            {
                Id = row["id"].ToString(),
                Info = new UserInfo()
                {
                    UserName = row["email"].ToString().Split('@').First(),
                    FirstName = row["firstname"].ToString(),
                    LastName = row["lastname"].ToString(),
                    ActivationStatus = EmployeeActivationStatus.Pending,
                    Email = row["email"].ToString(),
                }
            };
            if (reportProgress)
            {
                ReportProgress(GetProgress() + progressStep, MigrationResource.DataProcessing + $" {u.Id} ({i++}/{data.Rows.Count})");
            }

            var user = _serviceProvider.GetService<ASCMigratingUser>();
            user.Init(u.Id, u, _tmpFolder, _dataReader, Log);
            user.Parse();
            if ((await _userManager.GetUserByEmailAsync(u.Info.Email)) != ASC.Core.Users.Constants.LostUser)
            {
                _migrationInfo.ExistUsers.Add(u.Id, user);
            }
            else
            {
                _migrationInfo.Users.Add(u.Id, user);
            }
        }
        if (reportProgress)
        {
            ReportProgress(100, MigrationResource.DataProcessingCompleted);
        }
        return _migrationInfo.ToApiInfo();
    }

    public override async Task Migrate(MigrationApiInfo migrationInfo)
    {
        ReportProgress(0, MigrationResource.PreparingForMigration);
        _importedUsers = new List<Guid>();
        _migrationInfo.Merge(migrationInfo);

        var usersForImport = _migrationInfo.Users
            .Where(u => u.Value.ShouldImport)
            .Select(u => u.Value);

        var failedUsers = new List<ASCMigratingUser>();
        var usersCount = usersForImport.Count();
        var progressStep = 25 / usersCount;
        var i = 1;

        foreach (var user in usersForImport)
        {
            if (_cancellationToken.IsCancellationRequested)
            {
                ReportProgress(100, MigrationResource.MigrationCanceled);
                return;
            }
            ReportProgress(GetProgress() + progressStep, string.Format(MigrationResource.UserMigration, user.DisplayName, i++, usersCount));
            try
            {
                var u = migrationInfo.Users.Find(element => element.Key == user.Key);
                user.UserType = u.UserType;

                await user.MigrateAsync();
                _importedUsers.Add(user.Guid);
                await user.MigratingFiles.MigrateAsync();
            }
            catch (Exception ex)
            {
                failedUsers.Add(user);
                Log($"Couldn't migrate user {user.DisplayName} ({user.Email})", ex);
            }
        }
    }

    public override void Dispose()
    {
        base.Dispose();
        if (_dataReader != null)
        {
            _dataReader.Dispose();
        }
    }
}
