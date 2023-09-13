package com.onlyoffice.authorization.extensions.providers;

import com.onlyoffice.authorization.configuration.DocspaceConfiguration;
import com.onlyoffice.authorization.dto.UsernamePasswordCredentials;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocspaceAuthenticationProvider implements AuthenticationProvider {
    private final DocspaceConfiguration docspaceConfiguration;
    private final RestTemplate restTemplate;

    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        log.debug("trying to authenticate a docspace user {}", authentication.getPrincipal().toString());
        UsernamePasswordAuthenticationToken a = (UsernamePasswordAuthenticationToken) authentication;
        if (isDocspaceAuthenticated(a.getPrincipal().toString(), a.getCredentials().toString())) {
            return new UsernamePasswordAuthenticationToken(a.getPrincipal(), a.getCredentials(), null);
        }

        throw new BadCredentialsException("invalid username or password");
    }

    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.equals(authentication);
    }

    @Bulkhead(name = "docspaceBulkhead", fallbackMethod = "docspaceAuthenticatedFallback")
    private boolean isDocspaceAuthenticated(String username, String password) {
        try {
            log.debug("trying to authenticate user with name {} and password {}", username, password);
            return restTemplate.postForEntity(
                    String.format("%s/api/2.0/authentication", docspaceConfiguration.getUrl()),
                    UsernamePasswordCredentials
                            .builder()
                            .username(username)
                            .password(password)
                            .build(),
                    Object.class
            ).getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("could not authenticate a docspace user: {}", e.getMessage());
            return false;
        }
    }

    private boolean isDocspaceAuthenticated(String username, String password, Throwable e) {
        log.warn("Number of concurrent calls to Docpsace API has been reached: {}", e.getMessage());
        return false;
    }
}