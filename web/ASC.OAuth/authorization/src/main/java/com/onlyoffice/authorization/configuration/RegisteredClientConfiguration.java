package com.onlyoffice.authorization.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "registered.client")
@Getter
@Setter
public class RegisteredClientConfiguration {
    private int accessTokenMinutesTTL = 60;
    private int refreshTokenDaysTTL = 365;
    private int authorizationCodeMinutesTTL = 1;
}
