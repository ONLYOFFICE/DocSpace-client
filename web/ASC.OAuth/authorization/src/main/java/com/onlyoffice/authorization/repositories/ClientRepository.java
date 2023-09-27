package com.onlyoffice.authorization.repositories;

import com.onlyoffice.authorization.entities.Client;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface ClientRepository extends Repository<Client, String> {
    Optional<Client> findById(String id);
    Optional<Client> findClientByClientId(String clientId);
}
