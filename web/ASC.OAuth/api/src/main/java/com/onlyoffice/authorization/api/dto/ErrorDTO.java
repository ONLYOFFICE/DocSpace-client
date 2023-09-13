package com.onlyoffice.authorization.api.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ErrorDTO {
    private String reason;
}
