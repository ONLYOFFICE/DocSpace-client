package com.onlyoffice.authorization.repositories;

import com.onlyoffice.authorization.entities.Authorization;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AuthorizationRepository extends Repository<Authorization, String> {
    Optional<Authorization> findById(String id);
    Optional<Authorization> findByState(String state);
    Optional<Authorization> findByAuthorizationCodeValue(String authorizationCode);
    Optional<Authorization> findByAccessTokenValue(String accessToken);
    Optional<Authorization> findByRefreshTokenValue(String refreshToken);
    @Query("SELECT a FROM Authorization a WHERE a.state = :token" +
            " OR a.authorizationCodeValue = :token" +
            " OR a.accessTokenValue = :token" +
            " OR a.refreshTokenValue = :token"
    )
    Optional<Authorization> findByStateOrAuthorizationCodeValueOrAccessTokenValueOrRefreshTokenValue(@Param("token") String token);
}
