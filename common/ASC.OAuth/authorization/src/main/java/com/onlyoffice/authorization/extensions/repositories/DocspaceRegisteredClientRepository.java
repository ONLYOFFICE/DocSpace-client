package com.onlyoffice.authorization.extensions.repositories;

import com.onlyoffice.authorization.configuration.RegisteredClientConfiguration;
import com.onlyoffice.authorization.entities.Client;
import com.onlyoffice.authorization.exceptions.ClientNotFoundException;
import com.onlyoffice.authorization.exceptions.ReadOnlyOperationException;
import com.onlyoffice.authorization.repositories.ClientRepository;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.Duration;
import java.util.Arrays;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Transactional(
        readOnly = true,
        timeout = 2000
)
@Slf4j
public class DocspaceRegisteredClientRepository implements RegisteredClientRepository {
    private final RegisteredClientConfiguration configuration;
    private final ClientRepository clientRepository;

    public void save(RegisteredClient registeredClient) {
        throw new ReadOnlyOperationException("Docspace registered client repository supports only read operations");
    }

    @RateLimiter(name = "getRateLimiter", fallbackMethod = "findClientFallback")
    public RegisteredClient findById(String id) {
        log.debug("trying to find client with id {}", id);
        Assert.hasText(id, "id cannot be empty");
        try {
            return toObject(clientRepository.findById(id)
                    .orElseThrow(() -> new ClientNotFoundException(String
                            .format("could not find client with id %s", id))
                    ));
        } catch (ClientNotFoundException e) {
            log.error(e.getMessage());
            return null;
        }
    }

    @RateLimiter(name = "getRateLimiter", fallbackMethod = "findClientFallback")
    public RegisteredClient findByClientId(String clientId) {
        log.debug("trying to find client with client_id {}", clientId);
        Assert.hasText(clientId, "client_id cannot be empty");
        try {
            return toObject(clientRepository.findClientByClientId(clientId)
                    .orElseThrow(() -> new ClientNotFoundException(String
                            .format("could not find client with client_id %s", clientId))));
        } catch (ClientNotFoundException e) {
            log.error(e.getMessage());
            return null;
        }
    }

    private RegisteredClient findClientFallback(String id, Throwable e) {
        log.warn("Request is blocked due to rate-limiting for client with id/client_id {}. {}", id, e.getMessage());
        return null;
    }

    private RegisteredClient toObject(Client client) {
        return RegisteredClient.withId(client.getClientId())
                .clientId(client.getClientId())
                .clientIdIssuedAt(client.getClientIssuedAt())
                .clientSecret(client.getClientSecret())
                .clientName(client.getClientName())
                .clientAuthenticationMethod(client.getClientAuthenticationMethod()
                        .equals("client_secret_post") ?
                        ClientAuthenticationMethod.CLIENT_SECRET_POST :
                        ClientAuthenticationMethod.CLIENT_SECRET_JWT
                )
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUris((uris) -> uris.add(client.getRedirectUri()))
                .scopes((scopes) -> scopes.addAll(Arrays.stream(client
                        .getScopes().split(","))
                        .collect(Collectors.toSet()))
                )
                .clientSettings(ClientSettings
                        .builder()
                        .requireProofKey(true)
                        .requireAuthorizationConsent(true)
                        .build()
                )
                .tokenSettings(TokenSettings
                        .builder()
                        .accessTokenTimeToLive(Duration
                                .ofMinutes(configuration.getAccessTokenMinutesTTL())
                        )
                        .refreshTokenTimeToLive(Duration
                                .ofDays(configuration.getRefreshTokenDaysTTL())
                        )
                        .authorizationCodeTimeToLive(Duration
                                .ofMinutes(configuration.getAuthorizationCodeMinutesTTL())
                        )
                        .reuseRefreshTokens(false)
                        .build()
                )
                .build();
    }
}
