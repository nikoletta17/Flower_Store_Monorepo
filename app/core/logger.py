import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

def setup_logging():
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    log_file = log_dir / "app.log"

    # create a formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # console
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)

    # file
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=5_000_000, #5MB
        backupCount=5,
        encoding="utf-8"
    )

    file_handler.setFormatter(formatter)
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    if root_logger.handlers:
        return

    root_logger.addHandler(stream_handler)
    root_logger.addHandler(file_handler)