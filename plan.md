VARS:
QUEUE_NAME
EXCHANGE_NAME
ROUTING_KEY

provide: dispatcher
queue: QUEUE_NAME

@DomainEventHandler({
  events: [
    MessageCreated, -> ROUTING_KEY
  ],
  dispatcher: GMAIL_OUTGOING_MESSAGE_PROCESSOR_DISPATCHER, -> dispatcherProvider -> QUEUE_NAME
})


private_${event.type.split('.')[0]}_general -> EXCHANGE_NAME

ROUTING_KEY
EXCHANGE_NAME

wyciąganie z kodu: trudne, bo `createRabbitMQDispatcher` plus potem handler `dispatcher: GMAIL_OUTGOING_MESSAGE_PROCESSOR_DISPATCHER`
