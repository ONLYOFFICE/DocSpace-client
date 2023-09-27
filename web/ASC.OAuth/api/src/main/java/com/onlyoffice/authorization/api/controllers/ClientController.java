package com.onlyoffice.authorization.api.controllers;

import com.onlyoffice.authorization.api.configuration.ApplicationConfiguration;
import com.onlyoffice.authorization.api.configuration.messaging.RabbitMQConfiguration;
import com.onlyoffice.authorization.api.dto.ClientDTO;
import com.onlyoffice.authorization.api.dto.PaginationDTO;
import com.onlyoffice.authorization.api.dto.RegenerateDTO;
import com.onlyoffice.authorization.api.services.ClientService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(value = "/api/clients", headers = {"X-API-Version=1"})
@RequiredArgsConstructor
@Slf4j
public class ClientController {
    private final int MAX_LIMIT_PER_PAGE = 20;
    private List<String> allowedScopes = new ArrayList<>();

    private final ApplicationConfiguration applicationConfiguration;
    private final RabbitMQConfiguration configuration;
    private final ClientService clientService;
    private final AmqpTemplate amqpTemplate;

    @PostConstruct
    public void init() {
        this.allowedScopes = applicationConfiguration.getScopes().stream().map(s -> s.getName())
                .collect(Collectors.toList());
    }

    @GetMapping
    @RateLimiter(name = "getRateLimiter")
    public ResponseEntity<PaginationDTO<ClientDTO>> getClients(
            HttpServletResponse response,
            @RequestHeader(value = "X-Tenant") int tenant,
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit
    ) {
        if (limit > MAX_LIMIT_PER_PAGE)
            limit = MAX_LIMIT_PER_PAGE;

        log.debug("Received a new get clients request for tenant {} with page {} and limit", tenant, page, limit);

        PaginationDTO<ClientDTO> pagination = clientService.getTenantClients(tenant, page, limit);
        for (final ClientDTO client : pagination.getData()) {
            client.add(linkTo(methodOn(ClientController.class)
                    .getClient(null, tenant, client.getClientId()))
                    .withRel(HttpMethod.GET.name())
                    .withMedia(MediaType.APPLICATION_JSON_VALUE)
                    .withTitle("get_client")
                    .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
            client.add(linkTo(methodOn(ClientController.class)
                    .updateClient(response, tenant, client.getClientId(), null))
                    .withRel(HttpMethod.PUT.name())
                    .withMedia(MediaType.APPLICATION_JSON_VALUE)
                    .withTitle("update_client")
                    .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
            client.add(linkTo(methodOn(ClientController.class)
                    .deleteClient(response, client.getClientId(), tenant))
                    .withRel(HttpMethod.DELETE.name())
                    .withTitle("delete_client")
                    .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
            client.add(linkTo(methodOn(ClientController.class)
                    .regenerateSecret(response, tenant, client.getClientId()))
                    .withRel(HttpMethod.PATCH.name())
                    .withTitle("regenerate_secret")
                    .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        }

        pagination.add(linkTo(methodOn(ClientController.class)
                .postClient(response,null)).withRel(HttpMethod.POST.name())
                .withTitle("create_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));

        return ResponseEntity.ok(pagination);
    }

    @GetMapping("/{clientId}")
    @RateLimiter(name = "getRateLimiter")
    public ResponseEntity<ClientDTO> getClient(
            HttpServletResponse response,
            @RequestHeader(value = "X-Tenant") int tenant,
            @PathVariable String clientId
    ) {
        log.debug("Received a new get client {} request for tenant {}", clientId, tenant);

        var client = clientService.getClient(clientId, tenant);

        client.add(linkTo(methodOn(ClientController.class)
                .updateClient(response, tenant, clientId, null))
                .withRel(HttpMethod.PUT.name())
                .withMedia(MediaType.APPLICATION_JSON_VALUE)
                .withTitle("update_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        client.add(linkTo(methodOn(ClientController.class)
                .deleteClient(response, clientId, tenant))
                .withRel(HttpMethod.DELETE.name())
                .withTitle("delete_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        client.add(linkTo(methodOn(ClientController.class)
                .regenerateSecret(response, tenant, client.getClientId()))
                .withRel(HttpMethod.PATCH.name())
                .withTitle("regenerate_secret")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        client.add(linkTo(methodOn(ClientController.class)
                .postClient(response,null))
                .withRel(HttpMethod.POST.name())
                .withTitle("create_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));

        return ResponseEntity.ok(client);
    }

    @PostMapping
    @RateLimiter(name = "batchRateLimiter")
    public ResponseEntity<ClientDTO> postClient(
            HttpServletResponse response,
            @RequestBody ClientDTO client
    ) {
        log.debug("Received a new create client request");
        if (!client.getScopes().stream()
                .allMatch(s -> allowedScopes.contains(s))) {
            log.error("Could not create a new client with the scopes specified");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        log.debug("Generating a new client's credentials");

        client.setClientId(UUID.randomUUID().toString());
        client.setClientSecret(UUID.randomUUID().toString());

        this.amqpTemplate.convertAndSend(
                configuration.getClient().getExchange(),
                configuration.getClient().getRouting(),
                client
        );

        log.debug("Successfully submitted a new client broker message");

        client.add(linkTo(methodOn(ClientController.class)
                .getClient(response, client.getTenant(), client.getClientId()))
                .withRel(HttpMethod.GET.name())
                .withMedia(MediaType.APPLICATION_JSON_VALUE)
                .withTitle("get_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", client.getTenant())));
        client.add(linkTo(methodOn(ClientController.class)
                .updateClient(response, client.getTenant(), client.getClientId(),null))
                .withRel(HttpMethod.PUT.name())
                .withMedia(MediaType.APPLICATION_JSON_VALUE)
                .withTitle("update_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", client.getTenant())));
        client.add(linkTo(methodOn(ClientController.class)
                .deleteClient(response, client.getClientId(), client.getTenant()))
                .withRel(HttpMethod.DELETE.name())
                .withTitle("delete_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", client.getTenant())));
        client.add(linkTo(methodOn(ClientController.class)
                .regenerateSecret(response, client.getTenant(), client.getClientId()))
                .withRel(HttpMethod.PATCH.name())
                .withTitle("regenerate_secret")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", client.getTenant())));

        return ResponseEntity.status(HttpStatus.CREATED).body(client);
    }

    @PutMapping("/{clientId}")
    @RateLimiter(name = "batchRateLimiter")
    public ResponseEntity<ClientDTO> updateClient(
            HttpServletResponse response,
            @RequestHeader(value = "X-Tenant") int tenant,
            @PathVariable String clientId,
            @RequestBody ClientDTO clientDTO
    ) {
        log.debug("Received a new update client {} request", clientId);
        if (!clientDTO.getScopes().stream()
                .allMatch(s -> allowedScopes.contains(s))) {
            log.error("Could not update client {} with the scopes specified", clientId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        clientDTO.setClientId(clientId);
        var client = clientService.updateClient(clientDTO, tenant);

        client.add(linkTo(methodOn(ClientController.class)
                .getClient(response, tenant, client.getClientId()))
                .withRel(HttpMethod.GET.name())
                .withMedia(MediaType.APPLICATION_JSON_VALUE)
                .withTitle("get_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        client.add(linkTo(methodOn(ClientController.class)
                .deleteClient(response, client.getClientId(), tenant))
                .withRel(HttpMethod.DELETE.name())
                .withTitle("delete_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        client.add(linkTo(methodOn(ClientController.class)
                .regenerateSecret(response, tenant, client.getClientId()))
                .withRel(HttpMethod.PATCH.name())
                .withTitle("regenerate_secret")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        client.add(linkTo(methodOn(ClientController.class)
                .postClient(response,null))
                .withRel(HttpMethod.POST.name())
                .withTitle("create_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));

        return ResponseEntity.ok(client);
    }

    @PatchMapping("/{clientId}")
    @RateLimiter(name = "regenerateSecretRateLimiter")
    public ResponseEntity<RegenerateDTO> regenerateSecret(
            HttpServletResponse response,
            @RequestHeader(value = "X-Tenant") int tenant,
            @PathVariable String clientId
    ) {
        log.debug("Received a new regenerate client's {} secret request", clientId);
        var regenerate = clientService.regenerateSecret(clientId, tenant);

        regenerate.add(linkTo(methodOn(ClientController.class)
                .getClient(response, tenant, clientId))
                .withRel(HttpMethod.GET.name())
                .withMedia(MediaType.APPLICATION_JSON_VALUE)
                .withTitle("get_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        regenerate.add(linkTo(methodOn(ClientController.class)
                .updateClient(response, tenant, clientId, null))
                .withRel(HttpMethod.PUT.name())
                .withMedia(MediaType.APPLICATION_JSON_VALUE)
                .withTitle("update_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        regenerate.add(linkTo(methodOn(ClientController.class)
                .deleteClient(response, clientId, tenant))
                .withRel(HttpMethod.DELETE.name())
                .withTitle("delete_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));
        regenerate.add(linkTo(methodOn(ClientController.class)
                .postClient(response,null)).withRel(HttpMethod.POST.name())
                .withTitle("create_client")
                .withProfile(String.format("X-API-Version=1;X-Tenant=%d", tenant)));

        return ResponseEntity.ok(regenerate);
    }

    @DeleteMapping("/{clientId}")
    @RateLimiter(name = "batchRateLimiter")
    public ResponseEntity deleteClient(
            HttpServletResponse response,
            @PathVariable String clientId,
            @RequestHeader(value = "X-Tenant") int tenant
    ) {
        log.debug("Received a new delete client {} request for tenant {}", clientId, tenant);

        this.amqpTemplate.convertAndSend(
                configuration.getClient().getExchange(),
                configuration.getClient().getRouting(),
                ClientDTO
                        .builder()
                        .tenant(tenant)
                        .clientId(clientId)
                        .clientSecret(UUID.randomUUID().toString())
                        .scopes(Set.of("***"))
                        .redirectUri("***")
                        .invalidated(true)
                        .build()
        );

        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
