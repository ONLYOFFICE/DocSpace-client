package com.onlyoffice.authorization.api.repositories;

import com.onlyoffice.authorization.api.entities.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional(rollbackFor = Exception.class)
public interface ClientRepository extends CrudRepository<Client, String>,
        PagingAndSortingRepository<Client, String> {
    @Query("""
           SELECT c FROM Client c WHERE c.clientId=:id AND c.invalidated=false
           """)
    Optional<Client> findById(@Param("id") String id);
    int deleteByClientIdAndTenantId(String id, int tenantId);
    @EntityGraph(attributePaths = {"scopes", "tenant"})
    Optional<Client> findClientByClientIdAndTenantId(String id, int tenantId);
    Page<Client> findAllByTenantId(int tenantId, Pageable pageable);
    @Query("""
           UPDATE Client c SET c.clientSecret=:secret WHERE c.clientId=:clientId AND c.tenant.id=:tenant
           """)
    @Modifying
    void regenerateClientSecretByClientId(@Param("clientId") String clientId, @Param("tenant") int tenant, @Param("secret") String secret);
}
