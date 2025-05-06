
import os
import time
from dotenv import load_dotenv
from semantic_kernel.functions import kernel_function
from azure.communication.email import EmailClient
 
# Explicitly load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.dev"))
 
class EmailAgent:
    def __init__(self):
        # Explicitly load Azure Communication Services connection string
        acs_connection_string = os.getenv("AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING")
        if not acs_connection_string:
            raise ValueError("Missing Azure Communication Service connection string in environment variables.")
        print("[DEBUG] ACS Connection String loaded successfully.")
 
        # Explicitly defined sender and reply-to email addresses
        self.sender_address = "DoNotReply@88820c88-2850-4ec0-b94f-43d9d63ce36a.azurecomm.net"
        self.replyto_address = "replyto@example.com"
 
        # Initialize Azure Communication Services Email Client explicitly
        self.email_client = EmailClient.from_connection_string(acs_connection_string)
        print("[DEBUG] Email client initialized successfully.")
 
    @kernel_function
    async def send_email(self, user_details: dict) -> str:
        """
        Send acknowledgment emails explicitly to primary and secondary emails provided in user details.
        Args:
            user_details (dict): Structured patient details artifact from Cosmos DB.
        Returns:
            str: Status message indicating success or failure.
        """
        try:
            # Extract email addresses explicitly
            primary_email = user_details.get('primary_email', '').strip()
            # secondary_email = user_details.get('secondary_email', '').strip()
 
            email_subject = "Prescription Confirmation"
            email_content = self.construct_email_body(user_details)
 
            print("[DEBUG] Email content constructed successfully.")
            
            # Track if at least one email was sent successfully
            email_sent = False
            
            # Send email explicitly to primary email address
            if primary_email:
                email_message = {
                    "senderAddress": self.sender_address,
                    "recipients": {"to": [{"address": primary_email}]},
                    "content": {
                        "subject": email_subject,
                        "plainText": email_content,
                        "html": f"<pre>{email_content}</pre>"
                    },
                    "replyTo": [{"address": self.replyto_address}]
                }
                
                # Use begin_send with polling
                print(f"[DEBUG] Sending email to primary email: {primary_email}")
                poller = self.email_client.begin_send(email_message)
                
                # Set up polling parameters
                time_elapsed = 0
                POLLER_WAIT_TIME = 10
                
                # Poll until operation completes or times out
                while not poller.done():
                    print(f"[DEBUG] Email send poller status for primary email: {poller.status()}")
                    poller.wait(POLLER_WAIT_TIME)
                    time_elapsed += POLLER_WAIT_TIME
                    
                    if time_elapsed > 18 * POLLER_WAIT_TIME:
                        print("[ERROR] Polling timed out for primary email.")
                        break
                
                if poller.done() and poller.result()["status"] == "Succeeded":
                    print(f"[DEBUG] Email sent successfully to primary email: {primary_email}")
                    email_sent = True
                else:
                    print(f"[ERROR] Failed to send email to primary email: {poller.result().get('error', 'Unknown error')}")
            else:
                print("[WARNING] No primary email provided, skipping sending email to primary email.")
 
            # Send email explicitly to secondary email address if provided
            # if secondary_email:
            #     email_message = {
            #         "senderAddress": self.sender_address,
            #         "recipients": {"to": [{"address": secondary_email}]},
            #         "content": {
            #             "subject": email_subject,
            #             "plainText": email_content,
            #             "html": f"<pre>{email_content}</pre>"
            #         },
            #         "replyTo": [{"address": self.replyto_address}]
            #     }
                
            #     # Use begin_send with polling
            #     print(f"[DEBUG] Sending email to secondary email: {secondary_email}")
            #     poller = self.email_client.begin_send(email_message)
                
            #     # Set up polling parameters
            #     time_elapsed = 0
            #     POLLER_WAIT_TIME = 10
                
            #     # Poll until operation completes or times out
            #     while not poller.done():
            #         print(f"[DEBUG] Email send poller status for secondary email: {poller.status()}")
            #         poller.wait(POLLER_WAIT_TIME)
            #         time_elapsed += POLLER_WAIT_TIME
                    
            #         if time_elapsed > 18 * POLLER_WAIT_TIME:
            #             print("[ERROR] Polling timed out for secondary email.")
            #             break
                
            #     if poller.done() and poller.result()["status"] == "Succeeded":
            #         print(f"[DEBUG] Email sent successfully to secondary email: {secondary_email}")
            #         email_sent = True
            #     else:
            #         print(f"[ERROR] Failed to send email to secondary email: {poller.result().get('error', 'Unknown error')}")
            # else:
            #     print("[WARNING] No secondary email provided, skipping sending email to secondary email.")
 
            if email_sent:
                return "Emails successfully sent to provided addresses."
            else:
                return "No emails were sent. Please check the provided email addresses."
 
        except Exception as e:
            error_message = f"Failed to send emails explicitly due to error: {str(e)}"
            print(f"[ERROR] {error_message}")
            return error_message
 
    def construct_email_body(self, user_details: dict) -> str:
        """
        Construct and format email body explicitly using user details.
 
        Args:
            user_details (dict): Structured artifact containing user and prescription details.
        Returns:
            str: Formatted email body content.
        """
        email_body = "Prescription Details Confirmation:\n\n"
        for key, value in user_details.items():
            formatted_key = key.capitalize().replace('_', ' ')
            email_body += f"{formatted_key}: {value}\n"
 
        print("[DEBUG] Email body formatted:\n", email_body)
        return email_body