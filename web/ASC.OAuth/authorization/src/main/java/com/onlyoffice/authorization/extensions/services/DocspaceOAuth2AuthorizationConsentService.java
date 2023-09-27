package com.onlyoffice.authorization.extensions.services;

import com.onlyoffice.authorization.configuration.messaging.RabbitMQConfiguration;
import com.onlyoffice.authorization.dto.messages.ConsentMessage;
import com.onlyoffice.authorization.entities.Consent;
import com.onlyoffice.authorization.repositories.ConsentRepository;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Transactional(
        readOnly = true,
        timeout = 2000
)
@Slf4j
public class DocspaceOAuth2AuthorizationConsentService implements OAuth2AuthorizationConsentService {
    private final RabbitMQConfiguration configuration;
    private final ConsentRepository consentRepository;

    private final AmqpTemplate amqpTemplate;

    @RateLimiter(name = "mutateRateLimiter")
    public void save(OAuth2AuthorizationConsent authorizationConsent) {
        Assert.notNull(authorizationConsent, "authorization consent cannot be null");
        log.debug("trying to save consent with client_id {}", authorizationConsent.getRegisteredClientId());
        this.amqpTemplate.convertAndSend(
                configuration.getConsent().getExchange(),
                configuration.getConsent().getRouting(),
                toMessage(authorizationConsent)
        );
    }

    @RateLimiter(name = "mutateRateLimiter")
    public void remove(OAuth2AuthorizationConsent authorizationConsent) {
        Assert.notNull(authorizationConsent, "authorization consent cannot be null");
        log.debug("trying to remove consent with client_id {}", authorizationConsent.getRegisteredClientId());
        var msg = toMessage(authorizationConsent);
        msg.setInvalidated(true);
        this.amqpTemplate.convertAndSend(
                configuration.getConsent().getExchange(),
                configuration.getConsent().getRouting(),
                msg
        );
    }

    @RateLimiter(name = "getRateLimiter", fallbackMethod = "findConsentFallback")
    public OAuth2AuthorizationConsent findById(String registeredClientId, String principalName) {
        log.debug("trying to remove consent with client_id {} and principal name", registeredClientId, principalName);
        Assert.hasText(registeredClientId, "registered client id cannot be empty");
        Assert.hasText(principalName, "principal name cannot be empty");
        return this.consentRepository.findByRegisteredClientIdAndPrincipalName(
                registeredClientId, principalName).map(this::toObject).orElse(null);
    }

    private OAuth2AuthorizationConsent findConsentFallback(String registeredClientId, String principalName, Throwable e) {
        log.warn("Request is blocked due to rate-limiting for client id {} with principal name {}. Reason: {}",
                registeredClientId, principalName, e.getMessage());
        return null;
    }

    private OAuth2AuthorizationConsent toObject(Consent consent) {
        String registeredClientId = consent.getRegisteredClientId();
        OAuth2AuthorizationConsent.Builder builder = OAuth2AuthorizationConsent.withId(
                registeredClientId, consent.getPrincipalName());
        Arrays.stream(consent.getScopes().split(",")).forEach(s -> builder.scope(s));
        return builder.build();
    }

    private ConsentMessage toMessage(OAuth2AuthorizationConsent authorizationConsent) {
        return ConsentMessage
                .builder()
                .registeredClientId(authorizationConsent.getRegisteredClientId())
                .principalName(authorizationConsent.getPrincipalName())
                .scopes(String.join(",", authorizationConsent.getScopes()))
                .modifiedAt(Timestamp.from(Instant.now()))
                .build();
    }
}
