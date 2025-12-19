const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Coding Society'
  },
  siteDescription: {
    type: String,
    default: 'The Ultimate Gamified Learning Platform'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  features: {
    gamification: { type: Boolean, default: true },
    blog: { type: Boolean, default: true },
    forums: { type: Boolean, default: true },
    jobs: { type: Boolean, default: true }
  },
  emailSettings: {
    supportEmail: { type: String, default: 'support@codingsociety.com' },
    notificationsEnabled: { type: Boolean, default: true }
  },
  socialLinks: {
    github: String,
    twitter: String,
    linkedin: String,
    discord: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
