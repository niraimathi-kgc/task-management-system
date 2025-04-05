import json
from channels.generic.websocket import AsyncWebsocketConsumer
from kafka import KafkaConsumer
from django.conf import settings
import asyncio
import threading


class TaskConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for task updates."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        await self.channel_layer.group_add("task_updates", self.channel_name)
        await self.accept()
        
        # Start Kafka consumer in a separate thread
        self.kafka_thread = threading.Thread(target=self.kafka_consumer)
        self.kafka_thread.daemon = True
        self.kafka_thread.start()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard("task_updates", self.channel_name)
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        pass  # We don't handle incoming messages in this consumer
    
    async def task_update(self, event):
        """Send task update to WebSocket."""
        await self.send(text_data=json.dumps(event['data']))
    
    def kafka_consumer(self):
        """Consume messages from Kafka and forward them to the WebSocket."""
        consumer = KafkaConsumer(
            settings.KAFKA_TASK_UPDATES_TOPIC,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True
        )
        
        for message in consumer:
            asyncio.run(self.channel_layer.group_send(
                "task_updates",
                {
                    "type": "task_update",
                    "data": message.value
                }
            )) 