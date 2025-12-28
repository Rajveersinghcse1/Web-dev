// Privacy Filter - Removes PHI (Protected Health Information) from DICOM metadata

class PrivacyFilter {
    static sanitizeMetadata(metadata) {
        const sanitized = { ...metadata };

        // List of PHI fields to anonymize or remove
        const phiFields = [
            'patientName',
            'patientBirthDate',
            'patientAddress',
            'patientTelephoneNumbers',
            'patientMotherBirthName',
            'medicalRecordLocator',
            'ethnicGroup',
            'occupation',
            'additionalPatientHistory',
            'patientComments',
            'referringPhysicianName',
            'performingPhysicianName',
            'nameOfPhysiciansReadingStudy',
            'operatorsName',
            'institutionName',
            'institutionAddress',
            'stationName'
        ];

        // Anonymize PHI fields
        phiFields.forEach(field => {
            if (sanitized[field]) {
                delete sanitized[field];
            }
        });

        // Anonymize patient ID (keep format but hide actual value)
        if (sanitized.patientId) {
            sanitized.patientId = this.anonymizeId(sanitized.patientId);
        }

        // Anonymize dates (keep year only for age calculation)
        if (sanitized.studyDate) {
            sanitized.studyDate = this.anonymizeDate(sanitized.studyDate);
        }

        if (sanitized.patientBirthDate) {
            delete sanitized.patientBirthDate;
        }

        return sanitized;
    }

    static anonymizeId(id) {
        // Replace with asterisks, keep length
        if (!id) return 'ANONYMOUS';
        
        const length = id.length;
        if (length <= 4) {
            return '****';
        }
        
        // Show first and last character
        return id[0] + '*'.repeat(length - 2) + id[length - 1];
    }

    static anonymizeDate(dateStr) {
        // DICOM date format: YYYYMMDD
        if (!dateStr || dateStr.length < 4) {
            return 'XXXX-XX-XX';
        }

        // Keep year, anonymize month and day
        const year = dateStr.substring(0, 4);
        return `${year}-XX-XX`;
    }

    static detectPHI(text) {
        // Patterns for common PHI
        const patterns = [
            /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
            /\b\d{3}-\d{3}-\d{4}\b/g, // Phone number
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
            /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, // Date MM/DD/YYYY
            /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g // Names (simple pattern)
        ];

        let hasPHI = false;
        let sanitizedText = text;

        patterns.forEach(pattern => {
            if (pattern.test(text)) {
                hasPHI = true;
                sanitizedText = sanitizedText.replace(pattern, '[REDACTED]');
            }
        });

        return { hasPHI, sanitizedText };
    }

    static createAuditLog(action, metadata) {
        // Log anonymization actions for compliance
        const timestamp = new Date().toISOString();
        
        return {
            timestamp,
            action,
            studyUID: metadata.studyInstanceUID || 'unknown',
            seriesUID: metadata.seriesInstanceUID || 'unknown',
            modality: metadata.modality || 'unknown',
            fieldsAnonymized: this.getAnonymizedFields(metadata)
        };
    }

    static getAnonymizedFields(metadata) {
        const fields = [];
        
        if (metadata.patientName) fields.push('patientName');
        if (metadata.patientId) fields.push('patientId');
        if (metadata.patientBirthDate) fields.push('patientBirthDate');
        if (metadata.studyDate) fields.push('studyDate');
        
        return fields;
    }

    static isComplianceMode() {
        // Check if running in HIPAA compliance mode
        // This could be configured via environment or settings
        return true; // Default to privacy-safe mode
    }

    static getSafeDisplayValue(value, fieldName) {
        if (!this.isComplianceMode()) {
            return value;
        }

        // Determine if field contains PHI
        const phiFieldPatterns = {
            name: /name/i,
            id: /id|identifier/i,
            date: /date|birth/i,
            phone: /phone|telephone/i,
            address: /address/i,
            email: /email/i
        };

        for (const [type, pattern] of Object.entries(phiFieldPatterns)) {
            if (pattern.test(fieldName)) {
                switch (type) {
                    case 'name':
                        return '[ANONYMIZED]';
                    case 'id':
                        return this.anonymizeId(value);
                    case 'date':
                        return this.anonymizeDate(value);
                    default:
                        return '[REDACTED]';
                }
            }
        }

        return value;
    }
}
