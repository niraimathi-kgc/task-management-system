#!/bin/bash

# Wait for Kafka to be ready
sleep 10

# Create Kafka topics
kafka-topics --create --if-not-exists \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 1 \
    --topic task-updates

kafka-topics --create --if-not-exists \
    --bootstrap-server localhost:9092 \
    --replication-factor 1 \
    --partitions 1 \
    --topic notifications

# List created topics
kafka-topics --list --bootstrap-server localhost:9092 