package com.onlyoffice.authorization.caching;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import com.onlyoffice.authorization.configuration.caching.authorization.CacheAuthorizationMapConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.stereotype.Component;

/**
 *
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuthorizationCache {
    private final HazelcastInstance hazelcastInstance;

    public OAuth2Authorization put(String key, OAuth2Authorization authorization){
        log.debug("Adding authorization {} to the cache", key);
        IMap<String, OAuth2Authorization> map = hazelcastInstance
                .getMap(CacheAuthorizationMapConfig.AUTHORIZATIONS);
        return map.putIfAbsent(key, authorization);
    }

    public OAuth2Authorization get(String key){
        log.debug("Getting authorization {} from the cache", key);
        IMap<String, OAuth2Authorization> map = hazelcastInstance
                .getMap(CacheAuthorizationMapConfig.AUTHORIZATIONS);
        return map.get(key);
    }

    public void delete(String key) {
        log.debug("Removing authorization {} from the map", key);
        IMap<String, OAuth2Authorization> map = hazelcastInstance
                .getMap(CacheAuthorizationMapConfig.AUTHORIZATIONS);
        map.evict(key);
    }
}
