package com.onlyoffice.authorization.api.repositories;

import com.onlyoffice.authorization.api.entities.Authorization;
import org.springframework.data.repository.CrudRepository;

public interface AuthorizationRepository extends CrudRepository<Authorization, String> {
    void deleteById(String id);
}
