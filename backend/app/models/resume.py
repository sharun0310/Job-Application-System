from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    file_path = Column(String, nullable=False)
    parsed_data = Column(JSONB, nullable=True)
    ats_score = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="resumes")
    skills = relationship(
        "ResumeSkill", back_populates="resume", cascade="all, delete-orphan"
    )
    experience = relationship(
        "ResumeExperience", back_populates="resume", cascade="all, delete-orphan"
    )
    projects = relationship(
        "ResumeProject", back_populates="resume", cascade="all, delete-orphan"
    )


class ResumeSkill(Base):
    __tablename__ = "resume_skills"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"))
    skill_name = Column(String, nullable=False)

    resume = relationship("Resume", back_populates="skills")


class ResumeExperience(Base):
    __tablename__ = "resume_experience"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"))
    company_name = Column(String)
    job_title = Column(String)
    description = Column(Text)

    resume = relationship("Resume", back_populates="experience")


class ResumeProject(Base):
    __tablename__ = "resume_projects"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"))
    project_name = Column(String)
    description = Column(Text)

    resume = relationship("Resume", back_populates="projects")
