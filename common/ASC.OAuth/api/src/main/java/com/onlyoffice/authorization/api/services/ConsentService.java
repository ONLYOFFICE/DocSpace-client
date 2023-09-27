package com.onlyoffice.authorization.api.services;

import com.onlyoffice.authorization.api.entities.Consent;
import com.onlyoffice.authorization.api.mappers.ConsentMapper;
import com.onlyoffice.authorization.api.messaging.messages.ConsentMessage;
import com.onlyoffice.authorization.api.repositories.ConsentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsentService {
    private final ConsentRepository consentRepository;

    @Transactional
    public void saveConsent(ConsentMessage consentMessage) {
        log.debug("Trying to save a new consent for {} and {}",
                consentMessage.getPrincipalName(), consentMessage.getRegisteredClientId());
        consentRepository.save(ConsentMapper.INSTANCE.toEntity(consentMessage));
    }

    @Transactional
    public void saveConsents(Iterable<ConsentMessage> consents) {
        log.debug("Trying to save consents");
        for (ConsentMessage consent : consents) {
            try {
                log.debug("Saving a new consent for {} and {}",
                        consent.getPrincipalName(), consent.getRegisteredClientId());
                consentRepository.save(ConsentMapper.INSTANCE.toEntity(consent));
            } catch (Exception e) {
                log.error(e.getMessage());
            }
        }
    }

    @Transactional
    public void deleteConsent(ConsentMessage consentMessage) {
        log.debug("Deleting a consent for {} and {}",
                consentMessage.getPrincipalName(), consentMessage.getRegisteredClientId());
        consentRepository.deleteById(new Consent.ConsentId(
                consentMessage.getRegisteredClientId(),
                consentMessage.getPrincipalName()
        ));
    }

    @Transactional
    public void deleteConsents(Iterable<ConsentMessage> consents) {
        log.debug("Trying to delete all consents");
        consentRepository.deleteAll(StreamSupport
                .stream(consents.spliterator(), false)
                .map(c -> ConsentMapper.INSTANCE.toEntity(c))
                .collect(Collectors.toList())
        );
    }
}
