"""
Advanced logging configuration
"""

import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

def setup_logger(
    name: str,
    level: str = "INFO",
    log_file: Optional[str] = None,
    format_string: Optional[str] = None
) -> logging.Logger:
    """Setup advanced logger with console and file output"""
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Default format
    if format_string is None:
        format_string = (
            "%(asctime)s | %(name)s | %(levelname)s | "
            "%(filename)s:%(lineno)d | %(message)s"
        )
    
    formatter = logging.Formatter(format_string)
    
    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(ColoredFormatter(format_string))
    logger.addHandler(console_handler)
    
    # File handler
    if log_file:
        # Ensure log directory exists
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

class ColoredFormatter(logging.Formatter):
    """Colored console formatter"""
    
    # Color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        # Add color to log level
        log_level = record.levelname
        if log_level in self.COLORS:
            record.levelname = f"{self.COLORS[log_level]}{log_level}{self.RESET}"
        
        # Format the message
        formatted = super().format(record)
        
        # Reset color at the end
        return f"{formatted}{self.RESET}"

# Performance logging utilities
class PerformanceLogger:
    """Logger for performance metrics"""
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.start_times = {}
    
    def start_timer(self, operation: str):
        """Start timing an operation"""
        self.start_times[operation] = datetime.now()
        self.logger.info(f"⏱️ Started: {operation}")
    
    def end_timer(self, operation: str):
        """End timing an operation"""
        if operation in self.start_times:
            duration = datetime.now() - self.start_times[operation]
            self.logger.info(f"✅ Completed: {operation} in {duration.total_seconds():.2f}s")
            del self.start_times[operation]
        else:
            self.logger.warning(f"⚠️ Timer not found for operation: {operation}")
    
    def log_memory_usage(self, operation: str = "Memory Usage"):
        """Log current memory usage"""
        try:
            import psutil
            process = psutil.Process()
            memory_mb = process.memory_info().rss / 1024 / 1024
            self.logger.info(f"💾 {operation}: {memory_mb:.1f} MB")
        except ImportError:
            self.logger.warning("psutil not available for memory logging")

# Request logging middleware
class RequestLogger:
    """Logger for API requests"""
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
    
    def log_request(self, method: str, path: str, client_ip: str):
        """Log incoming request"""
        self.logger.info(f"📥 {method} {path} from {client_ip}")
    
    def log_response(self, method: str, path: str, status_code: int, duration: float):
        """Log response"""
        status_emoji = "✅" if 200 <= status_code < 300 else "❌"
        self.logger.info(f"📤 {status_emoji} {method} {path} {status_code} ({duration:.2f}s)")
    
    def log_error(self, method: str, path: str, error: str):
        """Log request error"""
        self.logger.error(f"💥 {method} {path} - Error: {error}")

# WebSocket logging
class WebSocketLogger:
    """Logger for WebSocket connections"""
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
    
    def log_connection(self, client_id: str, client_ip: str):
        """Log WebSocket connection"""
        self.logger.info(f"🔌 WebSocket connected: {client_id} from {client_ip}")
    
    def log_disconnection(self, client_id: str, reason: str = "Unknown"):
        """Log WebSocket disconnection"""
        self.logger.info(f"🔌 WebSocket disconnected: {client_id} - {reason}")
    
    def log_message(self, client_id: str, message_type: str):
        """Log WebSocket message"""
        self.logger.debug(f"💬 WebSocket message: {client_id} - {message_type}")
    
    def log_error(self, client_id: str, error: str):
        """Log WebSocket error"""
        self.logger.error(f"💥 WebSocket error: {client_id} - {error}")