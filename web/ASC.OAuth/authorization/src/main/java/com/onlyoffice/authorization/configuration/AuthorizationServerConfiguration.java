package com.onlyoffice.authorization.configuration;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.onlyoffice.authorization.extensions.filters.CookieCsrfFilter;
import com.onlyoffice.authorization.extensions.filters.SimpleCORSFilter;
import com.onlyoffice.authorization.extensions.jwks.JwksKeyPairGenerator;
import com.onlyoffice.authorization.extensions.providers.DocspaceAuthenticationProvider;
import jakarta.servlet.RequestDispatcher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import java.security.NoSuchAlgorithmException;

@Configuration
@RequiredArgsConstructor
public class AuthorizationServerConfiguration {
    @Autowired
    @Qualifier("ec")
    private JwksKeyPairGenerator generator;
    private final DocspaceAuthenticationProvider authenticationProvider;
    private final ApplicationConfiguration applicationConfiguration;

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);

        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .authorizationEndpoint(e -> {
                    e.consentPage("/oauth2/consent");
                    e.authenticationProvider(authenticationProvider);
                });

        http.exceptionHandling(e -> e.defaultAuthenticationEntryPointFor((request, response, authException) -> {
            RequestDispatcher dispatcher = request.getRequestDispatcher(applicationConfiguration.getLogin());
            dispatcher.forward(request, response);
        }, new AntPathRequestMatcher(applicationConfiguration.getLogin())));

        http.csrf(c -> {
            c.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
            c.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler());
        });
        http.addFilterAfter(new CookieCsrfFilter(), BasicAuthenticationFilter.class);
        http.addFilterAfter(new SimpleCORSFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer(applicationConfiguration.getUrl())
                .build();
    }

    @Bean
    public ClientSettings clientSettings() {
        return ClientSettings.builder()
                .requireAuthorizationConsent(true)
                .requireProofKey(true)
                .build();
    }

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() throws NoSuchAlgorithmException {
        JWKSet jwkSet = new JWKSet(generator.generateKey());
        return (jwkSelector, securityContext) -> jwkSelector.select(jwkSet);
    }

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer() {
        return context -> context
                .getJwsHeader()
                .algorithm(SignatureAlgorithm.ES256);
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }
}
