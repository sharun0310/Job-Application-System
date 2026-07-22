from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from datetime import datetime

class LiveJobSchema(BaseModel):
    """
    Unified Job Model representing the normalized data structure 
    from all active job providers in the Live Search Engine.
    """
    job_id: str = Field(..., description="Unique identifier for the job from the provider")
    title: str = Field(..., description="Job title")
    company: str = Field(..., description="Hiring company name")
    company_logo: Optional[HttpUrl] = Field(None, description="URL to the company logo")
    
    location: Optional[str] = Field(None, description="Primary location string")
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    
    remote: bool = Field(False, description="Is the job fully remote?")
    hybrid: bool = Field(False, description="Is the job hybrid?")
    onsite: bool = Field(False, description="Is the job onsite?")
    
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = Field("USD", description="Currency code, e.g., USD, EUR")
    
    employment_type: Optional[str] = Field(None, description="e.g., Full-time, Part-time, Contract")
    experience_level: Optional[str] = Field(None, description="e.g., Entry, Mid, Senior, Executive")
    
    description: str = Field(..., description="Full HTML or text description")
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    
    skills: List[str] = Field(default_factory=list, description="Extracted skills required")
    tags: List[str] = Field(default_factory=list, description="Categorization tags")
    
    apply_url: HttpUrl = Field(..., description="Direct application link")
    company_url: Optional[HttpUrl] = Field(None, description="Company website URL")
    
    source: str = Field(..., description="The original source job board or API")
    provider: str = Field(..., description="The internal provider engine used to fetch this job")
    
    posted_date: Optional[datetime] = Field(None, description="When the job was published")
    expiration_date: Optional[datetime] = Field(None, description="When the job listing expires")
    job_type: Optional[str] = None
    language: Optional[str] = Field("en", description="Language code")
    
    # Internal Engine Scores
    search_score: float = Field(0.0, description="Base text search relevance score")
    provider_score: float = Field(0.0, description="Reliability score of the provider")
    ranking_score: float = Field(0.0, description="Final compounded ranking score")

class ProviderHealth(BaseModel):
    name: str
    status: str
    latency_ms: float
    jobs_returned: int
    last_sync: datetime
    failure_count: int

class SearchSuggestions(BaseModel):
    autocomplete: List[str]
    popular_searches: List[str]
    trending_skills: List[str]
    related_keywords: List[str]
