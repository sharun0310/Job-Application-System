from typing import List
from datetime import datetime, timezone
from app.live_job_search.schemas import LiveJobSchema

class RankingEngine:
    """
    Applies multi-factor scoring to rank jobs based on:
    - Keyword relevance (basic substring match for now)
    - Recency
    - Provider reliability
    """
    
    @staticmethod
    def rank_jobs(jobs: List[LiveJobSchema], query: str = "") -> List[LiveJobSchema]:
        now = datetime.now(timezone.utc)
        
        for job in jobs:
            score = 0.0
            
            # 1. Recency Score (max 40 points)
            if job.posted_date:
                # Ensure job.posted_date is timezone-aware for comparison
                posted = job.posted_date if job.posted_date.tzinfo else job.posted_date.replace(tzinfo=timezone.utc)
                days_old = (now - posted).days
                if days_old <= 1:
                    score += 40
                elif days_old <= 7:
                    score += 25
                elif days_old <= 30:
                    score += 10
            else:
                score += 5 # Neutral score if no date provided
                
            # 2. Keyword Relevance Score (max 40 points)
            if query:
                q_lower = query.lower()
                # Heavy weight if it's in the title
                if q_lower in job.title.lower():
                    score += 40
                # Lighter weight if just in description
                elif q_lower in job.description.lower():
                    score += 15
            else:
                score += 40 # If no query, baseline everyone
                
            # 3. Provider Reliability (max 20 points, simulated)
            # In a full system, this checks provider health stats
            score += 20
            
            job.ranking_score = score
            
        # Sort descending by ranking_score
        return sorted(jobs, key=lambda j: j.ranking_score, reverse=True)
