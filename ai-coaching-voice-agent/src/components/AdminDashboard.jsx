'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Activity,
  FileText,
  Settings,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Lock,
  Unlock,
  Database,
  Palette,
  Bell,
  TrendingUp,
  Zap,
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronRight,
  Server
} from 'lucide-react';
import {
  useEnterpriseStore,
  useEnterpriseActions,
  useAdminMode,
  useSystemMonitor,
  useWhiteLabelManager,
} from '@/lib/enterpriseFeatures';
import { useToast } from '@/hooks/useToast';

/**
 * Admin Dashboard
 * Comprehensive system management interface
 * Modernized with glassmorphism and advanced animations
 */

// ==================== ADMIN LOGIN ====================

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toggleAdminMode } = useEnterpriseActions();
  const { toast } = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    
    const success = toggleAdminMode(password);
    
    if (success) {
      toast({
        title: 'Admin Access Granted',
        description: 'Welcome to the admin dashboard',
      });
      onLogin();
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid admin password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white backdrop-blur-xl border border-gray-300 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/50 relative z-10"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="p-4 bg-violet-500/20 rounded-2xl border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Shield className="h-12 w-12 text-violet-400" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-2 text-black">Admin Access</h2>
        <p className="text-gray-800 text-center mb-8">
          Enter your secure admin password to continue
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 pr-10 transition-all"
                placeholder="Enter admin password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Default: admin123
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full px-4 py-3 bg-violet-600 text-black rounded-xl hover:bg-violet-500 transition-all font-bold shadow-lg shadow-violet-500/20"
          >
            Login to Dashboard
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// ==================== STAT CARD ====================

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, delay }) => {
  const colorClasses = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const activeColor = colorClasses[color] || colorClasses.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white backdrop-blur-md border border-gray-300 rounded-2xl p-6 shadow-lg hover:bg-white transition-all group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-3xl font-bold mt-2 text-black tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-700 mt-1">{subtitle}</p>
          )}
          {trend && <div className="mt-3">{trend}</div>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${activeColor.split(' ')[1]} border ${activeColor.split(' ')[2]} group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 ${activeColor.split(' ')[0]}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ==================== AUDIT LOGS VIEW ====================

const AuditLogsView = () => {
  const { auditLogger } = useEnterpriseStore();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState({ category: '', severity: '' });

  useEffect(() => {
    if (auditLogger) {
      const filtered = auditLogger.getLogs(filter);
      setLogs(filtered.slice(0, 50)); // Show latest 50
    }
  }, [auditLogger, filter]);

  const severityColors = {
    info: 'border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10',
    warning: 'border-l-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10',
    error: 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10',
    critical: 'border-l-purple-500 bg-purple-500/5 hover:bg-purple-500/10',
  };

  const categoryIcons = {
    general: Activity,
    auth: Lock,
    data: Database,
    admin: Shield,
    system: Settings,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-white backdrop-blur-sm p-4 rounded-2xl border border-gray-300">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-300 transition-colors">
          <Filter className="w-4 h-4 text-gray-800" />
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-black focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-gray-900">All Categories</option>
            <option value="general" className="bg-gray-900">General</option>
            <option value="auth" className="bg-gray-900">Authentication</option>
            <option value="data" className="bg-gray-900">Data</option>
            <option value="admin" className="bg-gray-900">Admin</option>
            <option value="system" className="bg-gray-900">System</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-300 transition-colors">
          <AlertTriangle className="w-4 h-4 text-gray-800" />
          <select
            value={filter.severity}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-black focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-gray-900">All Severities</option>
            <option value="info" className="bg-gray-900">Info</option>
            <option value="warning" className="bg-gray-900">Warning</option>
            <option value="error" className="bg-gray-900">Error</option>
            <option value="critical" className="bg-gray-900">Critical</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {logs.map((log, i) => {
            const Icon = categoryIcons[log.category] || Activity;
            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={log.id}
                className={`p-4 border-l-4 rounded-r-xl ${severityColors[log.severity]} transition-all border-gray-300`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <p className="font-bold text-black">{log.action}</p>
                      <p className="text-sm text-gray-800 mt-1">
                        User: {log.userName} <span className="opacity-60">({log.userId})</span>
                      </p>
                      {Object.keys(log.details).length > 0 && (
                        <div className="mt-2 p-2 bg-white rounded text-xs font-mono text-black/70 border border-gray-300">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-black/50">
                    <p className="font-medium text-black">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p className="capitalize mt-1 px-2 py-0.5 bg-gray-100 rounded-full inline-block text-black/70">
                      {log.category}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700">No audit logs found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== SYSTEM HEALTH VIEW ====================

const SystemHealthView = () => {
  const systemMonitor = useSystemMonitor();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    if (systemMonitor) {
      const report = systemMonitor.getHealthReport();
      setHealth(report);
    }

    const interval = setInterval(() => {
      if (systemMonitor) {
        const report = systemMonitor.getHealthReport();
        setHealth(report);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [systemMonitor]);

  if (!health) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        <span className="ml-3 text-gray-800">Monitoring system health...</span>
      </div>
    );
  }

  const statusConfig = {
    healthy: { color: 'text-emerald-400', bg: 'bg-emerald-500', icon: CheckCircle, label: 'Healthy' },
    warning: { color: 'text-yellow-400', bg: 'bg-yellow-500', icon: AlertTriangle, label: 'Warning' },
    critical: { color: 'text-red-400', bg: 'bg-red-500', icon: XCircle, label: 'Critical' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Status */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="col-span-full p-6 bg-white backdrop-blur-md rounded-2xl border border-gray-300 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${statusConfig[health.status].bg}/20 border ${statusConfig[health.status].bg}/30`}>
            <Activity className={`w-8 h-8 ${statusConfig[health.status].color}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black">System Status: {statusConfig[health.status].label}</h3>
            <p className="text-gray-800">Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-700">Uptime</p>
          <p className="text-2xl font-mono font-bold text-black">{health.uptime}</p>
        </div>
      </motion.div>

      {/* Metrics */}
      <HealthMetric 
        label="CPU Usage" 
        value={health.cpu} 
        icon={Zap} 
        color="violet"
        delay={0.1}
      />
      <HealthMetric 
        label="Memory Usage" 
        value={health.memory} 
        icon={Database} 
        color="blue"
        delay={0.2}
      />
      <HealthMetric 
        label="API Latency" 
        value={health.latency} 
        icon={Clock} 
        color="emerald"
        delay={0.3}
      />
      <HealthMetric 
        label="Error Rate" 
        value={health.errorRate} 
        icon={AlertTriangle} 
        color="rose"
        delay={0.4}
      />
    </div>
  );
};

const HealthMetric = ({ label, value, icon: Icon, color, delay }) => {
  const colors = {
    violet: 'text-violet-400 bg-violet-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 bg-white rounded-2xl border border-gray-300 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-black">{value}</span>
        <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors[color].replace('text-', 'bg-').replace('/20', '')}`} 
            style={{ width: typeof value === 'string' && value.includes('%') ? value : '50%' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const { isAdminMode } = useAdminMode();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAdminMode) {
    return <AdminLogin onLogin={() => {}} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-violet-400" />
            </div>
            Admin Console
          </h1>
          <p className="text-gray-800 mt-2 ml-1">
            System management and monitoring
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white backdrop-blur-sm rounded-xl border border-gray-300 w-fit">
        <TabButton 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
          icon={<BarChart3 className="w-4 h-4" />} 
          label="Overview" 
        />
        <TabButton 
          active={activeTab === 'audit'} 
          onClick={() => setActiveTab('audit')} 
          icon={<FileText className="w-4 h-4" />} 
          label="Audit Logs" 
        />
        <TabButton 
          active={activeTab === 'health'} 
          onClick={() => setActiveTab('health')} 
          icon={<Activity className="w-4 h-4" />} 
          label="System Health" 
        />
        <TabButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={<Settings className="w-4 h-4" />} 
          label="Settings" 
        />
      </div>

      {/* Content */}
      <motion.div 
        layout
        className="min-h-[500px] bg-white backdrop-blur-xl rounded-3xl border border-gray-300 p-6 relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard 
                title="Total Users" 
                value="1,234" 
                subtitle="+12% this month" 
                icon={Users} 
                color="violet" 
                delay={0.1} 
              />
              <StatCard 
                title="Active Sessions" 
                value="56" 
                subtitle="Currently running" 
                icon={Zap} 
                color="blue" 
                delay={0.2} 
              />
              <StatCard 
                title="System Health" 
                value="98.5%" 
                subtitle="Uptime" 
                icon={Activity} 
                color="emerald" 
                delay={0.3} 
              />
              <StatCard 
                title="Security Alerts" 
                value="0" 
                subtitle="No active threats" 
                icon={Shield} 
                color="rose" 
                delay={0.4} 
              />
            </motion.div>
          )}
          
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AuditLogsView />
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SystemHealthView />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center py-12"
            >
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black">Settings Configuration</h3>
              <p className="text-gray-700 mt-2">Global system settings and white-label configuration coming soon.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium relative
        ${active
          ? 'text-black bg-gray-100 shadow-sm'
          : 'text-gray-800 hover:text-black hover:bg-white'
        }
      `}
    >
      {active && (
        <motion.div
          layoutId="activeTabAdmin"
          className="absolute inset-0 bg-gray-100 rounded-lg"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  );
}


