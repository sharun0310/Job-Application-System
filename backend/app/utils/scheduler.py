import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.user import User
from app.services.matching_service import MatchingService
from app.services.whatsapp_service import WhatsAppService

# Initialize the globally accessible scheduler
scheduler = BackgroundScheduler()

def process_whatsapp_recommendations():
    """
    Background job that runs periodically to fetch matched jobs 
    for users and send them via WhatsApp.
    """
    logging.info("Starting automated WhatsApp job recommendations run...")
    db: Session = SessionLocal()
    try:
        # Fetch all active users with a valid whatsapp_number
        users = db.query(User).filter(User.is_active == True, User.whatsapp_number.isnot(None)).all()
        
        for user in users:
            try:
                # Use the Semantic Matching engine to get top 3 jobs for this user
                recommendations = MatchingService.get_recommended_jobs(db, user.id, top_k=3)
                if not recommendations:
                    continue
                
                # Format the message
                message = f"👋 Hello! Here are your top personalized Job/Internship Matches for today based on your resume:\n\n"
                
                for idx, item in enumerate(recommendations, 1):
                    job = item.get("job", {})
                    match_score = item.get("match_score", 0)
                    
                    title = job.get("title", "Unknown Role")
                    company_name = job.get("company_name", "Unknown Company")
                    job_type = job.get("job_type", "Full-time")
                    apply_url = job.get("apply_url", "")
                    
                    message += f"🔹 *{idx}. {title}* at {company_name}\n"
                    message += f"   🔥 Match: {match_score}%\n"
                    message += f"   💼 Type: {job_type}\n"
                    message += f"   🔗 Apply: {apply_url}\n\n"
                    
                message += "Log in to your dashboard to see more details and skill gap analysis! 🚀"
                
                # Dispatch WhatsApp message
                WhatsAppService.send_message(user.whatsapp_number, message.strip())
                
            except Exception as user_err:
                logging.error(f"Error processing recommendations for user {user.id}: {user_err}")
                
    except Exception as e:
        logging.error(f"Automated WhatsApp task failed: {e}", exc_info=True)
    finally:
        db.close()
        logging.info("Automated WhatsApp job recommendations run complete.")

def start_scheduler():
    """Starts the APScheduler with configured tasks."""
    if not scheduler.running:
        # Schedule the job to run every day at 9:00 AM
        # For testing, you could change this to an interval like `trigger="interval", minutes=5`
        scheduler.add_job(
            process_whatsapp_recommendations,
            trigger=CronTrigger(hour=9, minute=0),
            id="daily_whatsapp_recommendations",
            name="Send daily WhatsApp job recommendations",
            replace_existing=True
        )
        scheduler.start()
        logging.info("APScheduler started successfully. WhatsApp Job is queued.")

def stop_scheduler():
    """Shuts down the APScheduler gracefully."""
    if scheduler.running:
        scheduler.shutdown()
        logging.info("APScheduler stopped.")
