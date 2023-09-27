package com.onlyoffice.authorization.dto;

import lombok.Builder;
import lombok.Data;

/**
 *
 */
@Data
@Builder
public class UsernamePasswordCredentials {
    private String username;
    private String password;
}
