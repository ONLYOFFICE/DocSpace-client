package com.onlyoffice.authorization.api.mappers;

import com.onlyoffice.authorization.api.dto.ClientDTO;
import com.onlyoffice.authorization.api.entities.Client;
import org.bouncycastle.util.Strings;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ClientMapper {
    ClientMapper INSTANCE = Mappers.getMapper(ClientMapper.class);

    default Set<String> map(String value) {
        return Arrays.stream(Strings.split(value, ',')).collect(Collectors.toSet());
    }

    default String map(Set<String> value) {
        return String.join(",", value);
    }

    @Mappings({
            @Mapping(source = "tenant.id", target = "tenant"),
            @Mapping(source = "invalidated", target = "invalidated")
    })
    ClientDTO toDTO(Client client);

    @Mappings({
            @Mapping(
                    source = "authenticationMethod",
                    target = "authenticationMethod",
                    defaultValue = "client_secret_post"
            ),
            @Mapping(
                    source = "tenant",
                    target = "tenant.id"
            ),
            @Mapping(
                    source = "invalidated",
                    target = "invalidated"
            )
    })
    Client toEntity(ClientDTO clientDTO);

    @Mappings({
            @Mapping(target = "clientId", ignore = true),
            @Mapping(target = "clientSecret", ignore = true),
            @Mapping(target = "tenant", ignore = true)
    })
    void update(@MappingTarget Client entity, ClientDTO clientDTO);
}
