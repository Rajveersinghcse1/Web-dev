import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ResumePreview from '../components/ResumePreview';
import ATSScore from '../components/ATSScore';
import { TEMPLATES } from '../lib/ResumeTemplates';

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">ATS-Friendly Resume Builder</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={studentInfo.name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={studentInfo.email} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={studentInfo.phone} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="education">Education</Label>
                <Input id="education" name="education" value={studentInfo.education} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Input id="experience" name="experience" value={studentInfo.experience} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" name="skills" value={studentInfo.skills} onChange={handleInputChange} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResumePreview studentInfo={studentInfo} template={TEMPLATES[selectedTemplate]} />
            </CardContent>
          </Card>
          <div className="mt-4">
            <Label htmlFor="template">Select Template</Label>
            <select
              id="template"
              className="w-full p-2 border rounded"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {Object.keys(TEMPLATES).map((template) => (
                <option key={template} value={template}>
                  {template.charAt(0).toUpperCase() + template.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <ATSScore studentInfo={studentInfo} />
          </div>
          <Button className="mt-4 w-full">Download Resume</Button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
