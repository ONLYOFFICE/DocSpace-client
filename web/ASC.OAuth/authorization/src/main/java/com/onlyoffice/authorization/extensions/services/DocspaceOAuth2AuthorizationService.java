package com.onlyoffice.authorization.extensions.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.onlyoffice.authorization.caching.AuthorizationCache;
import com.onlyoffice.authorization.configuration.messaging.RabbitMQConfiguration;
import com.onlyoffice.authorization.dto.messages.AuthorizationMessage;
import com.onlyoffice.authorization.entities.Authorization;
import com.onlyoffice.authorization.repositories.AuthorizationRepository;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.security.jackson2.SecurityJackson2Modules;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.OAuth2Token;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.jackson2.OAuth2AuthorizationServerJackson2Module;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Transactional(
        readOnly = true,
        timeout = 2000
)
@Slf4j
public class DocspaceOAuth2AuthorizationService implements OAuth2AuthorizationService {
    private final RabbitMQConfiguration configuration;

    private final AuthorizationRepository authorizationRepository;
    private final RegisteredClientRepository registeredClientRepository;

    private final AmqpTemplate amqpTemplate;
    private final AuthorizationCache cache;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        ClassLoader classLoader = DocspaceOAuth2AuthorizationService.class.getClassLoader();
        List<Module> securityModules = SecurityJackson2Modules.getModules(classLoader);
        this.objectMapper.registerModules(securityModules);
        this.objectMapper.registerModule(new OAuth2AuthorizationServerJackson2Module());
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @RateLimiter(name = "mutateRateLimiter")
    public void save(OAuth2Authorization authorization) {
        log.debug("trying to save authorization with id {}", authorization.getId());
        Assert.notNull(authorization, "authorization cannot be null");

        String state = authorization.getAttribute(OAuth2ParameterNames.STATE);
        OAuth2Authorization.Token<OAuth2AuthorizationCode> authorizationCode =
                authorization.getToken(OAuth2AuthorizationCode.class);
        OAuth2Authorization.Token<OAuth2AccessToken> accessToken =
                authorization.getToken(OAuth2AccessToken.class);
        OAuth2Authorization.Token<OAuth2RefreshToken> refreshToken =
                authorization.getToken(OAuth2RefreshToken.class);

        cache.put(authorization.getId(), authorization);
        log.debug("Adding authorization with id {} to the cache", authorization.getId());
        if (state != null && !state.isBlank()) {
            log.debug("Adding authorization with state {} to the cache", state);
            cache.put(state, authorization);
        } else if (authorizationCode != null && authorizationCode.getToken() != null) {
            log.debug("Adding authorization with code {} to the cache", authorizationCode.getToken());
            cache.put(authorizationCode.getToken().getTokenValue(), authorization);
        } else if (accessToken != null && accessToken.getToken() != null) {
            log.debug("Adding authorization with access token {} to the cache", accessToken.getToken().getTokenValue());
            cache.put(accessToken.getToken().getTokenValue(), authorization);
        } else if (refreshToken != null && refreshToken.getToken() != null) {
            log.debug("Adding authorization with refresh token {} to the cache", refreshToken.getToken().getTokenValue());
            cache.put(refreshToken.getToken().getTokenValue(), authorization);
        }

        this.amqpTemplate.convertAndSend(
                configuration.getAuthorization().getExchange(),
                configuration.getAuthorization().getRouting(),
                toMessage(authorization)
        );
    }

    @RateLimiter(name = "mutateRateLimiter")
    public void remove(OAuth2Authorization authorization) {
        log.debug("trying to remove authorization with id {}", authorization.getId());
        Assert.notNull(authorization, "authorization cannot be null");

        String state = authorization.getAttribute(OAuth2ParameterNames.STATE);
        OAuth2Authorization.Token<OAuth2AuthorizationCode> authorizationCode =
                authorization.getToken(OAuth2AuthorizationCode.class);
        OAuth2Authorization.Token<OAuth2AccessToken> accessToken =
                authorization.getToken(OAuth2AccessToken.class);
        OAuth2Authorization.Token<OAuth2RefreshToken> refreshToken =
                authorization.getToken(OAuth2RefreshToken.class);

        cache.delete(authorization.getId());
        log.debug("Deleting authorization with id {} from the cache", authorization.getId());
        if (state != null && !state.isBlank()) {
            log.debug("Deleting authorization with state {} from the cache", state);
            cache.delete(state);
        } else if (authorizationCode != null && authorizationCode.getToken() != null) {
            log.debug("Deleting authorization with code {} from the cache", authorizationCode.getToken().getTokenValue());
            cache.delete(authorizationCode.getToken().getTokenValue());
        } else if (accessToken != null && accessToken.getToken() != null) {
            log.debug("Deleting authorization with access token {} from the cache", accessToken.getToken().getTokenValue());
            cache.delete(accessToken.getToken().getTokenValue());
        } else if (refreshToken != null && refreshToken.getToken() != null) {
            log.debug("Deleting authorization with refresh token {} from the cache", refreshToken.getToken().getTokenValue());
            cache.delete(refreshToken.getToken().getTokenValue());
        }

        var msg = toMessage(authorization);
        msg.setAccessTokenValue("***");
        msg.setRefreshTokenValue("***");
        msg.setInvalidated(true);

        this.amqpTemplate.convertSendAndReceive(
                configuration.getAuthorization().getExchange(),
                configuration.getAuthorization().getRouting(),
                msg
        );
    }

    @RateLimiter(name = "getRateLimiter", fallbackMethod = "findAuthorizationFallback")
    public OAuth2Authorization findById(String id) {
        log.debug("trying to find authorization with id {}", id);
        Assert.hasText(id, "id cannot be empty");

        var authorization = this.cache.get(id);
        if (authorization != null) {
            log.debug("found authorization with id {} in the cache", id);
            this.cache.delete(authorization.getId());
            log.debug("authorization with id {} has been removed from the cache", authorization.getId());
            return authorization;
        }

        return this.authorizationRepository.findById(id).map(this::toObject).orElse(null);
    }

    private OAuth2Authorization findAuthorizationFallback(String id, Throwable e) {
        log.warn("Request is blocked due to rate-limiting. Authorization id {}. Reason: {}",
                id, e.getMessage());
        return null;
    }

    @RateLimiter(name = "getRateLimiter", fallbackMethod = "findAuthorizationByTokenFallback")
    public OAuth2Authorization findByToken(String token, OAuth2TokenType tokenType) {
        log.debug("trying to find authorization with token {}", token);
        Assert.hasText(token, "token cannot be empty");

        var authorization = this.cache.get(token);
        if (authorization != null) {
            log.debug("found authorization with token {} in the cache", token);
            this.cache.delete(authorization.getId());
            log.debug("authorization with token {} has been removed from the cache", token);
            return authorization;
        }

        Optional<Authorization> result;
        if (tokenType == null) {
            log.debug("trying to find authorization by any value");
            result = this.authorizationRepository.findByStateOrAuthorizationCodeValueOrAccessTokenValueOrRefreshTokenValue(token);
        } else if (OAuth2ParameterNames.STATE.equals(tokenType.getValue())) {
            log.debug("trying to find authorization by state");
            result = this.authorizationRepository.findByState(token);
        } else if (OAuth2ParameterNames.CODE.equals(tokenType.getValue())) {
            log.debug("trying to find authorization by authorization code");
            result = this.authorizationRepository.findByAuthorizationCodeValue(token);
        } else if (OAuth2ParameterNames.ACCESS_TOKEN.equals(tokenType.getValue())) {
            log.debug("trying to find authorization by access token");
            result = this.authorizationRepository.findByAccessTokenValue(token);
        } else if (OAuth2ParameterNames.REFRESH_TOKEN.equals(tokenType.getValue())) {
            log.debug("trying to find authorization by refresh token");
            result = this.authorizationRepository.findByRefreshTokenValue(token);
        } else {
            log.debug("empty authorization");
            result = Optional.empty();
        }

        return result.map(this::toObject).orElse(null);
    }

    private OAuth2Authorization findAuthorizationByTokenFallback(String token, OAuth2TokenType tokenType, Throwable e) {
        log.warn("Request is blocked due to rate-limiting. Authorization token {} with type {}. Reason: {}",
                token, tokenType.getValue(), e.getMessage());
        return null;
    }

    private OAuth2Authorization toObject(Authorization entity) {
        RegisteredClient registeredClient = this.registeredClientRepository.findById(entity.getRegisteredClientId());
        if (registeredClient == null) {
            throw new DataRetrievalFailureException(
                    "the registered client with id '" + entity.getRegisteredClientId() + "' was not found in the registered client repository.");
        }

        OAuth2Authorization.Builder builder = OAuth2Authorization.withRegisteredClient(registeredClient)
                .id(entity.getId())
                .principalName(entity.getPrincipalName())
                .authorizationGrantType(resolveAuthorizationGrantType(entity.getAuthorizationGrantType()))
                .authorizedScopes(StringUtils.commaDelimitedListToSet(entity.getAuthorizedScopes()))
                .attributes(attributes -> attributes.putAll(parseMap(entity.getAttributes())));
        if (entity.getState() != null) {
            builder.attribute(OAuth2ParameterNames.STATE, entity.getState());
        }

        if (entity.getAuthorizationCodeValue() != null) {
            OAuth2AuthorizationCode authorizationCode = new OAuth2AuthorizationCode(
                    entity.getAuthorizationCodeValue(),
                    entity.getAuthorizationCodeIssuedAt().toInstant(),
                    entity.getAuthorizationCodeExpiresAt().toInstant());
            builder.token(authorizationCode, metadata -> metadata.putAll(parseMap(entity.getAuthorizationCodeMetadata())));
        }

        if (entity.getAccessTokenValue() != null) {
            OAuth2AccessToken accessToken = new OAuth2AccessToken(
                    OAuth2AccessToken.TokenType.BEARER,
                    entity.getAccessTokenValue(),
                    entity.getAccessTokenIssuedAt().toInstant(),
                    entity.getAccessTokenExpiresAt().toInstant(),
                    StringUtils.commaDelimitedListToSet(entity.getAccessTokenScopes()));
            builder.token(accessToken, metadata -> metadata.putAll(parseMap(entity.getAccessTokenMetadata())));
        }

        if (entity.getRefreshTokenValue() != null) {
            OAuth2RefreshToken refreshToken = new OAuth2RefreshToken(
                    entity.getRefreshTokenValue(),
                    entity.getRefreshTokenIssuedAt().toInstant(),
                    entity.getRefreshTokenExpiresAt().toInstant());
            builder.token(refreshToken, metadata -> metadata.putAll(parseMap(entity.getRefreshTokenMetadata())));
        }

        return builder.build();
    }

    private AuthorizationMessage toMessage(OAuth2Authorization authorization) {
        AuthorizationMessage message = AuthorizationMessage
                .builder()
                .id(authorization.getId())
                .registeredClientId(authorization.getRegisteredClientId())
                .principalName(authorization.getPrincipalName())
                .authorizationGrantType(authorization.getAuthorizationGrantType().getValue())
                .authorizedScopes(StringUtils.collectionToDelimitedString(authorization.getAuthorizedScopes(), ","))
                .attributes(writeMap(authorization.getAttributes()))
                .state(authorization.getAttribute(OAuth2ParameterNames.STATE))
                .build();

        OAuth2Authorization.Token<OAuth2AuthorizationCode> authorizationCode =
                authorization.getToken(OAuth2AuthorizationCode.class);
        setTokenValues(
                authorizationCode,
                message::setAuthorizationCodeValue,
                message::setAuthorizationCodeIssuedAt,
                message::setAuthorizationCodeExpiresAt,
                message::setAuthorizationCodeMetadata
        );

        OAuth2Authorization.Token<OAuth2AccessToken> accessToken =
                authorization.getToken(OAuth2AccessToken.class);
        setTokenValues(
                accessToken,
                message::setAccessTokenValue,
                message::setAccessTokenIssuedAt,
                message::setAccessTokenExpiresAt,
                message::setAccessTokenMetadata
        );

        if (accessToken != null && accessToken.getToken().getScopes() != null) {
            message.setAccessTokenScopes(StringUtils.collectionToDelimitedString(accessToken.getToken().getScopes(), ","));
        }

        OAuth2Authorization.Token<OAuth2RefreshToken> refreshToken =
                authorization.getToken(OAuth2RefreshToken.class);

        setTokenValues(
                refreshToken,
                message::setRefreshTokenValue,
                message::setRefreshTokenIssuedAt,
                message::setRefreshTokenExpiresAt,
                message::setRefreshTokenMetadata
        );

        return message;
    }

    private void setTokenValues(
            OAuth2Authorization.Token<?> token,
            Consumer<String> tokenValueConsumer,
            Consumer<Date> issuedAtConsumer,
            Consumer<Date> expiresAtConsumer,
            Consumer<String> metadataConsumer) {
        if (token != null) {
            OAuth2Token oAuth2Token = token.getToken();
            tokenValueConsumer.accept(oAuth2Token.getTokenValue());
            issuedAtConsumer.accept(Date.from(oAuth2Token.getIssuedAt()));
            expiresAtConsumer.accept(Date.from(oAuth2Token.getExpiresAt()));
            metadataConsumer.accept(writeMap(token.getMetadata()));
        }
    }

    private Map<String, Object> parseMap(String data) {
        try {
            return this.objectMapper.readValue(data, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception ex) {
            throw new IllegalArgumentException(ex.getMessage(), ex);
        }
    }

    private String writeMap(Map<String, Object> metadata) {
        try {
            return this.objectMapper.writeValueAsString(metadata);
        } catch (Exception ex) {
            throw new IllegalArgumentException(ex.getMessage(), ex);
        }
    }

    private static AuthorizationGrantType resolveAuthorizationGrantType(String authorizationGrantType) {
        if (AuthorizationGrantType.AUTHORIZATION_CODE.getValue().equals(authorizationGrantType)) {
            return AuthorizationGrantType.AUTHORIZATION_CODE;
        } else if (AuthorizationGrantType.CLIENT_CREDENTIALS.getValue().equals(authorizationGrantType)) {
            return AuthorizationGrantType.CLIENT_CREDENTIALS;
        } else if (AuthorizationGrantType.REFRESH_TOKEN.getValue().equals(authorizationGrantType)) {
            return AuthorizationGrantType.REFRESH_TOKEN;
        }
        return new AuthorizationGrantType(authorizationGrantType);
    }
}
