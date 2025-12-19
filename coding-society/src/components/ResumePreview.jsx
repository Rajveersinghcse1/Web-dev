import React from 'react';

const ResumePreview = ({ studentInfo, template }) => {
  return (
    <div className="p-4 border rounded" style={template.container}>
      <h2 style={template.header}>{studentInfo.name || 'Your Name'}</h2>
      <p style={template.contact}>
        {studentInfo.email || 'your.email@example.com'} | {studentInfo.phone || '123-456-7890'}
      </p>
      <hr style={template.hr} />
      <h3 style={template.sectionHeader}>Education</h3>
      <p style={template.sectionContent}>{studentInfo.education || 'Your University'}</p>
      <h3 style={template.sectionHeader}>Experience</h3>
      <p style={template.sectionContent}>{studentInfo.experience || 'Your Job Title at Company'}</p>
      <h3 style={template.sectionHeader}>Skills</h3>
      <p style={template.sectionContent}>{studentInfo.skills || 'Your Skills'}</p>
    </div>
  );
};

export default ResumePreview;
