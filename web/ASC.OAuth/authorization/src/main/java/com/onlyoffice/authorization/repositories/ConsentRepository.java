package com.onlyoffice.authorization.repositories;

import com.onlyoffice.authorization.entities.Consent;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface ConsentRepository extends Repository<Consent, Consent.ConsentId> {
    Optional<Consent> findByRegisteredClientIdAndPrincipalName(String registeredClientId, String principalName);
}
