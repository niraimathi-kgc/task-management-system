import json
from kafka import KafkaProducer
from django.conf import settings


class KafkaClient:
    """Kafka client for producing messages."""
    
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    
    def send_task_update(self, task_data):
        """Send task update to Kafka."""
        self.producer.send(settings.KAFKA_TASK_UPDATES_TOPIC, task_data)
        self.producer.flush()
    
    def send_notification(self, notification_data):
        """Send notification to Kafka."""
        self.producer.send(settings.KAFKA_NOTIFICATIONS_TOPIC, notification_data)
        self.producer.flush()


# Create a singleton instance
kafka_client = KafkaClient() 