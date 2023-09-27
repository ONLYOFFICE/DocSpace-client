package com.onlyoffice.authorization.api.messaging.listeners;

import com.onlyoffice.authorization.api.configuration.messaging.RabbitMQConfiguration;
import com.onlyoffice.authorization.api.dto.ClientDTO;
import com.onlyoffice.authorization.api.messaging.messages.NotificationMessage;
import com.onlyoffice.authorization.api.messaging.messages.wrappers.MessageWrapper;
import com.onlyoffice.authorization.api.services.ClientService;
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class ClientListener {
    private final RabbitMQConfiguration configuration;
    private final ClientService clientService;
    private final AmqpTemplate rabbitClient;
    private CopyOnWriteArrayList<MessageWrapper<ClientDTO>> messages = new CopyOnWriteArrayList<>();

    @RabbitListener(
            queues = "${messaging.rabbitmq.configuration.client.queue}",
            containerFactory = "prefetchRabbitListenerContainerFactory"
    )
    public void receiveMessage(
            ClientDTO clientDTO,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long tag
    ) {
        if (messages.size() == configuration.getPrefetch()) {
            log.warn("Client message queue is full");
            return;
        }

        log.debug("Adding a client message to the queue");

        messages.add(MessageWrapper.
                <ClientDTO>builder().
                tag(tag).
                channel(channel).
                data(clientDTO).
                build());
    }

    @Scheduled(fixedDelay = 1000)
    private void persistClients() {
        if (messages.size() > 0) {
            log.debug("Persisting client messages (count {})", messages.size());

            var ids = clientService.createClients(messages.stream().map(s -> s.getData())
                    .collect(Collectors.toList()));

            messages.removeIf(w -> {
                var tag = w.getTag();
                var channel = w.getChannel();

                try {
                    if (!ids.contains(w.getData().getClientId())) {
                        channel.basicAck(tag, true);
                        rabbitClient.convertAndSend(
                                configuration.getSocket().getExchange(),
                                "",
                                NotificationMessage.builder()
                                        .tenant(w.getData().getTenant())
                                        .clientId(w.getData().getClientId())
                                        .build()
                        );
                    } else
                        channel.basicNack(tag, false, true);
                } catch (IOException e) {} finally {
                    return true;
                }
            });
        }
    }
}
