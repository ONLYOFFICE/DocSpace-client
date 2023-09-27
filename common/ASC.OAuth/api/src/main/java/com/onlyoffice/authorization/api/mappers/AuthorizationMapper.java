package com.onlyoffice.authorization.api.mappers;

import com.onlyoffice.authorization.api.messaging.messages.AuthorizationMessage;
import com.onlyoffice.authorization.api.entities.Authorization;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.factory.Mappers;

@Mapper(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AuthorizationMapper {
    AuthorizationMapper INSTANCE = Mappers.getMapper(AuthorizationMapper.class);

    AuthorizationMessage toDTO(Authorization authorization);

    Authorization toEntity(AuthorizationMessage scopeDTO);

    void update(@MappingTarget Authorization entity, AuthorizationMessage dto);
}
