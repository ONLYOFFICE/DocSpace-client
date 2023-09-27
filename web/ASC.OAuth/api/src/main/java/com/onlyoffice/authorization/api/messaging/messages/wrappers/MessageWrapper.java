package com.onlyoffice.authorization.api.messaging.messages.wrappers;

import com.rabbitmq.client.Channel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageWrapper<E> implements Serializable {
    private long tag;
    private Channel channel;
    private E data;
}
