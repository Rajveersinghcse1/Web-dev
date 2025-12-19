import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ResumePreview from '../components/ResumePreview';
import ATSScore from '../components/ATSScore';
import { TEMPLATES } from '../lib/ResumeTemplates';
import { FileText, User, Mail, Phone, GraduationCap, Briefcase, Code, Download, LayoutTemplate } from 'lucide-react';

const PortfolioPage = () => {
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    experience: '',
    skills: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo({ ...studentInfo, [name]: value });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            ATS-Friendly Resume Builder
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Create a professional, ATS-optimized resume in minutes with our smart builder
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden h-fit">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      id="name" 
                      name="name" 
                      value={studentInfo.name} 
                      onChange={handleInputChange} 
                      className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      id="email" 
                      name="email" 
                      value={studentInfo.email} 
                      onChange={handleInputChange} 
                      className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={studentInfo.phone} 
                      onChange={handleInputChange} 
                      className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education" className="text-slate-700 font-medium">Education</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  <textarea 
                    id="education" 
                    name="education" 
                    value={studentInfo.education} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 p-3 min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    placeholder="University Name, Degree, Year"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-slate-700 font-medium">Experience</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  <textarea 
                    id="experience" 
                    name="experience" 
                    value={studentInfo.experience} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 p-3 min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    placeholder="Company Name, Role, Duration, Description"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-slate-700 font-medium">Skills</Label>
                <div className="relative">
                  <Code className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  <textarea 
                    id="skills" 
                    name="skills" 
                    value={studentInfo.skills} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 p-3 min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    placeholder="React, Node.js, Python, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-purple-600" />
                  Live Preview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    id="template"
                    className="p-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    {Object.keys(TEMPLATES).map((template) => (
                      <option key={template} value={template}>
                        {template.charAt(0).toUpperCase() + template.slice(1)} Template
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-slate-100/50 min-h-[500px]">
                <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                  <ResumePreview studentInfo={studentInfo} template={TEMPLATES[selectedTemplate]} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-slate-900">Analysis & Export</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <ATSScore studentInfo={studentInfo} />
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl h-12 text-lg font-medium transition-all duration-300">
                  <Download className="w-5 h-5 mr-2" />
                  Download Resume PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
