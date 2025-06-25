# app/core/config.py
import os

class SecurityConfig:
    # Parámetros ajustables por entorno
    ARGON2_MEMORY_COST = int(os.getenv("ARGON2_MEMORY", "65536"))  # 64 MB
    ARGON2_TIME_COST = int(os.getenv("ARGON2_TIME", "3"))
    ARGON2_PARALLELISM = int(os.getenv("ARGON2_PARALLELISM", "4"))
    
    @classmethod
    def get_argon2_params(cls):
        return {
            "argon2__memory_cost": cls.ARGON2_MEMORY_COST,
            "argon2__time_cost": cls.ARGON2_TIME_COST,
            "argon2__parallelism": cls.ARGON2_PARALLELISM
        }