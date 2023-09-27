package com.onlyoffice.authorization.api.services;

import com.onlyoffice.authorization.api.mappers.AuthorizationMapper;
import com.onlyoffice.authorization.api.messaging.messages.AuthorizationMessage;
import com.onlyoffice.authorization.api.repositories.AuthorizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationService {
    private final AuthorizationRepository authorizationRepository;

    @Transactional
    public void saveAuthorization(AuthorizationMessage authorizationMessage) {
        log.debug("Saving an authorization with id: {}", authorizationMessage.getId());
        authorizationRepository.save(AuthorizationMapper.INSTANCE.toEntity(authorizationMessage));
    }

    /**
     *
     * @param authorizations
     * @return a list of failed ids
     */
    @Transactional
    public List<String> saveAuthorizations(Iterable<AuthorizationMessage> authorizations) {
        log.debug("Saving authorizations");
        List<String> ids = new ArrayList<>();

        for (AuthorizationMessage authorization : authorizations) {
            try {
                log.debug("Saving an authorization with id: {}", authorization.getId());
                authorizationRepository.save(AuthorizationMapper.INSTANCE.toEntity(authorization));
            } catch (Exception e) {
                ids.add(authorization.getId());
                log.error(e.getMessage());
            }
        }

        return ids;
    }

    @Transactional
    public void deleteAuthorization(AuthorizationMessage a) {
        log.debug("Deleting authorization with id: {}", a.getId());
        authorizationRepository.deleteById(a.getId());
    }

    @Transactional
    public void deleteAuthorizations(Iterable<AuthorizationMessage> authorizations) {
        log.debug("Deleting authorizations");
        for (AuthorizationMessage authorization : authorizations) {
            try {
                log.debug("Deleting authorization with id: {}", authorization.getId());
                authorizationRepository.deleteById(authorization.getId());
            } catch (Exception e) {
                log.error(e.getMessage());
            }
        }
    }
}
