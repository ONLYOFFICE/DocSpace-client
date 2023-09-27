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

namespace ASC.Files.Core.HttpHandlers;
public class ChunkedUploadAsyncHandler
{
    public ChunkedUploadAsyncHandler(RequestDelegate next)
    {
    }

    public async Task Invoke(HttpContext context, ChunkedUploadAsyncHandlerService handlerService)
    {
        await handlerService.Invoke(context);
    }
}

[Scope]
public class ChunkedUploadAsyncHandlerService
{
    private readonly TenantManager _tenantManager;
    private readonly FileUploader _fileUploader;
    private readonly FilesMessageService _filesMessageService;
    private readonly SetupInfo _setupInfo;
    private readonly SocketManager _socketManager;
    private readonly FileDtoHelper _filesWrapperHelper;
    private readonly ILogger<ChunkedUploaderHandlerService> _logger;
    private readonly AuthContext _authContext;
    private readonly StorageFactory _storageFactory;
    private readonly ICache _cache;
    private readonly MaxTotalSizeStatistic _maxTotalSizeStatistic;
    private readonly FilesSettingsHelper _filesSettingsHelper;

    public ChunkedUploadAsyncHandlerService(
        ILogger<ChunkedUploaderHandlerService> logger,
        TenantManager tenantManager,
        FileUploader fileUploader,
        FilesMessageService filesMessageService,
        SetupInfo setupInfo,
        SocketManager socketManager,
        FileDtoHelper filesWrapperHelper,
        AuthContext authContext,
        StorageFactory storageFactory,
        ICache cache,
        MaxTotalSizeStatistic maxTotalSizeStatistic,
        FilesSettingsHelper filesSettingsHelper)
    {
        _tenantManager = tenantManager;
        _fileUploader = fileUploader;
        _filesMessageService = filesMessageService;
        _setupInfo = setupInfo;
        _socketManager = socketManager;
        _filesWrapperHelper = filesWrapperHelper;
        _logger = logger;
        _authContext = authContext;
        _storageFactory = storageFactory;
        _cache = cache;
        _maxTotalSizeStatistic = maxTotalSizeStatistic;
        _filesSettingsHelper = filesSettingsHelper;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await Invoke<int>(context);
        }
        catch (Exception)
        {
            await Invoke<string>(context);
        }
    }

    public async Task Invoke<T>(HttpContext context)
    {
        try
        {
            if (context.Request.Method == "OPTIONS")
            {
                context.Response.StatusCode = 200;

                return;
            }

            var request = new ChunkedRequestHelper<T>(context.Request);
            var tenantId = await _tenantManager.GetCurrentTenantIdAsync();
            var store = await _storageFactory.GetStorageAsync(tenantId, FileConstant.StorageModule, (IQuotaController)null);
            if (!_authContext.IsAuthenticated)
            {
                await WriteError(context, "Not authorized or session with specified upload id already expired");

                return;
            }

            if ((await _tenantManager.GetCurrentTenantAsync()).Status != TenantStatus.Active)
            {
                await WriteError(context, "Can't perform upload for deleted or transfering portals");

                return;
            }

            switch (request.TypeForAsync())
            {
                case ChunkedRequestType.Abort:
                    {
                        var info = _cache.Get<UploadInfo<T>>(request.UploadId);
                        if (info == null)
                        {
                            await WriteError(context, $"UploadId {request.UploadId} is not found");
                        }
                        await store.DeleteDirectoryAsync(FileConstant.StorageDomainTmp, request.UploadId);
                        _cache.Remove(request.UploadId);
                        await WriteSuccess(context, null);
                        return;
                    }
                case ChunkedRequestType.Initiate:
                    {
                        var max = await _setupInfo.MaxChunkedUploadSize(_tenantManager, _maxTotalSizeStatistic);
                        if (request.FileSize > max)
                        {
                            await WriteError(context, FileSizeComment.GetFileSizeException(max).Message);
                            return;
                        }

                        var file = await _fileUploader.VerifyChunkedUploadAsync(request.FolderId, request.FileName, request.FileSize, _filesSettingsHelper.UpdateIfExist, request.RelativePath);
                        var info = new UploadInfo<T>
                        {
                            Uid = Guid.NewGuid(),
                            FileId = file.Id,
                            Title = request.FileName,
                            FolderId = request.FolderId,
                            FileSize = request.FileSize,
                            Encrypted = request.Encrypted,
                            UploadedChunks = new HashSet<int>()

                        };
                        _cache.Insert(info.Uid.ToString(), info, TimeSpan.FromMinutes(10));

                        await WriteSuccess(context, info);
                        return;
                    }
                case ChunkedRequestType.Upload:
                    {
                        var info = _cache.Get<UploadInfo<T>>(request.UploadId);
                        if (info == null)
                        {
                            await WriteError(context, $"UploadId {request.UploadId} is not found");
                            return;
                        }

                        info.UploadedChunks.Add(request.ChunkNumber);

                        _cache.Insert(info.Uid.ToString(), info, TimeSpan.FromMinutes(10));

                        await store.SaveAsync(FileConstant.StorageDomainTmp, Path.Combine(request.UploadId, request.ChunkNumber.ToString()), request.ChunkStream);
                        
                        await WriteSuccess(context, info);
                        return;
                    }
                case ChunkedRequestType.Finish:
                    {
                        var info = _cache.Get<UploadInfo<T>>(request.UploadId);
                        if (info == null)
                        {
                            await WriteError(context, $"UploadId {request.UploadId} is not found");
                            return;
                        }
                        var createdSession = await _fileUploader.InitiateUploadAsync(info.FolderId, info.FileId, info.Title, info.FileSize, info.Encrypted);

                        var sortChunks = info.UploadedChunks.Order();
                        ChunkedUploadSession<T> resumedSession = null;
                        foreach (var chunk in sortChunks)
                        {
                            using var stream = await store.GetReadStreamAsync(FileConstant.StorageDomainTmp, Path.Combine(request.UploadId, chunk.ToString()));
                            resumedSession = await _fileUploader.UploadChunkAsync<T>(createdSession.Id, stream, stream.Length);
                            if(resumedSession.Id != default)
                            {
                                break;
                            }
                        }
                        await store.DeleteDirectoryAsync(FileConstant.StorageDomainTmp, request.UploadId);
                        _cache.Remove(request.UploadId);

                        await WriteSuccess(context, await ToResponseObject(resumedSession.File), (int)HttpStatusCode.Created);
                        _ = _filesMessageService.SendAsync(MessageAction.FileUploaded, resumedSession.File, resumedSession.File.Title);
                        await _socketManager.CreateFileAsync(resumedSession.File);
                        return;
                    }
                default:
                    await WriteError(context, "Unknown request type.");
                    return;
            }
        }
        catch (FileNotFoundException error)
        {
            _logger.ErrorChunkedUploaderHandlerService(error);
            await WriteError(context, FilesCommonResource.ErrorMassage_FileNotFound);
        }
        catch (Exception error)
        {
            _logger.ErrorChunkedUploaderHandlerService(error);
            await WriteError(context, error.Message);
        }
    }

    private static Task WriteError(HttpContext context, string message)
    {
        return WriteResponse(context, false, null, message, (int)HttpStatusCode.OK);
    }

    private static Task WriteSuccess(HttpContext context, object data, int statusCode = (int)HttpStatusCode.OK)
    {
        return WriteResponse(context, true, data, string.Empty, statusCode);
    }

    private static Task WriteResponse(HttpContext context, bool success, object data, string message, int statusCode)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        return context.Response.WriteAsync(JsonSerializer.Serialize(new { success, data, message }, new JsonSerializerOptions()
        {
            WriteIndented = false,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingDefault,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }

    private async Task<object> ToResponseObject<T>(File<T> file)
    {
        return new
        {
            id = file.Id,
            folderId = file.ParentId,
            version = file.Version,
            title = file.Title,
            provider_key = file.ProviderKey,
            uploaded = true,
            file = await _filesWrapperHelper.GetAsync(file)
        };
    }
}

internal class UploadInfo<T>
{
    public Guid Uid { get; set; }
    public T FileId { get; set; }
    public string Title { get; set; }
    public T FolderId { get; set; }
    public long FileSize { get; set; }
    public bool Encrypted { get; set; }
    public HashSet<int> UploadedChunks { get; set; }
}

public static class ChunkedUploadAsyncHandlerExtention
{
    public static IApplicationBuilder UseChunkedUploadAsyncHandler(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ChunkedUploadAsyncHandler>();
    }
}
