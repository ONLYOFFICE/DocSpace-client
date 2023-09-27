package com.onlyoffice.authorization.api.controllers;

import com.onlyoffice.authorization.api.configuration.ApplicationConfiguration;
import com.onlyoffice.authorization.api.dto.ScopeDTO;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/scopes", headers = {"X-API-Version=1"})
@RequiredArgsConstructor
@Slf4j
public class ScopeController {
    private final ApplicationConfiguration configuration;
    private Set<ScopeDTO> scopes;

    @PostConstruct
    public void init() {
        this.scopes = configuration.getScopes()
                .stream()
                .map(s -> ScopeDTO
                        .builder()
                        .name(s.getName())
                        .description(s.getDescription())
                        .build()
                )
                .collect(Collectors.toSet());
    }

    @GetMapping
    @RateLimiter(name = "getRateLimiter")
    @SneakyThrows
    public ResponseEntity<Iterable<ScopeDTO>> getScopes() {
        log.debug("Received a request to list scopes");
        return ResponseEntity.ok(this.scopes);
    }

    @GetMapping("/{name}")
    @RateLimiter(name = "getRateLimiter")
    @SneakyThrows
    public ResponseEntity<ScopeDTO> getScope(@PathVariable String name) {
        log.debug("Received a get {} scope", name);
        var scope = this.scopes.stream()
                .filter(s -> s.getName().equals(name))
                .findFirst();

        if (scope.isEmpty()) {
            log.error("Scope {} does not exist", name);
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(scope.get());
    }
}
