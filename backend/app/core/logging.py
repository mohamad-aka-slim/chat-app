from pathlib import Path

from loguru import logger

from app.core.config import settings


def setup_logging() -> None:
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    logger.remove()
    logger.add(
        log_dir / "app.log",
        rotation="500 MB",
        retention="10 days",
        level=settings.log_level,
    )