package com.onlyoffice.authorization.api.repositories;

import com.onlyoffice.authorization.api.entities.Consent;
import org.springframework.data.repository.CrudRepository;

public interface ConsentRepository extends CrudRepository<Consent, Consent.ConsentId> {
    void deleteById(Consent.ConsentId id);
}
