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

using System.Collections.Specialized;

using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace ASC.Api.Core.Auth;

public static class AuthorizationExtension
{
    private static readonly NameValueCollection _scopesMap = new NameValueCollection()
    {
        { "GET api/[0-9].[0-9]/files/rooms", "rooms:read,rooms:write" },
        { "(POST|PUT|DELETE|UPDATE) api/[0-9].[0-9]/files/rooms", "rooms:write" },
        { "GET api/[0-9].[0-9]/files", "files:read,files:write" },
        { "(POST|PUT|DELETE|UPDATE) api/[0-9].[0-9]/files", "files:write" },
        { "GET api/[0-9].[0-9]/people/@self", "account.self:read,account.self:write" },
        { "(POST|PUT|DELETE|UPDATE) api/[0-9].[0-9]/people/@self", "account.self:write" },
        { "GET api/[0-9].[0-9]/people", "accounts:read,accounts:write" },
        { "(POST|PUT|DELETE|UPDATE) api/[0-9].[0-9]/people", "accounts:write" },
    };

    private static readonly string[] _allScopes = new[] {
    "files:read",
    "files:write",
    "rooms:read",
    "rooms:write",
    "account.self:read",
    "account.self:write",
    "accounts:read",
    "accounts:write" };

    private static string GetAuthorizePolicy(string routePattern, string httpMethod)
    {
        foreach (var regexPattern in _scopesMap.AllKeys)
        {
            var regex = new Regex(regexPattern);

            if (!regex.IsMatch($"{httpMethod} {routePattern}")) continue;

            var scopes = _scopesMap[regexPattern];

            return scopes;
        }

        return null;
    }

    public static IServiceCollection AddJwtBearerAuthentication(this IServiceCollection services)
    {
        services.AddSingleton<IAuthorizationHandler, ScopesAuthorizationHandler>();
        services.AddSingleton<IAuthorizationPolicyProvider, AuthorizationPolicyProvider>();

        services.AddAuthentication()
                          .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
                          {
#if DEBUG

                              options.IncludeErrorDetails = true;
#endif
                              options.Configuration = new OpenIdConnectConfiguration();

                              IdentityModelEventSource.ShowPII = true;
                              options.MapInboundClaims = false;

                              options.TokenValidationParameters.RoleClaimType = "role";
                              options.TokenValidationParameters.NameClaimType = "name";

                              options.TokenValidationParameters = new TokenValidationParameters
                              {
                                  // Clock skew compensates for server time drift.
                                  // We recommend 5 minutes or less:
                                  ClockSkew = TimeSpan.FromMinutes(5),
                                  // Specify the key used to sign the token:
                                  //   IssuerSigningKey = signingKey,
                                  RequireSignedTokens = false,
                                  RequireAudience = false,
                                  // Ensure the token hasn't expired:
                                  RequireExpirationTime = false,
                                  ValidateLifetime = false,
                                  // Ensure the token audience matches our audience value (default true):
                                  ValidateAudience = false,
                                  ValidAudience = "4testing",
                                  // Ensure the token was issued by a trusted authorization server (default true):
                                  ValidateIssuer = false,
                                  //  ValidIssuer = "https://{yourOktaDomain}/oauth2/default",
                                  ValidateIssuerSigningKey = false,
                                  SignatureValidator = delegate (string token, TokenValidationParameters parameters)
                                  {
                                      var jwt = new JwtSecurityToken(token);

                                      return jwt;
                                  }
                              };

                              options.Events = new JwtBearerEvents
                              {                                  
                                  OnTokenValidated = async ctx =>
                                  {
                                      using var scope = ctx.HttpContext.RequestServices.CreateScope();

                                      var securityContext = scope.ServiceProvider.GetService<ASC.Core.SecurityContext>();

                                      var logger = scope.ServiceProvider.GetService<ILogger<BaseStartup>>();

                                      logger.DebugOnTokenValidatedCallback();

                                      if (ctx?.Principal != null)
                                      {
                                          foreach (var claim in ctx.Principal.Claims)
                                          {
                                              logger.DebugOnTokenValidatedCallback(claim.Type, claim.Value);
                                          }
                                      }

                                      var claimSid = ctx.Principal.Claims.FirstOrDefault(x => x.Type == "userId");

                                      if (claimSid == null || !Guid.TryParse(claimSid.Value, out var userId))
                                      {
                                          throw new AuthenticationException($"Claim 'Sid' is not present in JWT");
                                      }

                                      await securityContext.AuthenticateMeWithoutCookieAsync(userId, ctx.Principal.Claims.ToList());
                                  },
                                  OnMessageReceived = msg =>
                                  {
                                      using var scope = msg?.HttpContext.RequestServices.CreateScope();

                                      var logger = scope?.ServiceProvider.GetService<ILogger<BaseStartup>>();

                                      var token = msg?.Request.Headers.Authorization.ToString();
                                      string path = msg?.Request.Path ?? "";

                                      logger.DebugOnMessageReceivedCallback(path);

                                      if (!string.IsNullOrEmpty(token))
                                      {
                                          logger.DebugOnMessageReceivedCallbackAccessToken(token);
                                      }
                                      else
                                      {
                                          logger.DebugOnMessageReceivedCallbackNoAccessToken();
                                      }

                                      return Task.CompletedTask;
                                  }
                              };
                          });


        return services;

    }

    public static TBuilder WithRequirementAuthorization<TBuilder>(this TBuilder builder) where TBuilder : IEndpointConventionBuilder
    {
        builder.Add(endpointBuilder =>
        {
            var httpMethodMetadata = endpointBuilder.Metadata.OfType<HttpMethodMetadata>().FirstOrDefault();
            var authorizeAttribute = endpointBuilder.Metadata.OfType<AuthorizeAttribute>().FirstOrDefault();
            var httpMethod = httpMethodMetadata?.HttpMethods.FirstOrDefault();

            var authorizePolicy = GetAuthorizePolicy(((RouteEndpointBuilder)endpointBuilder).RoutePattern.RawText, httpMethod);

            if (authorizeAttribute == null && authorizePolicy != null)
            {
                authorizeAttribute = new AuthorizeAttribute(authorizePolicy);

                endpointBuilder.Metadata.Add(authorizeAttribute);
            }
        });

        return builder;
    }
}
