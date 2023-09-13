package com.onlyoffice.authorization.api.messaging.listeners;

import com.onlyoffice.authorization.api.configuration.messaging.RabbitMQConfiguration;
import com.onlyoffice.authorization.api.messaging.messages.ConsentMessage;
import com.onlyoffice.authorization.api.messaging.messages.wrappers.MessageWrapper;
import com.onlyoffice.authorization.api.services.ConsentService;
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@RabbitListener(
        queues = "${messaging.rabbitmq.configuration.consent.queue}",
        containerFactory = "prefetchRabbitListenerContainerFactory"
)
@Slf4j
public class ConsentListener {
    private final RabbitMQConfiguration configuration;
    private final ConsentService consentService;
    private LinkedBlockingQueue<MessageWrapper<ConsentMessage>> messages = new LinkedBlockingQueue<>();
    @RabbitHandler
    public void receiveSave(
            @Payload ConsentMessage message,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long tag
    ) {
        if (messages.size() > configuration.getPrefetch()) {
            log.warn("Consent message queue is full");
            return;
        }

        log.debug("Adding a consent message to the queue");

        messages.add(MessageWrapper
                .<ConsentMessage>builder()
                .tag(tag)
                .channel(channel)
                .data(message)
                .build());
    }

    @Scheduled(fixedDelay = 1000)
    private void persistConsents() {
        if (messages.size() > 0) {
            log.debug("Persisting consent messages (count {})", messages.size());

            consentService.saveConsents(messages
                    .stream().map(s -> s.getData())
                    .collect(Collectors.toSet())
            );

            messages.removeIf(m -> {
                var tag = m.getTag();
                var channel = m.getChannel();

                try {
                    channel.basicAck(tag, true);
                } catch (IOException e) {} finally {
                    return true;
                }
            });
        }
    }
}
