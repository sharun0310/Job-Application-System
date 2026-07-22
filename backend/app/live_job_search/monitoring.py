from app.live_job_search.provider_factory import provider_factory

class MonitoringService:
    """
    Centralized monitoring for the Live Job Search Engine.
    Aggregates statistics across all registered providers.
    """
    
    @staticmethod
    async def get_providers_health():
        providers = provider_factory.get_active_providers()
        health_stats = []
        for p in providers:
            health = await p.health()
            health_stats.append(health.model_dump())
        return health_stats

    @staticmethod
    def get_global_statistics():
        # In a real setup, this pulls from Redis or Prometheus metrics.
        # Returning static/calculated basics for now.
        active = provider_factory.get_active_providers()
        return {
            "total_providers": len(active),
            "healthy_providers": len(active), # Placeholder logic
            "cache_status": "Enabled",
        }

monitoring_service = MonitoringService()
