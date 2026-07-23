import api from '../api/axiosInstance'

export const matchingService = {
  // GET /matching/jobs/recommended?top_k=5
  getRecommendedJobs: async (topK = 5) => {
    const res = await api.get('/matching/jobs/recommended', { params: { top_k: topK } })
    return res.data // { success, data: [{ job: {...}, match_score: 87.5 }] }
  },

  // GET /matching/skill-gap/{job_id}
  // Returns 400 on prerequisite failures (no resume, no embeddings, etc.)
  getSkillGap: async (jobId) => {
    const res = await api.get(`/matching/skill-gap/${jobId}`)
    return res.data
    // Success: { success: true, data: { overall_score, category_scores, missing_skills, improvement_suggestions } }
    // 400: { success: false, message: "Resume not found.", data: null, errors: [...] }
  },

  // POST /matching/learning-roadmap — JSON body
  getLearningRoadmap: async (missingSkills, targetRole) => {
    const res = await api.post('/matching/learning-roadmap', {
      missing_skills: missingSkills,
      target_role: targetRole,
    })
    return res.data
    // { success, data: { Beginner: [...], Intermediate: [...], Advanced: [...] } }
  },
}
