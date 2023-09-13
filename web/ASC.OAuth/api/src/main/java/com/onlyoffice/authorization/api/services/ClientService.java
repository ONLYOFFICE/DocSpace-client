package com.onlyoffice.authorization.api.services;

import com.onlyoffice.authorization.api.crypto.Cipher;
import com.onlyoffice.authorization.api.dto.ClientDTO;
import com.onlyoffice.authorization.api.dto.PaginationDTO;
import com.onlyoffice.authorization.api.dto.RegenerateDTO;
import com.onlyoffice.authorization.api.exceptions.ClientNotFoundException;
import com.onlyoffice.authorization.api.mappers.ClientMapper;
import com.onlyoffice.authorization.api.repositories.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 *
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {
    private final ClientRepository clientRepository;
    private final Cipher cipher;

    @Transactional(readOnly = true, rollbackFor = Exception.class, timeout = 2000)
    public ClientDTO getClient(String id, int tenantId) {
        log.debug("Trying to get a client with id {} for tenant {}", id, tenantId);
        var entity = clientRepository
                .findById(id)
                .orElseThrow(() -> new ClientNotFoundException(String
                        .format("could not find client with id %s for %d", id, tenantId)));
        return ClientMapper.INSTANCE.toDTO(entity);
    }

    // Intentionally do not decipher secrets
    @Transactional(readOnly = true, rollbackFor = Exception.class, timeout = 2000)
    public PaginationDTO getTenantClients(int tenantId, int page, int limit) {
        log.debug("Trying to get tenant {} clients with page {} and limit {}", tenantId, page, limit);
        var data = clientRepository
                .findAllByTenantId(tenantId, Pageable.ofSize(limit).withPage(page));

        var builder = PaginationDTO
                .<ClientDTO>builder()
                .page(page)
                .limit(limit)
                .data(data.map(c -> ClientMapper.INSTANCE.toDTO(c)));

        if (data.hasPrevious())
            builder.previous(page - 1);

        if (data.hasNext())
            builder.next(page + 1);

        return builder.build();
    }

    @Transactional(rollbackFor = Exception.class, timeout = 2000)
    public ClientDTO createClient(ClientDTO clientDTO) {
        log.debug("Trying to create a new client");
        clientDTO.setClientId(UUID.randomUUID().toString());
        clientDTO.setClientSecret(UUID.randomUUID().toString());
        log.debug("A new client's client id is {}", clientDTO.getClientId());
        return ClientMapper.INSTANCE.toDTO(clientRepository.save(ClientMapper.INSTANCE.toEntity(clientDTO)));
    }

    /**
     *
     * @param clientDTO
     * @return a list of failed ids
     */
    @Transactional
    public List<String> createClients(Iterable<ClientDTO> clientDTO) {
        log.debug("Trying to save new clients");
        List<String> ids = new ArrayList<>();

        for (ClientDTO dto : clientDTO) {
            try {
                clientRepository.save(ClientMapper.INSTANCE.toEntity(dto));
            } catch (RuntimeException e) {
                ids.add(dto.getClientId());
                log.debug("could not create client {}: ", dto.getClientId(), e.getMessage());
            }
        }

        return ids;
    }

    @Transactional(rollbackFor = Exception.class, timeout = 2000)
    public ClientDTO updateClient(ClientDTO clientDTO, int tenant) {
        log.debug("Trying to update a client with id {} for tenant {}", clientDTO.getClientId(), tenant);
        var c = clientRepository.findClientByClientIdAndTenantId(clientDTO.getClientId(), tenant)
                .orElseThrow(() -> new ClientNotFoundException(String
                        .format("could not find client with client id %s for %d", clientDTO.getClientId(), tenant)));
        ClientMapper.INSTANCE.update(c, clientDTO);
        return ClientMapper.INSTANCE.toDTO(c);
    }

    @Transactional(rollbackFor = Exception.class, timeout = 2000)
    public RegenerateDTO regenerateSecret(String id, int tenant) {
        log.debug("Regenerating client's secret for tenant {} by client id {}", tenant, id);
        String secret = UUID.randomUUID().toString();
        clientRepository.regenerateClientSecretByClientId(id, tenant, secret);
        return RegenerateDTO.builder().clientSecret(secret).build();
    }

    @Transactional(rollbackFor = Exception.class, timeout = 2000)
    public Boolean deleteClient(String id, int tenantId) {
        log.debug("Deleting a client with id {} for tenant {}", id, tenantId);
        if (clientRepository.deleteByClientIdAndTenantId(id, tenantId) < 1)
            throw new ClientNotFoundException(String
                    .format("could not find client with client id %s for %d", id, tenantId));
        return true;
    }
}
