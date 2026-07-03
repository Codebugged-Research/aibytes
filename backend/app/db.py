import logging
import asyncpg
from app.config import DATABASE_URL, BASE_DIR

logger = logging.getLogger("aibites.db")
_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
        # Ensure schema is applied
        async with _pool.acquire() as con:
            schema_file = BASE_DIR / "schema.sql"
            if schema_file.exists():
                await con.execute(schema_file.read_text())
                logger.info("Database schema checked/ensured.")
            else:
                logger.warning("schema.sql not found at project root. Skipping initialization.")
        logger.info("Postgres connection pool established.")
    return _pool


async def close_pool():
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("Postgres connection pool closed.")
