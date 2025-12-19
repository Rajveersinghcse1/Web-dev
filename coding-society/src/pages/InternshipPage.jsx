import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { useMode } from '../context/ModeContext';
import studentService from '../services/studentService';
import {
  Trophy, Users, Calendar, MapPin, Clock, Search, Star, Share, Bookmark,
  ExternalLink, TrendingUp, Award, Globe, Rocket, CheckCircle, FileText,
  Building, Plus, Phone, Filter, GitBranch, Zap, Target, Layout,
  Briefcase, GraduationCap, DollarSign, Upload, BriefcaseBusiness, ArrowRight, Sparkles
} from 'lucide-react';

const InternshipPage = () => {
  const { mode } = useMode();
  const isProfessional = mode === 'professional';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('opportunities');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // State for dynamic data
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    companies: 0,
    avgCompensation: 0
  });

  // Load data based on mode
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (isProfessional) {
          // Mock Professional Data
          const mockJobs = [
            {
              id: 101,
              title: 'Senior Full Stack Developer',
              company: 'TechCorp Solutions',
              logo: '🏢',
              location: 'Remote / New York, NY',
              type: 'Full-time',
              compensation: '$140k - $180k',
              posted: '2 days ago',
              applicants: 45,
              skills: ['React', 'Node.js', 'AWS', 'System Design'],
              description: 'Leading the development of our core SaaS platform. You will architect scalable solutions and mentor junior developers.',
              requirements: ['5+ years experience', 'Strong architectural skills', 'Experience with microservices'],
              featured: true,
              level: 'Senior',
              benefits: ['Equity', 'Unlimited PTO', 'Health Insurance'],
              status: 'open'
            },
            {
              id: 102,
              title: 'DevOps Engineer',
              company: 'CloudSystems Inc',
              logo: '☁️',
              location: 'Austin, TX',
              type: 'Full-time',
              compensation: '$130k - $160k',
              posted: '1 week ago',
              applicants: 28,
              skills: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
              description: 'Build and maintain our cloud infrastructure. Automate deployment pipelines and ensure high availability.',
              requirements: ['3+ years DevOps experience', 'AWS Certified', 'Python/Go scripting'],
              featured: false,
              level: 'Mid-Senior',
              benefits: ['Remote work', 'Learning budget', '401k match'],
              status: 'open'
            },
            {
              id: 103,
              title: 'Product Manager',
              company: 'InnovateAI',
              logo: '🤖',
              location: 'San Francisco, CA',
              type: 'Full-time',
              compensation: '$150k - $190k',
              posted: '3 days ago',
              applicants: 112,
              skills: ['Product Strategy', 'Agile', 'Data Analysis', 'UX'],
              description: 'Drive the product vision for our AI-powered analytics tool. Work closely with engineering and design teams.',
              requirements: ['4+ years PM experience', 'Technical background preferred', 'Startup experience'],
              featured: true,
              level: 'Senior',
              benefits: ['Stock options', 'Catered lunches', 'Gym stipend'],
              status: 'open'
            }
          ];
          
          setOpportunities(mockJobs);
          setStats({
            total: 1240,
            open: 850,
            companies: 320,
            avgCompensation: 145000
          });
          
        } else {
          // Student Mode - Try to fetch from service, fallback to mock
          try {
            const response = await studentService.getInternships();
            if (response.success && response.data) {
              const internshipsData = response.data.internships || [];
              setOpportunities(internshipsData);
              // Calculate stats
              const open = internshipsData.filter(i => i.status === 'open').length;
              const uniqueCompanies = new Set(internshipsData.map(i => i.company)).size;
              const avg = internshipsData.reduce((sum, i) => sum + (i.stipend || 0), 0) / (internshipsData.length || 1);
              
              setStats({
                total: internshipsData.length,
                open: open,
                companies: uniqueCompanies,
                avgCompensation: Math.round(avg)
              });
            } else {
              throw new Error('No data');
            }
          } catch (err) {
            // Fallback Student Data
            const fallbackInternships = [
              {
                id: 1,
                title: 'Software Engineering Intern',
                company: 'Google',
                logo: '🟡',
                location: 'Mountain View, CA',
                type: 'Internship',
                compensation: '$8,500/month',
                posted: '2 days ago',
                applicants: 1250,
                skills: ['Python', 'Java', 'React', 'Machine Learning'],
                description: 'Work on cutting-edge projects that impact billions of users.',
                requirements: ['CS major', '3.5+ GPA', 'Strong coding skills'],
                featured: true,
                level: 'Entry',
                benefits: ['Housing stipend', 'Free meals', 'Mentorship'],
                status: 'open'
              },
              {
                id: 2,
                title: 'Product Management Intern',
                company: 'Meta',
                logo: '🔵',
                location: 'Menlo Park, CA',
                type: 'Internship',
                compensation: '$8,000/month',
                posted: '5 days ago',
                applicants: 980,
                skills: ['Product Sense', 'Data Analysis', 'Communication'],
                description: 'Help define and drive the future of social connection.',
                requirements: ['Leadership experience', 'Analytical mindset'],
                featured: true,
                level: 'Entry',
                benefits: ['Housing', 'Events', 'Networking'],
                status: 'open'
              }
            ];
            setOpportunities(fallbackInternships);
            setStats({ total: 235, open: 156, companies: 85, avgCompensation: 7200 });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load opportunities.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isProfessional]);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.skills && item.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Filter by status/type
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'open') {
        filtered = filtered.filter(i => i.status === 'open');
      } else if (selectedFilter === 'featured') {
        filtered = filtered.filter(i => i.featured);
      } else if (selectedFilter === 'remote') {
        filtered = filtered.filter(i => i.location.toLowerCase().includes('remote'));
      }
    }

    return filtered;
  }, [opportunities, searchTerm, selectedFilter]);

  // Helper functions
  function getStatusColor(status) {
    const colorMap = {
      'open': 'bg-emerald-100 text-emerald-800',
      'closed': 'bg-red-100 text-red-800',
      'interviewing': 'bg-purple-100 text-purple-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  function getLevelColor(level) {
    const colorMap = {
      'Entry': 'bg-blue-100 text-blue-800',
      'Mid-Senior': 'bg-yellow-100 text-yellow-800',
      'Senior': 'bg-purple-100 text-purple-800'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
  }

  const renderOpportunityCard = (item) => {
    return (
      <div 
        key={item.id} 
        className={`group bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden ${
          item.featured ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
        }`}
        onClick={() => alert(`Viewing details for ${item.title}`)}
      >
        <div className="p-6">
          {/* Featured badge */}
          {item.featured && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs px-4 py-1 rounded-bl-2xl font-bold shadow-sm z-10">
              ⭐ Featured
            </div>
          )}

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20 text-white">
                {item.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-blue-600 font-bold mb-2">
                  {item.company}
                </p>
                
                {/* Key details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    {item.type}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3" />
                    {item.posted}
                  </span>
                </div>

                {/* Status and Level badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(item.status)}`}>
                    {item.status === 'open' ? 'Open' : item.status}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${getLevelColor(item.level)}`}>
                    {item.level}
                  </span>
                </div>

                {/* Compensation */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold text-lg">{item.compensation}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-lg">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-600">
                  {item.applicants} applicants
                </span>
              </div>
            </div>
          </div>
        
          {/* Description */}
          <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Skills/Tags */}
          {item.skills && item.skills.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {item.skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                    {skill}
                  </span>
                ))}
                {item.skills.length > 4 && (
                  <span className="text-xs px-3 py-1 bg-gray-50 text-gray-500 rounded-full font-medium border border-gray-100">
                    +{item.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
            <Button 
              className={`flex-1 rounded-xl font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white`}
              onClick={(e) => { e.stopPropagation(); alert('Applying...'); }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Apply Now
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); alert('Bookmarked!'); }}>
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); alert('Shared!'); }}>
              <Share className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-sans pb-20 ${isProfessional ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header Section */}
      <div className={`${isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b pt-24 pb-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className={`inline-flex items-center justify-center p-3 rounded-2xl mb-6 shadow-inner ${isProfessional ? 'bg-purple-900/30' : 'bg-blue-100'}`}>
            <Briefcase className={`w-8 h-8 ${isProfessional ? 'text-purple-400' : 'text-blue-600'}`} />
          </div>
          <h1 className={`text-5xl font-extrabold mb-4 tracking-tight ${isProfessional ? 'text-white' : 'text-gray-900'}`}>
            {isProfessional ? 'Career' : 'Internship'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hub</span>
          </h1>
          <p className={`text-xl max-w-2xl mx-auto mb-8 leading-relaxed ${isProfessional ? 'text-slate-400' : 'text-gray-600'}`}>
            {isProfessional 
              ? 'Find your next career move with top tech companies and startups.' 
              : 'Kickstart your career with world-class internships and opportunities.'}
          </p>
          
          {/* Search & Filter Bar */}
          <div className={`max-w-3xl mx-auto p-2 rounded-2xl shadow-xl border flex flex-col sm:flex-row gap-2 ${isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={isProfessional ? "Search jobs, companies..." : "Search internships, roles..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 h-12 border-none rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none ${
                  isProfessional ? 'bg-slate-900 text-white focus:bg-slate-800' : 'bg-gray-50 text-gray-900 focus:bg-white'
                }`}
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`h-12 px-4 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-colors ${
                  isProfessional ? 'bg-slate-900 text-slate-300 hover:bg-slate-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <option value="all">All Roles</option>
                <option value="open">Open Now</option>
                <option value="featured">Featured</option>
                <option value="remote">Remote</option>
              </select>
              <Button 
                className={`h-12 px-6 rounded-xl font-bold shadow-lg ${
                  isProfessional ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-900/20'
                }`}
                onClick={() => alert('Post Opportunity modal would open here!')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: isProfessional ? 'Active Jobs' : 'Total Internships', value: stats.total, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Open Positions', value: stats.open, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Avg Compensation', value: `$${stats.avgCompensation.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Hiring Companies', value: stats.companies, icon: Building, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map((stat, index) => (
            <div key={index} className={`p-6 rounded-3xl border shadow-xl flex items-center gap-4 hover:scale-105 transition-transform duration-300 ${
              isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isProfessional ? 'bg-slate-700' : stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${isProfessional ? 'text-white' : stat.color}`}>{stat.value}</div>
                <div className={`text-xs font-bold uppercase tracking-wider ${isProfessional ? 'text-slate-400' : 'text-gray-400'}`}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {/* Custom Tabs */}
            <div className={`flex items-center gap-2 mb-8 p-1.5 rounded-2xl border shadow-sm w-fit ${
              isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
            }`}>
              {[
                { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
                { id: 'resources', label: 'Resources', icon: FileText },
                { id: 'stories', label: 'Success Stories', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : isProfessional ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {selectedTab === 'opportunities' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${isProfessional ? 'text-white' : 'text-gray-900'}`}>
                    Latest Opportunities
                  </h2>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    isProfessional ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {filteredOpportunities.length} roles found
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {filteredOpportunities.map(renderOpportunityCard)}
                </div>

                {filteredOpportunities.length === 0 && (
                  <div className={`text-center py-20 rounded-3xl border shadow-xl ${
                    isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
                  }`}>
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
                      isProfessional ? 'bg-slate-700' : 'bg-gray-50'
                    }`}>
                      <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isProfessional ? 'text-white' : 'text-gray-900'}`}>No opportunities found</h3>
                    <p className={`mb-8 ${isProfessional ? 'text-slate-400' : 'text-gray-500'}`}>Try adjusting your search terms or filters</p>
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedFilter('all');
                      }}
                      className="bg-blue-600 text-white rounded-xl px-8 py-3 font-bold hover:bg-blue-700"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Placeholder for other tabs */}
            {selectedTab !== 'opportunities' && (
              <div className={`text-center py-20 rounded-3xl border shadow-xl ${
                isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-xl font-bold mb-2 ${isProfessional ? 'text-white' : 'text-gray-900'}`}>Coming Soon</h3>
                <p className={`mb-8 ${isProfessional ? 'text-slate-400' : 'text-gray-500'}`}>This section is under development.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Application Timeline */}
            <div className={`rounded-3xl border shadow-xl p-6 ${
              isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
            }`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 ${isProfessional ? 'text-white' : 'text-gray-900'}`}>
                <Clock className="w-5 h-5 text-blue-600" />
                Deadlines
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Google Summer Intern', time: '2 days left', color: 'text-red-500' },
                  { name: 'Microsoft PM', time: '1 week left', color: 'text-orange-500' },
                  { name: 'Amazon SDE', time: '3 weeks left', color: 'text-emerald-500' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${
                    isProfessional ? 'bg-slate-700' : 'bg-gray-50'
                  }`}>
                    <span className={`text-sm font-medium ${isProfessional ? 'text-slate-300' : 'text-gray-700'}`}>{item.name}</span>
                    <span className={`text-xs font-bold ${item.color}`}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Builder Promo */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10">
                <FileText className="w-5 h-5" />
                Resume Builder
              </h3>
              <p className="text-purple-100 text-sm mb-6 relative z-10 leading-relaxed">
                Create an ATS-friendly resume in minutes and increase your chances of getting hired.
              </p>
              <Button 
                className="w-full bg-white text-purple-600 hover:bg-purple-50 font-bold rounded-xl shadow-lg relative z-10"
                onClick={() => alert('Resume Builder would open here!')}
              >
                Build Resume
              </Button>
            </div>

            {/* Quick Actions */}
            <div className={`rounded-3xl border shadow-xl p-6 ${
              isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
            }`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 ${isProfessional ? 'text-white' : 'text-gray-900'}`}>
                <Rocket className="w-5 h-5 text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button 
                  className={`w-full rounded-xl font-bold justify-start h-12 ${
                    isProfessional ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  onClick={() => alert('Post Opportunity modal would open here!')}
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Post Job
                </Button>
                <Button 
                  variant="outline" 
                  className={`w-full rounded-xl font-bold justify-start h-12 ${
                    isProfessional ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => alert('My Applications page would open here!')}
                >
                  <Briefcase className="w-4 h-4 mr-3" />
                  My Applications
                </Button>
                <Button 
                  variant="outline" 
                  className={`w-full rounded-xl font-bold justify-start h-12 ${
                    isProfessional ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => alert('Saved Jobs page would open here!')}
                >
                  <Bookmark className="w-4 h-4 mr-3" />
                  Saved Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipPage;
