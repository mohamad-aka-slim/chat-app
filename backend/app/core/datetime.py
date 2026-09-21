from datetime import datetime, timezone


def ensure_utc(value: datetime) -> datetime:
    """Treat naive datetimes (SQLite CURRENT_TIMESTAMP) as UTC, else convert."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)