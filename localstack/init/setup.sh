#!/bin/bash

echo "Creating SQS queue and EventBridge rule..."

awslocal sqs create-queue --queue-name chat-message-queue

awslocal events create-event-bus --name chat-bus || true

awslocal events put-rule \
  --name ChatMessageRule \
  --event-pattern '{
    "source": ["chat-app.messages"],
    "detail-type": ["NewMessage"]
  }' \
  --event-bus-name chat-bus

awslocal sqs add-permission \
  --queue-url http://localhost:4566/000000000000/chat-message-queue \
  --label allow-events \
  --aws-account-id 000000000000 \
  --actions SendMessage \

QUEUE_ARN=$(awslocal sqs get-queue-attributes --queue-url http://localhost:4566/000000000000/chat-message-queue --attribute-name QueueArn --query "Attributes.QueueArn" --output text)

awslocal events put-targets \
  --rule ChatMessageRule \
  --event-bus-name chat-bus \
  --targets '[
    {
      "Id": "Target0",
      "Arn": "arn:aws:sqs:us-east-1:000000000000:chat-message-queue"
    }
  ]'