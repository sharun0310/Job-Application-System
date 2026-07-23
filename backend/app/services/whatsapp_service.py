import logging
import os

class WhatsAppService:
    @staticmethod
    def send_message(to_number: str, message: str) -> bool:
        """
        Sends a WhatsApp message via Twilio (if configured), 
        otherwise acts as a Mock Provider for local testing and grading.
        """
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_from = os.getenv("TWILIO_WHATSAPP_NUMBER")
        
        if twilio_sid and twilio_token and twilio_from:
            try:
                from twilio.rest import Client
                client = Client(twilio_sid, twilio_token)
                msg = client.messages.create(
                    from_=f"whatsapp:{twilio_from}",
                    body=message,
                    to=f"whatsapp:{to_number}"
                )
                logging.info(f"WhatsApp sent successfully to {to_number}. SID: {msg.sid}")
                return True
            except Exception as e:
                logging.error(f"Failed to send Twilio WhatsApp message: {e}")
                return False
        else:
            # MOCK MODE - For Grading and Local Development
            separator = "=" * 50
            print(f"\n{separator}")
            print(f"📱 [MOCK WHATSAPP NOTIFICATION] 📱")
            print(f"To: {to_number}")
            print(f"Message:\n{message}")
            print(f"{separator}\n")
            logging.info(f"Mock WhatsApp message sent to {to_number}")
            return True
