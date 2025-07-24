const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create subdirectories for different log types
const securityLogsDir = path.join(logsDir, 'security');
const auditLogsDir = path.join(logsDir, 'audit');
const errorLogsDir = path.join(logsDir, 'errors');

[securityLogsDir, auditLogsDir, errorLogsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Get current log level from environment
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL] || 
    (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);

// Format timestamp
const getTimestamp = () => {
    return new Date().toISOString();
};

// Generate unique log ID for correlation
const generateLogId = () => {
    return crypto.randomBytes(8).toString('hex');
};

// Format log message with enhanced structure
const formatMessage = (level, message, meta = {}) => {
    const timestamp = getTimestamp();
    const logId = generateLogId();

    const logEntry = {
        id: logId,
        timestamp,
        level,
        message,
        pid: process.pid,
        hostname: require('os').hostname(),
        ...meta
    };

    return JSON.stringify(logEntry);
};

// Write to file (async) with rotation support
const writeToFile = (level, message, subDir = '') => {
    const logDir = subDir ? path.join(logsDir, subDir) : logsDir;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(logDir, `${level.toLowerCase()}-${date}.log`);
    const formattedMessage = `${message}\n`;

    fs.appendFile(logFile, formattedMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });

    // Rotate logs if file gets too large (10MB)
    fs.stat(logFile, (err, stats) => {
        if (!err && stats.size > 10 * 1024 * 1024) {
            const rotatedFile = `${logFile}.${Date.now()}`;
            fs.rename(logFile, rotatedFile, (renameErr) => {
                if (renameErr) {
                    console.error('Failed to rotate log file:', renameErr);
                }
            });
        }
    });
};

// Logger class
class Logger {
    error(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.ERROR) {
            const formattedMessage = formatMessage('ERROR', message, meta);
            console.error(formattedMessage);
            
            if (process.env.NODE_ENV === 'production') {
                writeToFile('ERROR', formattedMessage);
            }
        }
    }

    warn(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.WARN) {
            const formattedMessage = formatMessage('WARN', message, meta);
            console.warn(formattedMessage);
            
            if (process.env.NODE_ENV === 'production') {
                writeToFile('WARN', formattedMessage);
            }
        }
    }

    info(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.INFO) {
            const formattedMessage = formatMessage('INFO', message, meta);
            console.log(formattedMessage);
            
            if (process.env.NODE_ENV === 'production') {
                writeToFile('INFO', formattedMessage);
            }
        }
    }

    debug(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.DEBUG) {
            const formattedMessage = formatMessage('DEBUG', message, meta);
            console.log(formattedMessage);
            
            // Only log debug messages to file in development
            if (process.env.NODE_ENV === 'development') {
                writeToFile('DEBUG', formattedMessage);
            }
        }
    }

    // Security-specific logging
    security(message, meta = {}) {
        const enhancedMeta = {
            ...meta,
            severity: meta.severity || 'MEDIUM',
            category: 'SECURITY'
        };

        const formattedMessage = formatMessage('SECURITY', message, enhancedMeta);
        console.warn(formattedMessage);

        // Always log security events to dedicated security log
        writeToFile('SECURITY', formattedMessage, 'security');

        // Also log high severity events to main error log
        if (enhancedMeta.severity === 'HIGH' || enhancedMeta.severity === 'CRITICAL') {
            writeToFile('ERROR', formattedMessage, 'errors');
        }
    }

    // Audit logging for compliance and tracking
    audit(action, meta = {}) {
        const auditMeta = {
            ...meta,
            action,
            category: 'AUDIT',
            timestamp: new Date().toISOString()
        };

        const formattedMessage = formatMessage('AUDIT', `Action: ${action}`, auditMeta);
        console.log(formattedMessage);

        // Always log audit events
        writeToFile('AUDIT', formattedMessage, 'audit');
    }

    // Performance logging
    performance(operation, duration, meta = {}) {
        const perfMeta = {
            ...meta,
            operation,
            duration: `${duration}ms`,
            category: 'PERFORMANCE'
        };

        const formattedMessage = formatMessage('PERFORMANCE', `${operation} completed in ${duration}ms`, perfMeta);

        // Only log slow operations in production
        if (process.env.NODE_ENV === 'production' && duration > 1000) {
            console.warn(formattedMessage);
            writeToFile('PERFORMANCE', formattedMessage);
        } else if (process.env.NODE_ENV === 'development') {
            console.log(formattedMessage);
        }
    }

    // Database operation logging
    database(operation, meta = {}) {
        const dbMeta = {
            ...meta,
            operation,
            category: 'DATABASE'
        };

        const formattedMessage = formatMessage('DATABASE', `DB Operation: ${operation}`, dbMeta);

        if (process.env.NODE_ENV === 'development') {
            console.log(formattedMessage);
        }

        writeToFile('DATABASE', formattedMessage);
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
