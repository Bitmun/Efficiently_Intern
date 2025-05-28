#!/bin/bash

echo "Initializing LocalStack resources..."

awslocal sqs create-queue --queue-name message-sync-queue

awslocal events create-event-bus --name chat-bus

awslocal events put-rule --name SyncMessagesRule --event-bus-name chat-bus --event-pattern '{"source":["chat-app.sync"],"detail-type":["SyncMessages"]}'

awslocal events put-targets --rule SyncMessagesRule --event-bus-name chat-bus --targets '{"Id":"1","Arn":"arn:aws:sqs:us-east-1:000000000000:message-sync-queue"}'
