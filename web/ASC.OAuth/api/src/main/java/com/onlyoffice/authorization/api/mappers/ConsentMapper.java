package com.onlyoffice.authorization.api.mappers;

import com.onlyoffice.authorization.api.entities.Consent;
import com.onlyoffice.authorization.api.messaging.messages.ConsentMessage;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.factory.Mappers;

@Mapper(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ConsentMapper {
    ConsentMapper INSTANCE = Mappers.getMapper(ConsentMapper.class);

    ConsentMessage toDTO(Consent consent);

    Consent toEntity(ConsentMessage consentMessage);

    void update(@MappingTarget Consent entity, ConsentMessage message);
}
