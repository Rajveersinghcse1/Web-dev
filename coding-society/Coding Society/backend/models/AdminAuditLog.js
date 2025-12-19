/**
 * Admin Audit Log Model
 * Tracks all admin actions for security and compliance
 */

const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'update', 'delete', 'view',
      'login', 'logout',
      'role_change', 'status_change',
      'settings_update',
      'bulk_operation'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: [
      'user', 'library', 'innovation', 'internship', 
      'hackathon', 'quest', 'achievement', 'settings',
      'post', 'story', 'feedback', 'resume'
    ]
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed }
  },
  ipAddress: String,
  userAgent: String,
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
adminAuditLogSchema.index({ admin: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });
adminAuditLogSchema.index({ resourceType: 1, resourceId: 1 });
adminAuditLogSchema.index({ createdAt: -1 });

// Static method to log admin action
adminAuditLogSchema.statics.logAction = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent audit logging from breaking operations
    return null;
  }
};

// Method to get audit logs with filters
adminAuditLogSchema.statics.getAuditLogs = async function(filters = {}, options = {}) {
  const {
    adminId,
    action,
    resourceType,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = filters;

  const query = {};
  if (adminId) query.admin = adminId;
  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    this.find(query)
      .populate('admin', 'username email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ]);

  return {
    logs,
    pagination: {
      current: page,
      total: Math.ceil(total / limit),
      count: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
