import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Download, FileText, Plus, Trash2, Eye, Save } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const ATSResumeBuilder = () => {
  const resumeRef = useRef();
  
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      github: '',
      portfolio: ''
    },
    objective: '',
    education: [
      {
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: '',
        relevantCoursework: ''
      }
    ],
    skills: {
      technical: [],
      languages: [],
      tools: []
    },
    projects: [
      {
        title: '',
        description: '',
        technologies: '',
        link: '',
        duration: ''
      }
    ],
    internships: [
      {
        title: '',
        company: '',
        location: '',
        duration: '',
        description: ''
      }
    ],
    achievements: [
      {
        title: '',
        description: '',
        date: ''
      }
    ]
  });

  const [activeTab, setActiveTab] = useState('form');
  const [newSkill, setNewSkill] = useState({ technical: '', languages: '', tools: '' });

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (index !== null) {
        newData[section][index][field] = value;
      } else if (typeof newData[section] === 'object' && !Array.isArray(newData[section])) {
        newData[section][field] = value;
      } else {
        newData[section] = value;
      }
      
      return newData;
    });
  };

  const addSection = (section) => {
    setFormData(prev => ({
      ...prev,
      [section]: [
        ...prev[section],
        section === 'education' 
          ? { degree: '', institution: '', location: '', graduationDate: '', gpa: '', relevantCoursework: '' }
          : section === 'projects'
          ? { title: '', description: '', technologies: '', link: '', duration: '' }
          : section === 'internships'
          ? { title: '', company: '', location: '', duration: '', description: '' }
          : { title: '', description: '', date: '' }
      ]
    }));
  };

  const removeSection = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const addSkill = (type) => {
    if (newSkill[type].trim()) {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [type]: [...prev.skills[type], newSkill[type].trim()]
        }
      }));
      setNewSkill(prev => ({ ...prev, [type]: '' }));
    }
  };

  const removeSkill = (type, index) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter((_, i) => i !== index)
      }
    }));
  };

  const downloadAsPDF = async () => {
    const element = resumeRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${formData.personalInfo.fullName || 'Resume'}_ATS.pdf`);
  };

  const downloadAsDOCX = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Personal Info
          new Paragraph({
            children: [
              new TextRun({
                text: formData.personalInfo.fullName,
                bold: true,
                size: 32
              })
            ],
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph({
            children: [
              new TextRun(`${formData.personalInfo.email} | ${formData.personalInfo.phone} | ${formData.personalInfo.location}`)
            ]
          }),
          new Paragraph({
            children: [
              new TextRun(`LinkedIn: ${formData.personalInfo.linkedIn} | GitHub: ${formData.personalInfo.github}`)
            ]
          }),
          
          // Objective
          ...(formData.objective ? [
            new Paragraph({ children: [new TextRun({ text: "OBJECTIVE", bold: true, size: 24 })] }),
            new Paragraph({ children: [new TextRun(formData.objective)] })
          ] : []),
          
          // Education
          new Paragraph({ children: [new TextRun({ text: "EDUCATION", bold: true, size: 24 })] }),
          ...formData.education.map(edu => new Paragraph({
            children: [new TextRun(`${edu.degree} - ${edu.institution}, ${edu.location} (${edu.graduationDate})`)]
          })),
          
          // Skills
          new Paragraph({ children: [new TextRun({ text: "TECHNICAL SKILLS", bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun(`Technical: ${formData.skills.technical.join(', ')}`)] }),
          new Paragraph({ children: [new TextRun(`Languages: ${formData.skills.languages.join(', ')}`)] }),
          new Paragraph({ children: [new TextRun(`Tools: ${formData.skills.tools.join(', ')}`)] }),
          
          // Projects
          ...(formData.projects.some(p => p.title) ? [
            new Paragraph({ children: [new TextRun({ text: "PROJECTS", bold: true, size: 24 })] }),
            ...formData.projects.filter(p => p.title).map(project => 
              new Paragraph({ children: [new TextRun(`${project.title}: ${project.description}`)] })
            )
          ] : [])
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `${formData.personalInfo.fullName || 'Resume'}_ATS.docx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ATS Resume Builder</h1>
          <p className="text-lg text-gray-600">Create ATS-optimized resumes that pass through applicant tracking systems</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Build Resume
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview & Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.personalInfo.fullName}
                      onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      placeholder="john.doe@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.personalInfo.location}
                      onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input
                      id="linkedIn"
                      value={formData.personalInfo.linkedIn}
                      onChange={(e) => handleInputChange('personalInfo', 'linkedIn', e.target.value)}
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={formData.personalInfo.github}
                      onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                      placeholder="github.com/johndoe"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Objective */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Objective</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="objective">Objective</Label>
                  <textarea
                    id="objective"
                    className="w-full mt-1 p-2 border rounded-md resize-none"
                    rows="4"
                    value={formData.objective}
                    onChange={(e) => handleInputChange('objective', null, e.target.value)}
                    placeholder="Write a brief professional objective (2-3 sentences)"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Education
                  <Button onClick={() => addSection('education')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      {formData.education.length > 1 && (
                        <Button 
                          onClick={() => removeSection('education', index)} 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                          placeholder="Bachelor of Science in Computer Science"
                        />
                      </div>
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                          placeholder="University Name"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={edu.location}
                          onChange={(e) => handleInputChange('education', 'location', e.target.value, index)}
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <Label>Graduation Date</Label>
                        <Input
                          value={edu.graduationDate}
                          onChange={(e) => handleInputChange('education', 'graduationDate', e.target.value, index)}
                          placeholder="May 2024"
                        />
                      </div>
                      <div>
                        <Label>GPA (Optional)</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => handleInputChange('education', 'gpa', e.target.value, index)}
                          placeholder="3.8/4.0"
                        />
                      </div>
                      <div>
                        <Label>Relevant Coursework</Label>
                        <Input
                          value={edu.relevantCoursework}
                          onChange={(e) => handleInputChange('education', 'relevantCoursework', e.target.value, index)}
                          placeholder="Data Structures, Algorithms, Web Development"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technical Skills */}
                <div>
                  <Label>Technical Skills</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSkill.technical}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, technical: e.target.value }))}
                      placeholder="Add technical skill"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill('technical')}
                    />
                    <Button onClick={() => addSkill('technical')}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.technical.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button onClick={() => removeSkill('technical', index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Programming Languages */}
                <div>
                  <Label>Programming Languages</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSkill.languages}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, languages: e.target.value }))}
                      placeholder="Add programming language"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill('languages')}
                    />
                    <Button onClick={() => addSkill('languages')}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.languages.map((skill, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button onClick={() => removeSkill('languages', index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tools & Technologies */}
                <div>
                  <Label>Tools & Technologies</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSkill.tools}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, tools: e.target.value }))}
                      placeholder="Add tool or technology"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill('tools')}
                    />
                    <Button onClick={() => addSkill('tools')}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.tools.map((skill, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button onClick={() => removeSkill('tools', index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Projects
                  <Button onClick={() => addSection('projects')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.projects.map((project, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      {formData.projects.length > 1 && (
                        <Button 
                          onClick={() => removeSection('projects', index)} 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Project Title</Label>
                        <Input
                          value={project.title}
                          onChange={(e) => handleInputChange('projects', 'title', e.target.value, index)}
                          placeholder="E-commerce Website"
                        />
                      </div>
                      <div>
                        <Label>Technologies Used</Label>
                        <Input
                          value={project.technologies}
                          onChange={(e) => handleInputChange('projects', 'technologies', e.target.value, index)}
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>
                      <div>
                        <Label>Project Link (Optional)</Label>
                        <Input
                          value={project.link}
                          onChange={(e) => handleInputChange('projects', 'link', e.target.value, index)}
                          placeholder="github.com/username/project"
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={project.duration}
                          onChange={(e) => handleInputChange('projects', 'duration', e.target.value, index)}
                          placeholder="3 months"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md resize-none"
                        rows="3"
                        value={project.description}
                        onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)}
                        placeholder="Describe the project, your role, and key achievements"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Internships/Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Experience & Internships
                  <Button onClick={() => addSection('internships')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.internships.map((internship, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      {formData.internships.length > 1 && (
                        <Button 
                          onClick={() => removeSection('internships', index)} 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={internship.title}
                          onChange={(e) => handleInputChange('internships', 'title', e.target.value, index)}
                          placeholder="Software Engineer Intern"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={internship.company}
                          onChange={(e) => handleInputChange('internships', 'company', e.target.value, index)}
                          placeholder="Company Name"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={internship.location}
                          onChange={(e) => handleInputChange('internships', 'location', e.target.value, index)}
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={internship.duration}
                          onChange={(e) => handleInputChange('internships', 'duration', e.target.value, index)}
                          placeholder="June 2023 - August 2023"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md resize-none"
                        rows="3"
                        value={internship.description}
                        onChange={(e) => handleInputChange('internships', 'description', e.target.value, index)}
                        placeholder="Describe your responsibilities and achievements"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Achievements & Awards
                  <Button onClick={() => addSection('achievements')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Achievement
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Achievement {index + 1}</h4>
                      {formData.achievements.length > 1 && (
                        <Button 
                          onClick={() => removeSection('achievements', index)} 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Achievement Title</Label>
                        <Input
                          value={achievement.title}
                          onChange={(e) => handleInputChange('achievements', 'title', e.target.value, index)}
                          placeholder="Dean's List, Hackathon Winner, etc."
                        />
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input
                          value={achievement.date}
                          onChange={(e) => handleInputChange('achievements', 'date', e.target.value, index)}
                          placeholder="May 2023"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md resize-none"
                        rows="2"
                        value={achievement.description}
                        onChange={(e) => handleInputChange('achievements', 'description', e.target.value, index)}
                        placeholder="Brief description of the achievement"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="flex justify-center gap-4 mb-6">
              <Button onClick={downloadAsPDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button onClick={downloadAsDOCX} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download DOCX
              </Button>
            </div>

            {/* Resume Preview */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg">
              <div ref={resumeRef} className="p-8 bg-white">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {formData.personalInfo.fullName || 'Your Name'}
                  </h1>
                  <div className="text-gray-600 space-y-1">
                    <p>{formData.personalInfo.email} | {formData.personalInfo.phone} | {formData.personalInfo.location}</p>
                    {(formData.personalInfo.linkedIn || formData.personalInfo.github) && (
                      <p>
                        {formData.personalInfo.linkedIn && `LinkedIn: ${formData.personalInfo.linkedIn}`}
                        {formData.personalInfo.linkedIn && formData.personalInfo.github && ' | '}
                        {formData.personalInfo.github && `GitHub: ${formData.personalInfo.github}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Objective */}
                {formData.objective && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">OBJECTIVE</h2>
                    <p className="text-gray-700">{formData.objective}</p>
                  </div>
                )}

                {/* Education */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">EDUCATION</h2>
                  {formData.education.map((edu, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{edu.degree}</h3>
                          <p className="text-gray-700">{edu.institution}, {edu.location}</p>
                          {edu.relevantCoursework && (
                            <p className="text-sm text-gray-600">Relevant Coursework: {edu.relevantCoursework}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{edu.graduationDate}</p>
                          {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Technical Skills */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">TECHNICAL SKILLS</h2>
                  {formData.skills.technical.length > 0 && (
                    <p className="mb-1"><strong>Technical:</strong> {formData.skills.technical.join(', ')}</p>
                  )}
                  {formData.skills.languages.length > 0 && (
                    <p className="mb-1"><strong>Programming Languages:</strong> {formData.skills.languages.join(', ')}</p>
                  )}
                  {formData.skills.tools.length > 0 && (
                    <p className="mb-1"><strong>Tools & Technologies:</strong> {formData.skills.tools.join(', ')}</p>
                  )}
                </div>

                {/* Projects */}
                {formData.projects.some(project => project.title) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">PROJECTS</h2>
                    {formData.projects.filter(project => project.title).map((project, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{project.title}</h3>
                            {project.technologies && (
                              <p className="text-sm text-gray-600 mb-1">Technologies: {project.technologies}</p>
                            )}
                            <p className="text-gray-700">{project.description}</p>
                            {project.link && (
                              <p className="text-sm text-blue-600">{project.link}</p>
                            )}
                          </div>
                          {project.duration && (
                            <p className="font-medium ml-4">{project.duration}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience */}
                {formData.internships.some(internship => internship.title) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">EXPERIENCE</h2>
                    {formData.internships.filter(internship => internship.title).map((internship, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{internship.title}</h3>
                            <p className="text-gray-700">{internship.company}, {internship.location}</p>
                            <p className="text-gray-700">{internship.description}</p>
                          </div>
                          <p className="font-medium ml-4">{internship.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                {formData.achievements.some(achievement => achievement.title) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">ACHIEVEMENTS & AWARDS</h2>
                    {formData.achievements.filter(achievement => achievement.title).map((achievement, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <p className="text-gray-700">{achievement.description}</p>
                          </div>
                          {achievement.date && (
                            <p className="font-medium ml-4">{achievement.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ATSResumeBuilder;
