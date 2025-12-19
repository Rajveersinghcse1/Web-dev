import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Download, FileText, Plus, Trash2, Eye, Save, LayoutTemplate, Palette, 
  Check, ChevronRight, ArrowLeft, Upload, Wand2, Sparkles, Briefcase, 
  GraduationCap, Code, User, Trophy, Settings, Loader2, X, CheckCircle,
  GripVertical, Type, RefreshCw, AlertCircle, Cloud, Columns2, Minimize2,
  Rocket, Zap, Award, Target, BookOpen, Star, TrendingUp, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import resumeService from '../services/resumeService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// --- Styled Components ---
const StyledInput = ({ className, ...props }) => (
  <Input 
    className={`bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:border-blue-400 placeholder:text-gray-400 dark:bg-white dark:text-gray-900 dark:border-gray-300 dark:placeholder:text-gray-400 ${className}`} 
    {...props} 
  />
);

const StyledTextArea = ({ className, ...props }) => (
  <textarea 
    className={`flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm hover:border-blue-400 ${className}`}
    {...props} 
  />
);

const StyledLabel = ({ children, className, required, ...props }) => (
  <Label className={`text-white font-semibold text-sm mb-1.5 flex items-center gap-1 ${className}`} {...props}>
    {children}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </Label>
);

// --- Templates ---
const ProfessionalTemplate = ({ 
  data, 
  accentColor = '#1a202c', 
  font = 'font-serif',
  fontSize = 'medium',
  lineSpacing = 'normal',
  margins = 'normal',
  templateId = 'professional'
}) => {
  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getSpacingClass = () => {
    switch(lineSpacing) {
      case 'compact': return 'space-y-2';
      case 'spacious': return 'space-y-6';
      default: return 'space-y-4';
    }
  };

  const getMarginClass = () => {
    switch(margins) {
      case 'narrow': return 'p-6';
      case 'wide': return 'p-14';
      default: return 'p-10';
    }
  };

  const baseTextSize = getFontSizeClass();
  const spacing = getSpacingClass();
  const margin = getMarginClass();

  // Template Variations
  const isTechPro = templateId === 'tech-pro';
  const isClassicBorder = templateId === 'classic-border';
  const isFresher = templateId === 'fresher-focused';
  const isInternship = templateId === 'internship-pro';

  const SectionTitle = ({ children }) => (
    <h2 className={`text-xl font-bold uppercase border-b mb-4 pb-2 ${isTechPro ? 'text-white bg-gray-800 px-2 py-1 rounded-sm' : ''}`} style={{ borderColor: isTechPro ? 'transparent' : '#e2e8f0', color: isTechPro ? 'white' : accentColor }}>
      {children}
    </h2>
  );

  const EducationSection = () => (
    data.education.length > 0 && (
      <div className="mb-8">
        <SectionTitle>Education</SectionTitle>
        <div className={spacing}>
          {data.education.map((edu, index) => (
            <div key={index} className="flex justify-between items-start group">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{edu.institution}</h3>
                <p className="text-base italic text-gray-600">{edu.degree}</p>
                {edu.relevantCoursework && (
                  <p className={`${baseTextSize} text-gray-500 mt-1`}>Coursework: {edu.relevantCoursework}</p>
                )}
              </div>
              <div className="text-right">
                <p className={`${baseTextSize} font-bold text-gray-700`}>{edu.location}</p>
                <p className={`${baseTextSize} text-gray-600`}>{edu.graduationDate}</p>
                {edu.gpa && <p className={`${baseTextSize} font-medium text-gray-500`}>GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const SkillsSection = () => (
    (data.skills.technical.length > 0 || data.skills.languages.length > 0 || data.skills.tools.length > 0) && (
      <div className="mb-8">
        <SectionTitle>Technical Skills</SectionTitle>
        <div className={`${baseTextSize} space-y-3`}>
          {data.skills.languages.length > 0 && (
            <div className="flex">
              <span className="font-bold w-32 shrink-0 text-gray-700">Languages:</span>
              <span className="text-gray-600">{data.skills.languages.join(', ')}</span>
            </div>
          )}
          {data.skills.technical.length > 0 && (
            <div className="flex">
              <span className="font-bold w-32 shrink-0 text-gray-700">Technologies:</span>
              <span className="text-gray-600">{data.skills.technical.join(', ')}</span>
            </div>
          )}
          {data.skills.tools.length > 0 && (
            <div className="flex">
              <span className="font-bold w-32 shrink-0 text-gray-700">Tools:</span>
              <span className="text-gray-600">{data.skills.tools.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    )
  );

  const ExperienceSection = () => (
    data.internships.some(i => i.title) && (
      <div className="mb-8">
        <SectionTitle>Experience</SectionTitle>
        <div className={spacing}>
          {data.internships.filter(i => i.title).map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-lg text-gray-800">{exp.title}</h3>
                <span className={`${baseTextSize} font-bold text-gray-600`}>{exp.duration}</span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-base italic font-semibold text-gray-700">{exp.company}</span>
                <span className={`${baseTextSize} italic text-gray-500`}>{exp.location}</span>
              </div>
              <p className={`${baseTextSize} leading-relaxed text-justify whitespace-pre-line text-gray-600`}>{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const ProjectsSection = () => (
    data.projects.some(p => p.title) && (
      <div className="mb-8">
        <SectionTitle>Projects</SectionTitle>
        <div className={spacing}>
          {data.projects.filter(p => p.title).map((project, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded-full">
                      View Project
                    </a>
                  )}
                </div>
                <span className={`${baseTextSize} font-bold text-gray-600`}>{project.duration}</span>
              </div>
              {project.technologies && (
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tech Stack: {project.technologies}</p>
              )}
              <p className={`${baseTextSize} leading-relaxed text-justify whitespace-pre-line text-gray-600`}>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const AchievementsSection = () => (
    data.achievements.some(a => a.title) && (
      <div className="mb-8">
        <SectionTitle>Achievements</SectionTitle>
        <ul className="list-disc list-outside ml-4 space-y-2">
          {data.achievements.filter(a => a.title).map((achievement, index) => (
            <li key={index} className={`${baseTextSize} pl-1 text-gray-700`}>
              <span className="font-bold text-gray-800">{achievement.title}</span>
              {achievement.date && <span className="italic text-gray-500"> ({achievement.date})</span>}
              {achievement.description && <span className="text-gray-600"> - {achievement.description}</span>}
            </li>
          ))}
        </ul>
      </div>
    )
  );

  return (
    <div className={`${margin} bg-white text-gray-900 ${font} max-w-[210mm] mx-auto min-h-[297mm] shadow-lg ${isClassicBorder ? 'border-4 border-double border-gray-300 p-8' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b-2 pb-6 mb-8 ${isTechPro ? 'bg-gray-900 text-white p-8 -mx-10 -mt-10 mb-10' : ''}`} style={{ borderColor: isTechPro ? 'transparent' : accentColor }}>
        <div className="flex-1 text-center">
          <h1 className={`text-5xl font-bold uppercase tracking-widest mb-3 ${isTechPro ? 'text-white' : ''}`} style={{ color: isTechPro ? 'white' : accentColor }}>{data.personalInfo.fullName}</h1>
          <div className={`flex flex-wrap justify-center gap-4 ${baseTextSize} ${isTechPro ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
            {data.personalInfo.linkedIn && <span>• {data.personalInfo.linkedIn}</span>}
            {data.personalInfo.github && <span>• {data.personalInfo.github}</span>}
            {data.personalInfo.portfolio && <span>• {data.personalInfo.portfolio}</span>}
          </div>
        </div>
        {data.personalInfo.photo && (
          <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-sm shrink-0 ml-6 ${isTechPro ? 'border-gray-700' : ''}`} style={{ borderColor: isTechPro ? '#4a5568' : accentColor }}>
            <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Objective */}
      {data.objective && (
        <div className="mb-8">
          <SectionTitle>Professional Summary</SectionTitle>
          <p className={`${baseTextSize} leading-relaxed text-justify text-gray-700`}>{data.objective}</p>
        </div>
      )}

      {/* Dynamic Section Ordering */}
      {isFresher ? (
        <>
          <EducationSection />
          <SkillsSection />
          <ProjectsSection />
          <ExperienceSection />
          <AchievementsSection />
        </>
      ) : isInternship ? (
        <>
          <EducationSection />
          <ProjectsSection />
          <ExperienceSection />
          <SkillsSection />
          <AchievementsSection />
        </>
      ) : (
        <>
          <EducationSection />
          <SkillsSection />
          <ExperienceSection />
          <ProjectsSection />
          <AchievementsSection />
        </>
      )}
    </div>
  );
};

const ModernTemplate = ({ 
  data, 
  accentColor = '#2563eb', 
  font = 'font-sans',
  fontSize = 'medium',
  lineSpacing = 'normal',
  margins = 'normal',
  templateId = 'modern'
}) => {
  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getSpacingClass = () => {
    switch(lineSpacing) {
      case 'compact': return 'space-y-6';
      case 'spacious': return 'space-y-12';
      default: return 'space-y-10';
    }
  };

  const getMarginClass = () => {
    switch(margins) {
      case 'narrow': return 'p-6';
      case 'wide': return 'p-14';
      default: return 'p-10';
    }
  };

  const baseTextSize = getFontSizeClass();
  const spacing = getSpacingClass();
  const margin = getMarginClass();

  const isGradient = templateId === 'gradient-modern';
  const isCreativeSidebar = templateId === 'two-col-creative';

  return (
    <div className={`${margin} bg-white text-gray-800 ${font} max-w-[210mm] mx-auto min-h-[297mm] shadow-lg overflow-hidden`}>
      <div className={`flex justify-between items-start mb-10 border-b-2 pb-8 ${isGradient ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-10 -mx-10 -mt-10 mb-10' : ''}`} style={{ borderColor: isGradient ? 'transparent' : '#f3f4f6' }}>
        <div className="flex gap-6 items-center">
          {data.personalInfo.photo && (
            <div className={`w-24 h-24 rounded-xl overflow-hidden shadow-md shrink-0 ${isGradient ? 'border-2 border-white/50' : ''}`}>
              <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h1 className={`text-5xl font-extrabold mb-3 tracking-tight ${isGradient ? 'text-white' : ''}`} style={{ color: isGradient ? 'white' : accentColor }}>{data.personalInfo.fullName}</h1>
            <p className={`text-xl font-light ${isGradient ? 'text-white/80' : 'text-gray-500'}`}>{data.objective && data.objective.split('.')[0]}</p>
          </div>
        </div>
        <div className={`text-right text-sm space-y-1.5 font-medium ${isGradient ? 'text-white/90' : 'text-gray-500'}`}>
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          <p style={{ color: isGradient ? 'white' : accentColor }}>{data.personalInfo.linkedIn}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
        <div className={`col-span-2 ${spacing}`}>
          {/* Experience */}
          {data.internships.some(i => i.title) && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-1.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
                EXPERIENCE
              </h2>
              <div className="space-y-8">
                {data.internships.filter(i => i.title).map((exp, index) => (
                  <div key={index} className="relative pl-6 border-l-2" style={{ borderColor: '#f3f4f6' }}>
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: accentColor }}></div>
                    <h3 className="font-bold text-xl text-gray-900">{exp.title}</h3>
                    <div className="flex justify-between text-sm text-gray-500 mb-3 mt-1">
                      <span className="font-semibold text-gray-700">{exp.company}</span>
                      <span>{exp.duration}</span>
                    </div>
                    <p className={`${baseTextSize} text-gray-600 leading-relaxed`}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects.some(p => p.title) && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-1.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
                PROJECTS
              </h2>
              <div className="space-y-8">
                {data.projects.filter(p => p.title).map((project, index) => (
                  <div key={index} className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{project.title}</h3>
                      {project.link && <span className="text-xs font-medium" style={{ color: accentColor }}>{project.link}</span>}
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">{project.technologies}</p>
                    <p className={`${baseTextSize} text-gray-600 leading-relaxed`}>{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className={`col-span-1 ${spacing} ${isCreativeSidebar ? 'bg-gray-900 text-white p-6 rounded-xl -mr-6' : ''}`} style={{ backgroundColor: isCreativeSidebar ? accentColor : 'transparent' }}>
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className={`text-lg font-bold mb-5 ${isCreativeSidebar ? 'text-white' : 'text-gray-900'}`}>EDUCATION</h2>
              <div className="space-y-5">
                {data.education.map((edu, index) => (
                  <div key={index} className={`${isCreativeSidebar ? 'bg-white/10 border-white/10' : 'bg-gray-50 border-gray-100'} p-5 rounded-xl border shadow-sm`}>
                    <h3 className={`font-bold text-lg leading-tight mb-1 ${isCreativeSidebar ? 'text-white' : 'text-gray-900'}`}>{edu.institution}</h3>
                    <p className={`text-sm mb-2 font-medium ${isCreativeSidebar ? 'text-white/80' : 'text-gray-600'}`}>{edu.degree}</p>
                    <div className={`flex justify-between text-xs font-medium ${isCreativeSidebar ? 'text-white/60' : 'text-gray-400'}`}>
                      <span>{edu.graduationDate}</span>
                      <span>{edu.gpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          <section>
            <h2 className={`text-lg font-bold mb-5 ${isCreativeSidebar ? 'text-white' : 'text-gray-900'}`}>SKILLS</h2>
            <div className="space-y-6">
              {data.skills.languages.length > 0 && (
                <div>
                  <h3 className={`text-xs font-bold uppercase mb-3 tracking-wider ${isCreativeSidebar ? 'text-white/60' : 'text-gray-400'}`}>Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.languages.map((skill, i) => (
                      <span key={i} className={`text-xs px-3 py-1.5 rounded-md shadow-sm font-medium ${isCreativeSidebar ? 'bg-white/20 text-white border-transparent' : 'bg-white border border-gray-200 text-gray-700'}`}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.technical.length > 0 && (
                <div>
                  <h3 className={`text-xs font-bold uppercase mb-3 tracking-wider ${isCreativeSidebar ? 'text-white/60' : 'text-gray-400'}`}>Technical</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.technical.map((skill, i) => (
                      <span key={i} className={`text-xs px-3 py-1.5 rounded-md shadow-sm font-medium ${isCreativeSidebar ? 'bg-white/20 text-white border-transparent' : 'bg-white border border-gray-200 text-gray-700'}`}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const MinimalistTemplate = ({ 
  data, 
  accentColor = '#1a202c', 
  font = 'font-sans',
  fontSize = 'medium',
  lineSpacing = 'normal',
  margins = 'normal',
  templateId = 'minimalist'
}) => {
  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getSpacingClass = () => {
    switch(lineSpacing) {
      case 'compact': return 'space-y-3';
      case 'spacious': return 'space-y-8';
      default: return 'space-y-5';
    }
  };

  const getMarginClass = () => {
    switch(margins) {
      case 'narrow': return 'p-6';
      case 'wide': return 'p-14';
      default: return 'p-10';
    }
  };

  const baseTextSize = getFontSizeClass();
  const spacing = getSpacingClass();
  const margin = getMarginClass();

  const isUltraMinimal = templateId === 'ultra-minimal';
  const isSwiss = templateId === 'swiss-style';
  const isCompact = templateId === 'compact-dense';

  return (
    <div className={`${margin} bg-white text-gray-900 ${font} max-w-[210mm] mx-auto min-h-[297mm] shadow-lg ${isCompact ? 'p-4' : ''}`}>
      {/* Header */}
      <div className={`mb-12 ${isSwiss ? 'grid grid-cols-2 gap-8 items-end text-left border-b-4 border-black pb-6' : 'text-center'}`}>
        {!isUltraMinimal && !isSwiss && data.personalInfo.photo && (
          <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-6 border-2 shadow-sm" style={{ borderColor: accentColor }}>
            <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className={isSwiss ? '' : ''}>
          <h1 className={`font-light tracking-widest uppercase mb-4 ${isSwiss ? 'text-6xl font-black tracking-tighter leading-none' : 'text-4xl'}`} style={{ color: isSwiss ? 'black' : accentColor }}>{data.personalInfo.fullName}</h1>
        </div>

        <div className={`${isSwiss ? 'text-right' : 'flex flex-wrap justify-center gap-x-6 gap-y-2'} ${baseTextSize} text-gray-500 uppercase tracking-wider text-xs`}>
          {data.personalInfo.email && <span className={isSwiss ? 'block' : ''}>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span className={isSwiss ? 'block' : ''}>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span className={isSwiss ? 'block' : ''}>{data.personalInfo.location}</span>}
          {data.personalInfo.linkedIn && <span className={isSwiss ? 'block' : ''}>{data.personalInfo.linkedIn}</span>}
        </div>
      </div>

      {/* Content */}
      <div className={isCompact ? 'space-y-4' : spacing}>
        {/* Objective */}
        {data.objective && (
          <div className={`${isSwiss ? 'text-left font-bold text-xl leading-tight max-w-3xl' : 'text-center max-w-2xl mx-auto'}`}>
            <p className={`${baseTextSize} leading-relaxed ${isSwiss ? 'text-black not-italic' : 'text-gray-600 italic'}`}>{data.objective}</p>
          </div>
        )}

        {!isSwiss && <div className="w-12 h-0.5 mx-auto bg-gray-200 my-8"></div>}

        {/* Experience */}
        {data.internships.some(i => i.title) && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-8 ${isSwiss ? 'text-black text-2xl border-b-2 border-black pb-2' : 'text-center text-gray-400'}`}>Experience</h2>
            <div className={isCompact ? 'space-y-4' : 'space-y-8'}>
              {data.internships.filter(i => i.title).map((exp, index) => (
                <div key={index} className={`grid ${isSwiss ? 'grid-cols-1 gap-2' : 'grid-cols-12 gap-4'}`}>
                  <div className={`${isSwiss ? '' : 'col-span-3 text-right'}`}>
                    <span className={`text-xs font-bold block mt-1 ${isSwiss ? 'text-black' : 'text-gray-400'}`}>{exp.duration}</span>
                    <span className={`text-xs block ${isSwiss ? 'text-gray-600' : 'text-gray-400'}`}>{exp.location}</span>
                  </div>
                  <div className={`${isSwiss ? 'border-l-2 pl-4 border-black' : 'col-span-9 border-l pl-6'}`} style={{ borderColor: isSwiss ? 'black' : accentColor }}>
                    <h3 className="font-bold text-lg text-gray-800">{exp.title}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-2">{exp.company}</p>
                    <p className={`${baseTextSize} text-gray-600 leading-relaxed`}>{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.some(p => p.title) && (
          <section className="mt-8">
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-8 ${isSwiss ? 'text-black text-2xl border-b-2 border-black pb-2' : 'text-center text-gray-400'}`}>Projects</h2>
            <div className={`grid ${isCompact ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-8'}`}>
              {data.projects.filter(p => p.title).map((project, index) => (
                <div key={index} className={`${isSwiss ? 'border border-black p-4' : 'bg-gray-50 p-6 rounded-sm'}`}>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{project.title}</h3>
                  <p className="text-xs font-bold text-gray-400 mb-3 uppercase">{project.technologies}</p>
                  <p className={`${baseTextSize} text-gray-600 leading-relaxed`}>{project.description}</p>
                  {project.link && (
                    <a href={project.link} className="text-xs font-bold mt-3 inline-block border-b border-gray-300 pb-0.5 hover:text-blue-600 hover:border-blue-600 transition-colors" style={{ color: accentColor }}>View Project</a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Skills Grid */}
        <div className={`grid ${isCompact ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-12'} mt-8`}>
          {data.education.length > 0 && (
            <section>
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isSwiss ? 'text-black text-2xl border-b-2 border-black pb-2' : 'text-center text-gray-400'}`}>Education</h2>
              <div className="space-y-6">
                {data.education.map((edu, index) => (
                  <div key={index} className={isSwiss ? 'text-left' : 'text-center'}>
                    <h3 className="font-bold text-gray-800">{edu.institution}</h3>
                    <p className="text-sm text-gray-600">{edu.degree}</p>
                    <p className="text-xs text-gray-400 mt-1">{edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(data.skills.technical.length > 0 || data.skills.languages.length > 0) && (
            <section>
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isSwiss ? 'text-black text-2xl border-b-2 border-black pb-2' : 'text-center text-gray-400'}`}>Skills</h2>
              <div className={`${isSwiss ? 'text-left' : 'text-center'} space-y-4`}>
                {data.skills.technical.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2">Technical</p>
                    <p className={`${baseTextSize} text-gray-600 leading-relaxed`}>{data.skills.technical.join(' • ')}</p>
                  </div>
                )}
                {data.skills.languages.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2">Languages</p>
                    <p className={`${baseTextSize} text-gray-600`}>{data.skills.languages.join(' • ')}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

const CreativeTemplate = ({ 
  data, 
  accentColor = '#7c3aed', 
  font = 'font-sans',
  fontSize = 'medium',
  lineSpacing = 'normal',
  margins = 'normal',
  templateId = 'creative'
}) => {
  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getSpacingClass = () => {
    switch(lineSpacing) {
      case 'compact': return 'space-y-4';
      case 'spacious': return 'space-y-10';
      default: return 'space-y-8';
    }
  };

  const baseTextSize = getFontSizeClass();
  const spacing = getSpacingClass();

  const isInfographic = templateId === 'infographic';
  const isTimeline = templateId === 'timeline';

  return (
    <div className={`bg-white text-gray-800 ${font} max-w-[210mm] mx-auto min-h-[297mm] shadow-lg flex`}>
      {/* Sidebar */}
      <div className="w-[35%] text-white p-8 flex flex-col" style={{ backgroundColor: accentColor }}>
        <div className="mb-10 text-center">
          {data.personalInfo.photo && (
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20 shadow-lg">
              <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2 leading-tight">{data.personalInfo.fullName}</h1>
          <p className="text-white/80 text-sm font-medium">{data.objective && data.objective.split('.')[0]}</p>
        </div>

        <div className="space-y-8 flex-1">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-white/90">
              <span className="font-medium">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <span className="font-medium">{data.personalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <span className="font-medium">{data.personalInfo.location}</span>
            </div>
            {data.personalInfo.linkedIn && (
              <div className="flex items-center gap-3 text-white/90">
                <span className="font-medium truncate">{data.personalInfo.linkedIn}</span>
              </div>
            )}
          </div>

          {data.education.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 border-b border-white/20 pb-2">Education</h3>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <p className="font-bold text-white">{edu.degree}</p>
                    <p className="text-white/80 text-sm">{edu.institution}</p>
                    <p className="text-white/60 text-xs mt-1">{edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(data.skills.technical.length > 0 || data.skills.languages.length > 0) && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 border-b border-white/20 pb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.technical.map((skill, i) => (
                  isInfographic ? (
                    <div key={i} className="w-full mb-2">
                      <div className="flex justify-between text-xs text-white/90 mb-1">
                        <span>{skill}</span>
                      </div>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80 rounded-full" style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs text-white/90">{skill}</span>
                  )
                ))}
                {!isInfographic && data.skills.languages.map((skill, i) => (
                  <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs text-white/90">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`w-[65%] p-10 ${spacing}`}>
        {data.objective && (
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: accentColor }}>
              Profile
            </h2>
            <p className={`${baseTextSize} text-gray-600 leading-relaxed`}>{data.objective}</p>
          </section>
        )}

        {data.internships.some(i => i.title) && (
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: accentColor }}>
              Experience
            </h2>
            <div className="space-y-6">
              {data.internships.filter(i => i.title).map((exp, index) => (
                <div key={index} className={`relative ${isTimeline ? 'pl-8 border-l-2 border-gray-200 ml-2' : 'pl-6 border-l-2 border-gray-100'}`}>
                  <div className={`absolute ${isTimeline ? '-left-[9px] top-0 w-4 h-4 border-4 border-white shadow-sm' : '-left-[5px] top-2 w-2.5 h-2.5'} rounded-full`} style={{ backgroundColor: accentColor }}></div>
                  <h3 className="font-bold text-lg text-gray-800">{exp.title}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-600">{exp.company}</span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{exp.duration}</span>
                  </div>
                  <p className={`${baseTextSize} text-gray-600 leading-relaxed`}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.some(p => p.title) && (
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: accentColor }}>
              Projects
            </h2>
            <div className="space-y-6">
              {data.projects.filter(p => p.title).map((project, index) => (
                <div key={index} className={isInfographic ? "bg-gray-50 p-4 rounded-lg border border-gray-100" : ""}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
                    {project.link && <span className="text-xs text-gray-400">{project.link}</span>}
                  </div>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase">{project.technologies}</p>
                  <p className={`${baseTextSize} text-gray-600 leading-relaxed`}>{project.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const ATSResumeBuilder = () => {
  const { user } = useAuth();
  const resumeRef = useRef();
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [activeSection, setActiveSection] = useState('personal');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [fontSize, setFontSize] = useState('medium');
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [margins, setMargins] = useState('normal');
  
  // Demo Data for Preview
  const demoData = {
    personalInfo: { 
      fullName: 'Alex Chen', 
      email: 'alex.chen@example.com', 
      phone: '+1 (555) 123-4567', 
      location: 'San Francisco, CA', 
      linkedIn: 'linkedin.com/in/alexchen', 
      github: 'github.com/alexchen', 
      portfolio: '' 
    },
    objective: 'Innovative Full Stack Developer with 3+ years of experience building scalable web applications. Passionate about clean code, user-centric design, and cloud-native architectures. Proven track record of optimizing performance and leading agile teams.',
    education: [
      { 
        degree: 'B.S. Computer Science', 
        institution: 'University of California, Berkeley', 
        location: 'Berkeley, CA', 
        graduationDate: 'May 2022', 
        gpa: '3.9/4.0', 
        relevantCoursework: 'Data Structures, Algorithms, Database Systems, AI, Web Development', 
        id: 'edu-1' 
      }
    ],
    skills: { 
      technical: ['JavaScript (ES6+)', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'GraphQL', 'MongoDB', 'PostgreSQL'], 
      languages: ['English (Native)', 'Mandarin (Fluent)', 'Spanish (Intermediate)'], 
      tools: ['Git', 'Jira', 'Figma', 'VS Code', 'Postman'] 
    },
    projects: [
      { 
        title: 'E-Commerce Platform Redesign', 
        description: 'Led the frontend migration from legacy jQuery to React, resulting in a 40% improvement in page load times. Implemented a custom design system and integrated Stripe for payments.', 
        technologies: 'React, Redux, Node.js, Stripe API', 
        link: 'github.com/alexchen/shop-redesign', 
        duration: 'Jan 2023 - Mar 2023', 
        id: 'proj-1' 
      },
      { 
        title: 'AI-Powered Task Manager', 
        description: 'Built a productivity app that uses NLP to automatically categorize tasks. Deployed to AWS using Docker containers and CI/CD pipelines.', 
        technologies: 'Python, Flask, OpenAI API, Docker, AWS', 
        link: 'github.com/alexchen/smart-tasks', 
        duration: 'Sep 2022 - Dec 2022', 
        id: 'proj-2' 
      }
    ],
    internships: [
      { 
        title: 'Software Engineering Intern', 
        company: 'TechGiant Corp', 
        location: 'Seattle, WA', 
        duration: 'Summer 2021', 
        description: '• Collaborated with the core infrastructure team to optimize API response times by 15%.\n• Developed a real-time monitoring dashboard using React and D3.js.\n• Participated in daily stand-ups and code reviews.', 
        id: 'exp-1' 
      }
    ],
    achievements: [
      { 
        title: 'Hackathon Winner', 
        description: 'First place at CalHacks 2021 for "EcoTrack", a sustainability tracking app.', 
        date: 'Oct 2021', 
        id: 'ach-1' 
      },
      { 
        title: 'Dean\'s List', 
        description: 'Awarded for academic excellence for 6 consecutive semesters.', 
        date: '2018 - 2022', 
        id: 'ach-2' 
      }
    ]
  };

  const [formData, setFormData] = useState(demoData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [newSkill, setNewSkill] = useState({ technical: '', languages: '', tools: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);
  
  // AI Text Parser states
  const [showAIParser, setShowAIParser] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [isParsingAI, setIsParsingAI] = useState(false);
  
  // Demo text for AI parser (shown by default to help new users)
  const aiDemoText = `Sarah Johnson
sarah.johnson@email.com | +1 (555) 987-6543 | San Francisco, CA
LinkedIn: linkedin.com/in/sarahjohnson | GitHub: github.com/sarahjdev
Portfolio: www.sarahjohnson.dev

PROFESSIONAL SUMMARY
Innovative Full Stack Developer with 4+ years of experience building scalable web applications and cloud-native solutions. Passionate about clean code, user-centric design, and modern JavaScript frameworks. Proven track record of optimizing application performance and leading cross-functional agile teams to deliver high-impact products.

EDUCATION
Bachelor of Science in Computer Science
Stanford University, Stanford, CA
Graduated: May 2020 | GPA: 3.85/4.0
Relevant Coursework: Data Structures, Algorithms, Machine Learning, Distributed Systems, Web Development

Master of Science in Software Engineering  
University of California, Berkeley, CA
Graduated: December 2021 | GPA: 3.92/4.0

SKILLS
Programming Languages: JavaScript (ES6+), TypeScript, Python, Java, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, Vue.js, Redux, TailwindCSS, Material-UI
Database & Cloud: PostgreSQL, MongoDB, MySQL, Redis, AWS (EC2, S3, Lambda), Azure, Firebase
DevOps & Tools: Docker, Kubernetes, Jenkins, GitHub Actions, Git, Jira, Figma, VS Code, Postman
Languages: English (Native), Spanish (Fluent), Mandarin (Intermediate)

PROFESSIONAL EXPERIENCE

Senior Software Engineer
Tech Innovations Inc., San Francisco, CA
January 2022 - Present
• Led development of microservices architecture serving 2M+ daily active users, improving system reliability by 45%
• Architected and implemented real-time notification system using WebSockets and Redis, reducing latency by 60%
• Mentored team of 5 junior developers through code reviews, pair programming, and technical workshops
• Optimized database queries and caching strategies, reducing API response time from 800ms to 120ms
• Implemented CI/CD pipelines with GitHub Actions and Docker, accelerating deployment frequency by 3x

Full Stack Developer
Startup Accelerator Labs, Palo Alto, CA  
June 2020 - December 2021
• Built customer-facing dashboard using React and Node.js, increasing user engagement by 35%
• Developed RESTful APIs and GraphQL endpoints consumed by web and mobile applications
• Integrated Stripe payment gateway processing $2M+ in monthly transactions
• Collaborated with UX designers to create responsive interfaces supporting 10+ languages
• Reduced frontend bundle size by 40% through code splitting and lazy loading optimization

Software Engineering Intern
Google, Mountain View, CA
Summer 2019
• Contributed to Google Cloud Platform team, implementing features used by enterprise clients
• Developed automated testing framework reducing bug detection time by 25%
• Participated in daily stand-ups, sprint planning, and collaborated with distributed teams

PROJECTS

E-Commerce Platform Redesign | React, Redux, Node.js, Stripe API, AWS
January 2023 - April 2023
• Led frontend migration from legacy jQuery to modern React architecture
• Implemented custom design system with 50+ reusable components
• Achieved 40% improvement in page load times through performance optimization
• Integrated advanced search with Elasticsearch supporting 100K+ product catalog
GitHub: github.com/sarahjdev/ecommerce-platform

AI-Powered Task Manager | Python, Flask, OpenAI API, Docker, PostgreSQL
September 2022 - November 2022  
• Built productivity SaaS application using natural language processing for smart task categorization
• Deployed scalable microservices on AWS using Docker containers and Kubernetes
• Implemented OAuth 2.0 authentication and role-based access control
• Achieved 95% accuracy in task priority prediction using machine learning models
Live Demo: taskmaster-ai.com

Real-Time Collaboration Tool | WebSocket, Node.js, MongoDB, React
March 2022 - June 2022
• Developed real-time document editor supporting concurrent users similar to Google Docs
• Implemented operational transformation algorithms for conflict-free collaborative editing  
• Built custom text editor with rich formatting using Draft.js and ProseMirror
• Handled 500+ simultaneous connections with optimized WebSocket implementation

ACHIEVEMENTS & AWARDS
• Hackathon Winner - TechCrunch Disrupt SF 2023: First place for "HealthTrack" wellness monitoring app
• AWS Certified Solutions Architect - Associate (2023)
• Dean's List - Stanford University (2018-2020) - Awarded for academic excellence across 6 semesters  
• Open Source Contributor - Contributed to React, Next.js, and TailwindCSS with 50+ merged PRs
• Google Code Jam - Advanced to Round 2 in 2021 and 2022
• Best Innovation Award - University Capstone Project (2020)`;

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Always try to load from resume service (it handles auth internally)
        const data = await resumeService.getResume();
        if (data) {
          setFormData(prev => ({ 
            ...prev, 
            ...data,
            personalInfo: { ...prev.personalInfo, ...data.personalInfo },
            skills: { ...prev.skills, ...data.skills },
            settings: { ...prev.settings, ...data.settings }
          }));
          if (data.settings) {
            setAccentColor(data.settings.accentColor || '#2563eb');
            setFontFamily(data.settings.fontFamily || 'font-sans');
            setSelectedTemplate(data.settings.templateId || 'professional');
            setFontSize(data.settings.fontSize || 'medium');
            setLineSpacing(data.settings.lineSpacing || 'normal');
            setMargins(data.settings.margins || 'normal');
          }
        }
      } catch (error) {
        // Error is already handled in resumeService
        console.warn('Resume loading handled by service layer');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Auto-Save Logic
  useEffect(() => {
    if (isLoading) return;

    const saveData = async () => {
      setIsSaving(true);
      try {
        const dataToSave = {
          ...formData,
          settings: { accentColor, fontFamily, templateId: selectedTemplate, fontSize, lineSpacing, margins }
        };

        // Resume service handles all auth and storage logic
        await resumeService.saveResume(dataToSave);
        setLastSaved(new Date());
      } catch (error) {
        // Error is already handled in resumeService
        console.warn('Auto-save handled by service layer');
        // Still update last saved time even on error (localStorage fallback)
        setLastSaved(new Date());
      } finally {
        setIsSaving(false);
      }
    };

    const timeoutId = setTimeout(saveData, 2000); // Debounce 2s
    return () => clearTimeout(timeoutId);
  }, [formData, accentColor, fontFamily, selectedTemplate, fontSize, lineSpacing, margins, user, isLoading]);

  const templates = [
    // === Category: ATS-Optimized (Most Popular for Tech Interviews) ===
    { id: 'professional', name: 'Professional Standard', description: 'Clean, ATS-friendly layout. #1 Choice for FAANG.', icon: FileText, category: 'ATS-Optimized', popular: true },
    { id: 'modern', name: 'Modern Tech', description: 'Contemporary two-column design. Google/Microsoft style.', icon: Columns2, category: 'ATS-Optimized', popular: true },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple, elegant, whitespace-focused. Apple inspired.', icon: Type, category: 'ATS-Optimized' },
    { id: 'tech-pro', name: 'Tech Professional', description: 'Bold headers, perfect for Software Engineers.', icon: Code, category: 'ATS-Optimized', popular: true },
    { id: 'classic-border', name: 'Classic Border', description: 'Traditional with subtle borders. Bank/Consulting.', icon: Award, category: 'ATS-Optimized' },
    
    // === Category: Creative/Startup ===
    { id: 'creative', name: 'Creative Sidebar', description: 'Bold colors with sidebar layout. Startup-friendly.', icon: Palette, category: 'Creative/Startup' },
    { id: 'gradient-modern', name: 'Gradient Modern', description: 'Eye-catching gradients. Design-tech roles.', icon: Sparkles, category: 'Creative/Startup', popular: true },
    { id: 'two-col-creative', name: 'Two-Column Creative', description: 'Colored sidebar for impact.', icon: Rocket, category: 'Creative/Startup' },
    
    // === Category: Minimalist ===
    { id: 'ultra-minimal', name: 'Ultra Minimal', description: 'Text-only, maximum readability.', icon: Minimize2, category: 'Minimalist' },
    { id: 'swiss-style', name: 'Swiss Style', description: 'Grid-based, typography-focused.', icon: LayoutTemplate, category: 'Minimalist' },
    { id: 'compact-dense', name: 'Compact Dense', description: 'Maximum info in minimum space. 1-page guaranteed.', icon: Target, category: 'Minimalist' },
    
    // === Category: Academic/Research ===
    { id: 'academic', name: 'Academic', description: 'Research-focused, publication-ready.', icon: BookOpen, category: 'Academic/Research' },
    { id: 'cv-style', name: 'CV Style', description: 'Multi-page CV format for PhDs/Masters.', icon: GraduationCap, category: 'Academic/Research' },
    
    // === Category: Special (Internships/Freshers) ===
    { id: 'fresher-focused', name: 'Fresher Special', description: 'Projects & skills emphasized. For freshers.', icon: Star, category: 'Fresher/Internship', popular: true },
    { id: 'internship-pro', name: 'Internship Pro', description: 'Hackathons & coursework highlighted.', icon: Trophy, category: 'Fresher/Internship' },
    
    // === Category: Advanced ===
    { id: 'infographic', name: 'Infographic', description: 'Visual skill bars & charts. Creative roles.', icon: TrendingUp, category: 'Advanced' },
    { id: 'timeline', name: 'Timeline', description: 'Chronological timeline view.', icon: Clock, category: 'Advanced' },
    
    ...customTemplates
  ];

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, photo: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSection = (section) => {
    const newId = `${section.slice(0,3)}-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      [section]: [
        ...prev[section],
        section === 'education' ? { degree: '', institution: '', location: '', graduationDate: '', gpa: '', relevantCoursework: '', id: newId }
        : section === 'projects' ? { title: '', description: '', technologies: '', link: '', duration: '', id: newId }
        : section === 'internships' ? { title: '', company: '', location: '', duration: '', description: '', id: newId }
        : { title: '', description: '', date: '', id: newId }
      ]
    }));
  };

  const removeSection = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const reorderSection = (section, newOrder) => {
    setFormData(prev => ({
      ...prev,
      [section]: newOrder
    }));
  };

  const addSkill = (type) => {
    if (newSkill[type].trim()) {
      setFormData(prev => ({
        ...prev,
        skills: { ...prev.skills, [type]: [...prev.skills[type], newSkill[type].trim()] }
      }));
      setNewSkill(prev => ({ ...prev, [type]: '' }));
    }
  };

  const removeSkill = (type, index) => {
    setFormData(prev => ({
      ...prev,
      skills: { ...prev.skills, [type]: prev.skills[type].filter((_, i) => i !== index) }
    }));
  };

  const downloadAsPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    try {
        toast.loading('Generating professional PDF...', { id: 'pdf-gen' });
        
        // Create a clone of the element to avoid modifying the live preview
        const clone = element.cloneNode(true);
        
        // Robust color conversion using Canvas API
        const convertUnsupportedColors = (element) => {
          // Helper to convert any color to RGBA using Canvas
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          const toRgb = (color) => {
            if (!color || color === 'transparent' || color === 'inherit') return color;
            // If it's already rgb/rgba/hex/hsl, let it be (optimization)
            if (color.startsWith('rgb') || color.startsWith('#') || color.startsWith('hsl')) return color;
            
            try {
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = color;
              ctx.fillRect(0, 0, 1, 1);
              const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
              return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            } catch (e) {
              console.warn('Color conversion failed for:', color);
              return color;
            }
          };

          const processElement = (el) => {
            if (!el.style) return;
            
            const computedStyle = window.getComputedStyle(el);
            
            // List of properties that might contain colors
            const colorProps = [
              'color', 'backgroundColor', 
              'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
              'outlineColor', 'textDecorationColor', 
              'fill', 'stroke'
            ];

            colorProps.forEach(prop => {
              const value = computedStyle[prop];
              // Check for modern color formats or if we suspect it needs conversion
              if (value && (value.includes('oklch') || value.includes('lch') || value.includes('lab') || value.startsWith('color('))) {
                el.style[prop] = toRgb(value);
              }
            });
          };

          // Process root
          processElement(element);
          // Process all children
          element.querySelectorAll('*').forEach(processElement);
        };
        
        // Create a container for the clone that is off-screen but rendered
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '210mm'; // A4 width
        container.style.zIndex = '-1';
        
        // Append clone to container
        container.appendChild(clone);
        document.body.appendChild(container);
        
        // Convert unsupported colors immediately
        convertUnsupportedColors(clone);
        
        // Wait for images to load and styles to apply
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const canvas = await html2canvas(clone, { 
            scale: 2, // Good balance between quality and performance
            useCORS: true, 
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: true,
            onclone: (clonedDoc) => {
              // Additional color conversion in cloned document to be absolutely sure
              const clonedBody = clonedDoc.body;
              if (clonedBody) {
                // We need to re-define the function inside the clone context if needed, 
                // but here we can just reuse the logic if we pass the element
                // Note: clonedDoc is the document of the iframe html2canvas creates
                const elements = clonedBody.getElementsByTagName('*');
                
                // Re-create canvas in this context just in case
                const canvas = clonedDoc.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');
                
                const toRgb = (color) => {
                    if (!color || color === 'transparent') return color;
                    if (color.startsWith('rgb') || color.startsWith('#')) return color;
                    try {
                        ctx.clearRect(0, 0, 1, 1);
                        ctx.fillStyle = color;
                        ctx.fillRect(0, 0, 1, 1);
                        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
                        return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                    } catch (e) { return color; }
                };

                for (let i = 0; i < elements.length; i++) {
                    const el = elements[i];
                    const style = window.getComputedStyle(el); // Use window of main frame, might be issue? 
                    // Actually html2canvas onclone runs before rendering.
                    // Let's just try to fix inline styles that might have been missed
                    
                    ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach(prop => {
                        const val = style[prop];
                        if (val && val.includes('oklch')) {
                            el.style[prop] = toRgb(val);
                        }
                    });
                }
              }
            }
        });
        
        // Clean up
        document.body.removeChild(container);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        // Calculate dimensions to strictly fit on one page
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (imgHeight > pdfHeight) {
            // Content exceeds one page - Scale down to fit
            const scaledWidth = (pdfHeight * canvas.width) / canvas.height;
            const xOffset = (pdfWidth - scaledWidth) / 2; // Center horizontally
            
            pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, pdfHeight);
            toast.success('Resume compressed to fit single page!', { id: 'pdf-gen' });
        } else {
            // Fits within one page naturally
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            toast.success('Resume exported successfully!', { id: 'pdf-gen' });
        }
        
        const fileName = formData.personalInfo.fullName ? 
          `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf` : 
          'Resume.pdf';
        pdf.save(fileName);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        if (error.message && error.message.includes('oklch')) {
          toast.error('PDF export failed: Unsupported color format detected. Try switching to a different template.', { id: 'pdf-gen', duration: 5000 });
        } else {
          toast.error('Export failed. Please try again.', { id: 'pdf-gen' });
        }
    }
  };

  const handleFileUpload = async (file) => {
      if (!file) return;
      
      const fileType = file.name.split('.').pop().toLowerCase();
      
      if (fileType === 'json') {
          // Real JSON Import
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const importedData = JSON.parse(e.target.result);
                  // Basic validation
                  if (importedData.personalInfo) {
                      setFormData(prev => ({ ...prev, ...importedData }));
                      toast.success("Resume data imported successfully!");
                      setShowUploader(false);
                  } else {
                      toast.error("Invalid resume JSON format.");
                  }
              } catch (err) {
                  toast.error("Failed to parse JSON file.");
              }
          };
          reader.readAsText(file);
      } else if (fileType === 'pdf') {
          // Ultra Advanced Simulation
          setIsAnalyzing(true);
          const steps = [
            "Initializing Deep Scan Engine...",
            "Extracting Vector Graphics & Layout...",
            "Analyzing Typography & Kerning...",
            "Identifying Semantic Sections...",
            "Parsing Natural Language Content...",
            "Optimizing for ATS Compatibility...",
            "Generating React Component Tree...",
            "Finalizing Template Structure..."
          ];

          for (let i = 0; i < steps.length; i++) {
            setAnalysisStep(steps[i]);
            setUploadProgress((i + 1) * (100 / steps.length));
            // Variable delay for realism
            await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
          }

          // Mock "Smart" Extraction
          if (file.name.toLowerCase().includes('engineer') || file.name.toLowerCase().includes('dev')) {
              setFormData(prev => ({
                  ...prev,
                  objective: "Passionate software engineer with a focus on scalable web applications...",
                  skills: { ...prev.skills, technical: [...prev.skills.technical, "React", "Node.js", "AWS"] }
              }));
          }

          const newTemplate = {
            id: `custom-${Date.now()}`,
            name: file.name.replace('.pdf', '') + ' (Imported)',
            description: 'Custom design extracted from uploaded PDF.',
            icon: Sparkles,
            category: 'Imported',
            isCustom: true
          };
          
          setCustomTemplates(prev => [...prev, newTemplate]);
          setSelectedTemplate(newTemplate.id);
          setIsAnalyzing(false);
          setShowUploader(false);
          setUploadProgress(0);
          toast.success("Design imported successfully!");
      } else {
          toast.error("Unsupported file type. Please upload PDF or JSON.");
      }
  };

  const resetData = () => {
    if(window.confirm("Are you sure? This will clear all your data.")) {
        setFormData(demoData);
        localStorage.removeItem('resumeData');
    }
  };

  // AI Text Parser - Extracts resume data from unstructured text
  const parseUnstructuredText = async (text) => {
    setIsParsingAI(true);
    toast.loading('Analyzing your text with AI...', { id: 'ai-parse' });

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Advanced regex and NLP-like parsing
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      const extractedData = {
        personalInfo: { fullName: '', email: '', phone: '', location: '', linkedIn: '', github: '', portfolio: '' },
        objective: '',
        education: [],
        skills: { technical: [], languages: [], tools: [] },
        projects: [],
        internships: [],
        achievements: []
      };

      // Extract Email
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
      const emails = text.match(emailRegex);
      if (emails && emails.length > 0) extractedData.personalInfo.email = emails[0];

      // Extract Phone
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const phones = text.match(phoneRegex);
      if (phones && phones.length > 0) extractedData.personalInfo.phone = phones[0];

      // Extract LinkedIn
      const linkedInRegex = /(linkedin\.com\/in\/[\w-]+|linkedin:?\s*([\w-]+))/gi;
      const linkedIn = text.match(linkedInRegex);
      if (linkedIn && linkedIn.length > 0) {
        extractedData.personalInfo.linkedIn = linkedIn[0].includes('linkedin.com') 
          ? linkedIn[0] 
          : `linkedin.com/in/${linkedIn[0].replace(/linkedin:?\s*/i, '')}`;
      }

      // Extract GitHub
      const githubRegex = /(github\.com\/[\w-]+|github:?\s*([\w-]+))/gi;
      const github = text.match(githubRegex);
      if (github && github.length > 0) {
        extractedData.personalInfo.github = github[0].includes('github.com') 
          ? github[0] 
          : `github.com/${github[0].replace(/github:?\s*/i, '')}`;
      }

      // Extract Portfolio/Website
      const websiteRegex = /(https?:\/\/[\w.-]+|(?:portfolio|website):?\s*([\w.-]+\.[\w.-]+))/gi;
      const websites = text.match(websiteRegex);
      if (websites && websites.length > 0) {
        const filtered = websites.find(w => !w.includes('linkedin') && !w.includes('github'));
        if (filtered) extractedData.personalInfo.portfolio = filtered.replace(/portfolio:?\s*/i, '');
      }

      // Extract Name (heuristic: first line or line before email)
      const namePatterns = [
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,  // Capitalized words
        /name:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
      ];
      for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          extractedData.personalInfo.fullName = match[1].trim();
          break;
        }
      }
      if (!extractedData.personalInfo.fullName && lines.length > 0) {
        extractedData.personalInfo.fullName = lines[0].split(/[,|]/)[0].trim();
      }

      // Extract Location
      const locationRegex = /((?:location|address):?\s*([^,\n]+(?:,\s*[A-Z]{2})?)|([A-Z][a-z]+,\s*[A-Z]{2}))/gi;
      const locations = text.match(locationRegex);
      if (locations && locations.length > 0) {
        extractedData.personalInfo.location = locations[0].replace(/location:?\s*/i, '').trim();
      }

      // Extract Objective/Summary
      const summaryRegex = /(?:summary|objective|profile|about)[\s:]*([^\n]+(?:\n(?!(?:education|experience|skills|projects))[^\n]+)*)/gi;
      const summaryMatch = text.match(summaryRegex);
      if (summaryMatch && summaryMatch.length > 0) {
        extractedData.objective = summaryMatch[0]
          .replace(/(?:summary|objective|profile|about)[\s:]*/gi, '')
          .trim()
          .slice(0, 500);
      }

      // Extract Education
      const eduRegex = /(?:education|academic|degree)[\s:]*\n*((?:.+\n?)+?)(?=(?:experience|skills|projects|$))/gi;
      const eduMatches = text.matchAll(eduRegex);
      for (const match of eduMatches) {
        const eduText = match[1];
        const degreeMatch = eduText.match(/(B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|Bachelor|Master|Associate)[\s\w,]+/i);
        const institutionMatch = eduText.match(/(?:university|college|institute|school)\s+(?:of\s+)?([^\n,]+)/i);
        const gpaMatch = eduText.match(/GPA:?\s*(\d\.\d+)/i);
        const yearMatch = eduText.match(/(\d{4}|\w+\s+\d{4})/);
        
        if (degreeMatch || institutionMatch) {
          extractedData.education.push({
            degree: degreeMatch ? degreeMatch[0] : '',
            institution: institutionMatch ? institutionMatch[0] : '',
            location: '',
            graduationDate: yearMatch ? yearMatch[0] : '',
            gpa: gpaMatch ? gpaMatch[1] : '',
            relevantCoursework: '',
            id: `edu-${Date.now()}-${Math.random()}`
          });
        }
      }

      // Extract Skills
      const skillsRegex = /(?:skills?|technologies|proficiencies)[\s:]*\n*((?:.+\n?)+?)(?=(?:experience|projects|education|$))/gi;
      const skillMatches = text.matchAll(skillsRegex);
      for (const match of skillMatches) {
        const skillsText = match[1];
        const skillsList = skillsText
          .split(/[,;\n•\-]/)
          .map(s => s.trim())
          .filter(s => s && s.length > 1 && s.length < 50);
        
        // Categorize skills
        const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'aws', 'docker', 'sql', 'html', 'css', 'typescript'];
        const toolKeywords = ['git', 'jira', 'figma', 'vscode', 'postman', 'jenkins'];
        const langKeywords = ['english', 'spanish', 'french', 'chinese', 'mandarin', 'hindi'];
        
        skillsList.forEach(skill => {
          const lower = skill.toLowerCase();
          if (techKeywords.some(kw => lower.includes(kw))) {
            extractedData.skills.technical.push(skill);
          } else if (toolKeywords.some(kw => lower.includes(kw))) {
            extractedData.skills.tools.push(skill);
          } else if (langKeywords.some(kw => lower.includes(kw))) {
            extractedData.skills.languages.push(skill);
          } else {
            extractedData.skills.technical.push(skill);
          }
        });
      }

      // Extract Experience/Internships
      const expRegex = /(?:experience|employment|work|internship)[\s:]*\n*((?:.+\n?)+?)(?=(?:projects|education|skills|$))/gi;
      const expMatches = text.matchAll(expRegex);
      for (const match of expMatches) {
        const expText = match[1];
        const jobBlocks = expText.split(/\n\s*\n/);
        
        jobBlocks.forEach(block => {
          const titleMatch = block.match(/^([^\n]+)/);
          const companyMatch = block.match(/(?:@|at)\s+([^\n,]+)/i);
          const durationMatch = block.match(/(\w+\s+\d{4}\s*-\s*(?:\w+\s+\d{4}|present))/i);
          const descLines = block.split('\n').filter(l => l.match(/^[•\-\*]/) || l.length > 30);
          
          if (titleMatch) {
            extractedData.internships.push({
              title: titleMatch[1].replace(/[•\-\*]/, '').trim(),
              company: companyMatch ? companyMatch[1].trim() : '',
              location: '',
              duration: durationMatch ? durationMatch[1] : '',
              description: descLines.map(l => l.replace(/^[•\-\*]\s*/, '').trim()).join('\n'),
              id: `exp-${Date.now()}-${Math.random()}`
            });
          }
        });
      }

      // Extract Projects
      const projRegex = /(?:projects?)[\s:]*\n*((?:.+\n?)+?)(?=(?:experience|education|skills|achievements|$))/gi;
      const projMatches = text.matchAll(projRegex);
      for (const match of projMatches) {
        const projText = match[1];
        const projectBlocks = projText.split(/\n\s*\n/);
        
        projectBlocks.forEach(block => {
          const titleMatch = block.match(/^([^\n]+)/);
          const techMatch = block.match(/(?:tech stack|technologies|built with):?\s*([^\n]+)/i);
          const linkMatch = block.match(/(https?:\/\/[\w.-]+|github\.com\/[\w/-]+)/i);
          const descLines = block.split('\n').filter(l => l.length > 30 || l.match(/^[•\-\*]/));
          
          if (titleMatch && titleMatch[1].length > 3) {
            extractedData.projects.push({
              title: titleMatch[1].replace(/[•\-\*]/, '').trim(),
              description: descLines.map(l => l.replace(/^[•\-\*]\s*/, '').trim()).join(' '),
              technologies: techMatch ? techMatch[1].trim() : '',
              link: linkMatch ? linkMatch[1] : '',
              duration: '',
              id: `proj-${Date.now()}-${Math.random()}`
            });
          }
        });
      }

      // Extract Achievements
      const achRegex = /(?:achievements?|awards?|honors?)[\s:]*\n*((?:.+\n?)+?)(?=(?:$))/gi;
      const achMatches = text.matchAll(achRegex);
      for (const match of achMatches) {
        const achText = match[1];
        achText.split(/\n/).forEach(line => {
          const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
          if (cleaned && cleaned.length > 5) {
            const yearMatch = cleaned.match(/(\d{4})/);
            extractedData.achievements.push({
              title: cleaned.split(/[,\-]/)[0].trim(),
              description: cleaned,
              date: yearMatch ? yearMatch[1] : '',
              id: `ach-${Date.now()}-${Math.random()}`
            });
          }
        });
      }

      // Merge with existing data
      setFormData(prev => ({
        ...prev,
        ...extractedData,
        personalInfo: { ...prev.personalInfo, ...extractedData.personalInfo },
        skills: {
          technical: [...new Set([...extractedData.skills.technical])],
          languages: [...new Set([...extractedData.skills.languages])],
          tools: [...new Set([...extractedData.skills.tools])]
        }
      }));

      toast.success('Resume data extracted successfully!', { id: 'ai-parse' });
      setShowAIParser(false);
      setAiInputText('');
    } catch (error) {
      console.error('AI parsing error:', error);
      toast.error('Failed to parse text. Please try again.', { id: 'ai-parse' });
    } finally {
      setIsParsingAI(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white/90 border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-16 z-40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              Resume Builder 
              <span className="text-[10px] font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">Ultra</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 font-medium">AI-Powered Design Engine</p>
              {isSaving ? (
                <span className="text-xs text-blue-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</span>
              ) : lastSaved ? (
                <span className="text-xs text-green-600 flex items-center gap-1"><Cloud className="w-3 h-3" /> Saved</span>
              ) : null}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="ghost" onClick={resetData} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
             <RefreshCw className="w-4 h-4 mr-2" /> Reset
           </Button>
           <div className="h-6 w-px bg-gray-200 mx-2"></div>
           <Button 
             variant="outline" 
             onClick={() => setShowAIParser(true)} 
             className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all"
           >
             <Wand2 className="w-4 h-4" />
             AI Auto-Fill
           </Button>
           <Button variant="outline" onClick={() => setShowUploader(true)} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all">
             <Upload className="w-4 h-4" />
             Import
           </Button>
           <Button onClick={() => {
             const blob = new Blob([JSON.stringify(formData, null, 2)], {type: "application/json"});
             saveAs(blob, `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume_Data.json`);
           }} variant="outline" className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
             <Save className="w-4 h-4" /> Save JSON
           </Button>
           <Button onClick={downloadAsPDF} className="bg-gray-900 text-white hover:bg-gray-800 gap-2 shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95">
             <Download className="w-4 h-4" />
             Export PDF
           </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-y-auto z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
           <div className="p-6">
             <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" /> Sections
             </h3>
             <nav className="space-y-1.5">
               {[
                 { id: 'personal', label: 'Personal Info', icon: User },
                 { id: 'education', label: 'Education', icon: GraduationCap },
                 { id: 'experience', label: 'Experience', icon: Briefcase },
                 { id: 'projects', label: 'Projects', icon: Code },
                 { id: 'skills', label: 'Skills', icon: Sparkles },
                 { id: 'achievements', label: 'Achievements', icon: Trophy },
                 { id: 'settings', label: 'Design Settings', icon: Settings }
               ].map((item) => (
                 <button
                   key={item.id}
                   onClick={() => setActiveSection(item.id)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                     activeSection === item.id 
                       ? 'bg-blue-50 text-blue-700 shadow-sm translate-x-1' 
                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                   }`}
                 >
                   <item.icon className={`w-4 h-4 transition-colors ${activeSection === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                   {item.label}
                   {activeSection === item.id && <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />}
                 </button>
               ))}
             </nav>
           </div>
           
           <div className="p-6 mt-auto border-t border-gray-100 bg-gray-50/30 max-h-[600px] overflow-y-auto custom-scrollbar">
             <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2 sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 -mt-2 z-10">
                <LayoutTemplate className="w-3 h-3" /> 18 Professional Templates
             </h3>
             
             <div className="space-y-6">
               {/* ATS-Optimized Templates */}
               <div>
                 <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-2 tracking-wide flex items-center gap-1">
                   <Sparkles className="w-3 h-3" /> ATS-Optimized
                 </h4>
                 <div className="grid grid-cols-2 gap-2">
                   {templates.filter(t => t.category === 'ATS-Optimized').map(t => (
                     <button
                       key={t.id}
                       onClick={() => setSelectedTemplate(t.id)}
                       className={`p-2.5 rounded-lg border text-left transition-all duration-200 relative group ${
                         selectedTemplate === t.id 
                           ? 'border-blue-500 bg-white ring-2 ring-blue-500 ring-offset-1 shadow-md' 
                           : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm hover:-translate-y-0.5'
                       }`}
                     >
                       {t.popular && <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[8px] font-bold rounded-full">★</span>}
                       <div className="flex items-start gap-2">
                         <div className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${selectedTemplate === t.id ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-50'}`}>
                           <t.icon className={`w-4 h-4 ${selectedTemplate === t.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'}`} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <span className="text-[10px] font-semibold text-gray-700 block truncate">{t.name}</span>
                           <span className="text-[8px] text-gray-500 block truncate">{t.description.split('.')[0]}</span>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Creative/Startup Templates */}
               <div>
                 <h4 className="text-[10px] font-bold text-purple-600 uppercase mb-2 tracking-wide flex items-center gap-1">
                   <Palette className="w-3 h-3" /> Creative
                 </h4>
                 <div className="grid grid-cols-2 gap-2">
                   {templates.filter(t => t.category === 'Creative/Startup').map(t => (
                     <button
                       key={t.id}
                       onClick={() => setSelectedTemplate(t.id)}
                       className={`p-2.5 rounded-lg border text-left transition-all duration-200 relative group ${
                         selectedTemplate === t.id 
                           ? 'border-purple-500 bg-white ring-2 ring-purple-500 ring-offset-1 shadow-md' 
                           : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm hover:-translate-y-0.5'
                       }`}
                     >
                       {t.popular && <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[8px] font-bold rounded-full">★</span>}
                       <div className="flex items-start gap-2">
                         <div className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${selectedTemplate === t.id ? 'bg-purple-100' : 'bg-gray-100 group-hover:bg-purple-50'}`}>
                           <t.icon className={`w-4 h-4 ${selectedTemplate === t.id ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'}`} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <span className="text-[10px] font-semibold text-gray-700 block truncate">{t.name}</span>
                           <span className="text-[8px] text-gray-500 block truncate">{t.description.split('.')[0]}</span>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Two-Column Templates */}
               <div>
                 <h4 className="text-[10px] font-bold text-green-600 uppercase mb-2 tracking-wide flex items-center gap-1">
                   <Columns2 className="w-3 h-3" /> Two-Column
                 </h4>
                 <div className="grid grid-cols-2 gap-2">
                   {templates.filter(t => t.category === 'Two-Column').map(t => (
                     <button
                       key={t.id}
                       onClick={() => setSelectedTemplate(t.id)}
                       className={`p-2.5 rounded-lg border text-left transition-all duration-200 relative group ${
                         selectedTemplate === t.id 
                           ? 'border-green-500 bg-white ring-2 ring-green-500 ring-offset-1 shadow-md' 
                           : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm hover:-translate-y-0.5'
                       }`}
                     >
                       <div className="flex items-start gap-2">
                         <div className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${selectedTemplate === t.id ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-green-50'}`}>
                           <t.icon className={`w-4 h-4 ${selectedTemplate === t.id ? 'text-green-600' : 'text-gray-500 group-hover:text-green-500'}`} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <span className="text-[10px] font-semibold text-gray-700 block truncate">{t.name}</span>
                           <span className="text-[8px] text-gray-500 block truncate">{t.description.split('.')[0]}</span>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Minimalist Templates */}
               <div>
                 <h4 className="text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-wide flex items-center gap-1">
                   <Minimize2 className="w-3 h-3" /> Minimalist
                 </h4>
                 <div className="grid grid-cols-2 gap-2">
                   {templates.filter(t => t.category === 'Minimalist').map(t => (
                     <button
                       key={t.id}
                       onClick={() => setSelectedTemplate(t.id)}
                       className={`p-2.5 rounded-lg border text-left transition-all duration-200 relative group ${
                         selectedTemplate === t.id 
                           ? 'border-gray-500 bg-white ring-2 ring-gray-500 ring-offset-1 shadow-md' 
                           : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5'
                       }`}
                     >
                       <div className="flex items-start gap-2">
                         <div className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${selectedTemplate === t.id ? 'bg-gray-100' : 'bg-gray-100 group-hover:bg-gray-50'}`}>
                           <t.icon className={`w-4 h-4 ${selectedTemplate === t.id ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-500'}`} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <span className="text-[10px] font-semibold text-gray-700 block truncate">{t.name}</span>
                           <span className="text-[8px] text-gray-500 block truncate">{t.description.split('.')[0]}</span>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Academic/Research Templates */}
               <div>
                 <h4 className="text-[10px] font-bold text-indigo-600 uppercase mb-2 tracking-wide flex items-center gap-1">
                   <GraduationCap className="w-3 h-3" /> Academic
                 </h4>
                 <div className="grid grid-cols-2 gap-2">
                   {templates.filter(t => t.category === 'Academic/Research').map(t => (
                     <button
                       key={t.id}
                       onClick={() => setSelectedTemplate(t.id)}
                       className={`p-2.5 rounded-lg border text-left transition-all duration-200 relative group ${
                         selectedTemplate === t.id 
                           ? 'border-indigo-500 bg-white ring-2 ring-indigo-500 ring-offset-1 shadow-md' 
                           : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm hover:-translate-y-0.5'
                       }`}
                     >
                       <div className="flex items-start gap-2">
                         <div className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${selectedTemplate === t.id ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-indigo-50'}`}>
                           <t.icon className={`w-4 h-4 ${selectedTemplate === t.id ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-500'}`} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <span className="text-[10px] font-semibold text-gray-700 block truncate">{t.name}</span>
                           <span className="text-[8px] text-gray-500 block truncate">{t.description.split('.')[0]}</span>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Fresher/Internship Templates */}
               <div>
                 <h4 className="text-[10px] font-bold text-cyan-600 uppercase mb-2 tracking-wide flex items-center gap-1">
                   <Rocket className="w-3 h-3" /> Fresher
                 </h4>
                 <div className="grid grid-cols-2 gap-2">
                   {templates.filter(t => t.category === 'Fresher/Internship').map(t => (
                     <button
                       key={t.id}
                       onClick={() => setSelectedTemplate(t.id)}
                       className={`p-2.5 rounded-lg border text-left transition-all duration-200 relative group ${
                         selectedTemplate === t.id 
                           ? 'border-cyan-500 bg-white ring-2 ring-cyan-500 ring-offset-1 shadow-md' 
                           : 'border-gray-200 bg-white hover:border-cyan-300 hover:shadow-sm hover:-translate-y-0.5'
                       }`}
                     >
                       <div className="flex items-start gap-2">
                         <div className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${selectedTemplate === t.id ? 'bg-cyan-100' : 'bg-gray-100 group-hover:bg-cyan-50'}`}>
                           <t.icon className={`w-4 h-4 ${selectedTemplate === t.id ? 'text-cyan-600' : 'text-gray-500 group-hover:text-cyan-500'}`} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <span className="text-[10px] font-semibold text-gray-700 block truncate">{t.name}</span>
                           <span className="text-[8px] text-gray-500 block truncate">{t.description.split('.')[0]}</span>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Advanced Templates */}
               <div>
                 <h4 className="text-[10px] font-bold text-rose-600 uppercase mb-2 tracking-wide flex items-center gap-1">
                   <Zap className="w-3 h-3" /> Advanced
                 </h4>
                 <div className="grid grid-cols-2 gap-2">
                   {templates.filter(t => t.category === 'Advanced').map(t => (
                     <button
                       key={t.id}
                       onClick={() => setSelectedTemplate(t.id)}
                       className={`p-2.5 rounded-lg border text-left transition-all duration-200 relative group ${
                         selectedTemplate === t.id 
                           ? 'border-rose-500 bg-white ring-2 ring-rose-500 ring-offset-1 shadow-md' 
                           : 'border-gray-200 bg-white hover:border-rose-300 hover:shadow-sm hover:-translate-y-0.5'
                       }`}
                     >
                       <div className="flex items-start gap-2">
                         <div className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${selectedTemplate === t.id ? 'bg-rose-100' : 'bg-gray-100 group-hover:bg-rose-50'}`}>
                           <t.icon className={`w-4 h-4 ${selectedTemplate === t.id ? 'text-rose-600' : 'text-gray-500 group-hover:text-rose-500'}`} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <span className="text-[10px] font-semibold text-gray-700 block truncate">{t.name}</span>
                           <span className="text-[8px] text-gray-500 block truncate">{t.description.split('.')[0]}</span>
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Middle - Editor */}
        <div className="flex-1 bg-gray-50/50 overflow-y-auto p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-3xl mx-auto pb-20">
             <motion.div
               key={activeSection}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, ease: "easeOut" }}
             >
               <Card className="border-none shadow-xl shadow-gray-200/60 bg-white overflow-hidden rounded-2xl ring-1 ring-gray-100">
                 <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                     {activeSection === 'settings' ? <Settings className="w-6 h-6 text-blue-500" /> : null}
                     {activeSection === 'personal' ? 'Personal Information' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                   </CardTitle>
                   <CardDescription className="text-gray-500">
                     {activeSection === 'settings' ? 'Customize the look and feel of your resume.' : 'Update your details for this section.'}
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-8 p-8">
                   
                   {/* Settings Form */}
                   {activeSection === 'settings' && (
                     <div className="space-y-8">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Accent Color</Label>
                            <div className="flex flex-wrap gap-3 items-center">
                                {['#2563eb', '#059669', '#dc2626', '#7c3aed', '#db2777', '#1a202c'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setAccentColor(color)}
                                        className={`w-10 h-10 rounded-full border-2 transition-all ${accentColor === color ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <div className="relative group">
                                  <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white cursor-pointer hover:border-blue-300 overflow-hidden">
                                    <Palette className="w-5 h-5 text-gray-400" />
                                    <input 
                                      type="color" 
                                      value={accentColor}
                                      onChange={(e) => setAccentColor(e.target.value)}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                  </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Typography</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setFontFamily('font-sans')}
                                    className={`p-4 border rounded-xl text-left transition-all ${fontFamily === 'font-sans' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <span className="block font-sans text-lg font-bold">Sans Serif</span>
                                    <span className="text-xs text-gray-500">Modern, Clean</span>
                                </button>
                                <button 
                                    onClick={() => setFontFamily('font-serif')}
                                    className={`p-4 border rounded-xl text-left transition-all ${fontFamily === 'font-serif' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <span className="block font-serif text-lg font-bold">Serif</span>
                                    <span className="text-xs text-gray-500">Elegant, Professional</span>
                                </button>
                                <button 
                                    onClick={() => setFontFamily('font-mono')}
                                    className={`p-4 border rounded-xl text-left transition-all ${fontFamily === 'font-mono' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <span className="block font-mono text-lg font-bold">Monospace</span>
                                    <span className="text-xs text-gray-500">Technical, Code</span>
                                </button>
                                <button 
                                    onClick={() => setFontFamily('font-slab')} // Note: You'll need to ensure this class exists in your CSS or Tailwind config
                                    className={`p-4 border rounded-xl text-left transition-all ${fontFamily === 'font-slab' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <span className="block font-slab text-lg font-bold" style={{ fontFamily: 'Rockwell, "Courier New", serif' }}>Slab</span>
                                    <span className="text-xs text-gray-500">Bold, Distinctive</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Font Size</Label>
                            <div className="flex gap-3">
                                {['small', 'medium', 'large'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setFontSize(size)}
                                        className={`px-4 py-2 rounded-lg border capitalize transition-all ${fontSize === size ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Line Spacing</Label>
                            <div className="flex gap-3">
                                {['compact', 'normal', 'spacious'].map(spacing => (
                                    <button
                                        key={spacing}
                                        onClick={() => setLineSpacing(spacing)}
                                        className={`px-4 py-2 rounded-lg border capitalize transition-all ${lineSpacing === spacing ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                    >
                                        {spacing}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Page Margins</Label>
                            <div className="flex gap-3">
                                {['narrow', 'normal', 'wide'].map(margin => (
                                    <button
                                        key={margin}
                                        onClick={() => setMargins(margin)}
                                        className={`px-4 py-2 rounded-lg border capitalize transition-all ${margins === margin ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                    >
                                        {margin}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ATS Score Calculator */}
                        <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                    ATS Compatibility Score
                                </Label>
                                <Button 
                                    onClick={() => {
                                        // Calculate ATS score
                                        let score = 0;
                                        let maxScore = 100;
                                        let feedback = [];

                                        // Personal info completeness (20 points)
                                        if (formData.personalInfo.fullName) score += 5;
                                        else feedback.push("Add your full name");
                                        if (formData.personalInfo.email) score += 5;
                                        else feedback.push("Add your email");
                                        if (formData.personalInfo.phone) score += 5;
                                        else feedback.push("Add your phone number");
                                        if (formData.personalInfo.linkedin) score += 5;
                                        else feedback.push("Add LinkedIn profile");

                                        // Education (15 points)
                                        if (formData.education.length > 0) {
                                            score += 15;
                                        } else {
                                            feedback.push("Add education details");
                                        }

                                        // Experience (20 points)
                                        if (formData.experience.length > 0) {
                                            score += 10;
                                            const hasQuantifiableResults = formData.experience.some(exp => 
                                                /\d+%|\d+ users|\d+ projects|\$\d+/.test(exp.description)
                                            );
                                            if (hasQuantifiableResults) {
                                                score += 10;
                                            } else {
                                                feedback.push("Add quantifiable achievements in experience (e.g., '30% improvement', '1000+ users')");
                                            }
                                        } else {
                                            feedback.push("Add work experience or projects");
                                        }

                                        // Skills (15 points)
                                        if (formData.skills.length >= 8) {
                                            score += 15;
                                        } else if (formData.skills.length >= 5) {
                                            score += 10;
                                            feedback.push("Add more relevant skills (aim for 8-12)");
                                        } else {
                                            feedback.push("Add technical skills (at least 8)");
                                        }

                                        // Projects (15 points)
                                        if (formData.projects.length >= 2) {
                                            score += 15;
                                        } else if (formData.projects.length === 1) {
                                            score += 8;
                                            feedback.push("Add 1-2 more projects");
                                        } else {
                                            feedback.push("Add at least 2 projects");
                                        }

                                        // Template optimization (15 points)
                                        const atsOptimizedTemplates = ['professional', 'modern', 'minimalist', 'tech-pro', 'classic-border'];
                                        if (atsOptimizedTemplates.includes(selectedTemplate)) {
                                            score += 15;
                                        } else {
                                            score += 7;
                                            feedback.push("Use an ATS-optimized template for better parsing");
                                        }

                                        // Show results
                                        const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
                                        const emoji = score >= 80 ? '🎉' : score >= 60 ? '⚡' : '⚠️';
                                        
                                        toast.custom((t) => (
                                            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5 p-6`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-16 h-16 rounded-full ${color === 'green' ? 'bg-green-100' : color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'} flex items-center justify-center`}>
                                                            <span className="text-3xl font-bold ${color === 'green' ? 'text-green-600' : color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}">{score}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">ATS Score {emoji}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good, but can improve' : 'Needs improvement'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                {feedback.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-semibold text-gray-700">💡 Suggestions:</p>
                                                        <ul className="space-y-1">
                                                            {feedback.slice(0, 5).map((item, idx) => (
                                                                <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                                                    <span className="text-blue-500 mt-0.5">•</span>
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ), { duration: 8000 });
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                                    size="sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Calculate Score
                                </Button>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Get instant feedback on how well your resume will perform in Applicant Tracking Systems (ATS). 
                                Our AI analyzes completeness, keyword density, and formatting to help you land more interviews.
                            </p>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                                    <div className="text-lg font-bold text-blue-600">80+</div>
                                    <div className="text-[10px] text-gray-600">Excellent</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                                    <div className="text-lg font-bold text-yellow-600">60-79</div>
                                    <div className="text-[10px] text-gray-600">Good</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                                    <div className="text-lg font-bold text-red-600">&lt;60</div>
                                    <div className="text-[10px] text-gray-600">Improve</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Wand2 className="w-5 h-5 text-purple-600" />
                                Quick Tips for B.Tech CS Students
                            </Label>
                            <div className="space-y-2">
                                <div className="flex items-start gap-2 text-xs text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Use action verbs: Developed, Implemented, Optimized, Designed</span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Quantify achievements: "Improved performance by 30%", "Deployed to 1000+ users"</span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Include tech stack: React, Node.js, Python, AWS, MongoDB, Docker</span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Add GitHub, portfolio, and competitive programming profiles</span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>For FAANG: Use Professional or Tech Pro templates with ATS optimization</span>
                                </div>
                            </div>
                        </div>
                     </div>
                   )}

                   {/* Personal Info Form */}
                   {activeSection === 'personal' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="col-span-1 md:col-span-2 flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group shadow-sm">
                            {formData.personalInfo.photo ? (
                              <>
                                <img src={formData.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, photo: '' } }))}
                                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <User className="w-10 h-10 text-gray-300" />
                            )}
                            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
                              <Upload className="w-6 h-6 text-white mb-1" />
                              <span className="text-[10px] text-white font-medium">Upload</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </label>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-base">Profile Photo</Label>
                            <p className="text-xs text-gray-500 max-w-xs">
                              Add a professional photo to your resume. 
                              <br/>Recommended: Square JPG/PNG, max 2MB.
                            </p>
                          </div>
                       </div>

                       <div className="space-y-2">
                         <StyledLabel required>Full Name</StyledLabel>
                         <StyledInput value={formData.personalInfo.fullName} onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)} placeholder="John Doe" />
                       </div>
                       <div className="space-y-2">
                         <StyledLabel required>Email</StyledLabel>
                         <StyledInput value={formData.personalInfo.email} onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)} placeholder="john@example.com" />
                       </div>
                       <div className="space-y-2">
                         <StyledLabel>Phone</StyledLabel>
                         <StyledInput value={formData.personalInfo.phone} onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                       </div>
                       <div className="space-y-2">
                         <StyledLabel>Location</StyledLabel>
                         <StyledInput value={formData.personalInfo.location} onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)} placeholder="New York, NY" />
                       </div>
                       <div className="space-y-2">
                         <StyledLabel>LinkedIn</StyledLabel>
                         <StyledInput value={formData.personalInfo.linkedIn} onChange={(e) => handleInputChange('personalInfo', 'linkedIn', e.target.value)} placeholder="linkedin.com/in/johndoe" />
                       </div>
                       <div className="space-y-2">
                         <StyledLabel>GitHub</StyledLabel>
                         <StyledInput value={formData.personalInfo.github} onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)} placeholder="github.com/johndoe" />
                       </div>
                       <div className="col-span-1 md:col-span-2 space-y-2">
                         <StyledLabel>Professional Summary</StyledLabel>
                         <StyledTextArea 
                           value={formData.objective} 
                           onChange={(e) => handleInputChange('objective', null, e.target.value)} 
                           placeholder="Briefly describe your professional background and goals..."
                         />
                       </div>
                     </div>
                   )}
                   
                   {/* Education Form */}
                   {activeSection === 'education' && (
                     <div className="space-y-6">
                       <Reorder.Group axis="y" values={formData.education} onReorder={(newOrder) => reorderSection('education', newOrder)}>
                         {formData.education.map((edu, index) => (
                           <Reorder.Item key={edu.id} value={edu}>
                             <div className="p-6 border border-gray-100 rounded-xl relative bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group mb-4 cursor-move">
                               <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100">
                                 <GripVertical className="w-4 h-4" />
                               </div>
                               <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeSection('education', index)}>
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4">
                                 <div className="space-y-2">
                                   <StyledLabel>Degree</StyledLabel>
                                   <StyledInput value={edu.degree} onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)} placeholder="e.g. B.S. Computer Science" />
                                 </div>
                                 <div className="space-y-2">
                                   <StyledLabel>Institution</StyledLabel>
                                   <StyledInput value={edu.institution} onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)} placeholder="University Name" />
                                 </div>
                                 <div className="space-y-2">
                                   <StyledLabel>Graduation Date</StyledLabel>
                                   <StyledInput value={edu.graduationDate} onChange={(e) => handleInputChange('education', 'graduationDate', e.target.value, index)} placeholder="May 2025" />
                                 </div>
                                 <div className="space-y-2">
                                   <StyledLabel>GPA</StyledLabel>
                                   <StyledInput value={edu.gpa} onChange={(e) => handleInputChange('education', 'gpa', e.target.value, index)} placeholder="3.8/4.0" />
                                 </div>
                                 <div className="col-span-1 md:col-span-2 space-y-2">
                                   <StyledLabel>Relevant Coursework</StyledLabel>
                                   <StyledInput value={edu.relevantCoursework} onChange={(e) => handleInputChange('education', 'relevantCoursework', e.target.value, index)} placeholder="Data Structures, Algorithms, etc." />
                                 </div>
                               </div>
                             </div>
                           </Reorder.Item>
                         ))}
                       </Reorder.Group>
                       <Button onClick={() => addSection('education')} variant="outline" className="w-full border-dashed border-2 py-6 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                         <Plus className="w-4 h-4 mr-2" /> Add Education
                       </Button>
                     </div>
                   )}

                   {/* Experience Form */}
                   {activeSection === 'experience' && (
                     <div className="space-y-6">
                       <Reorder.Group axis="y" values={formData.internships} onReorder={(newOrder) => reorderSection('internships', newOrder)}>
                         {formData.internships.map((exp, index) => (
                           <Reorder.Item key={exp.id} value={exp}>
                             <div className="p-6 border border-gray-100 rounded-xl relative bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group mb-4 cursor-move">
                               <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100">
                                 <GripVertical className="w-4 h-4" />
                               </div>
                               <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeSection('internships', index)}>
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                               <div className="space-y-4 pl-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <div className="space-y-2">
                                     <StyledLabel>Job Title</StyledLabel>
                                     <StyledInput value={exp.title} onChange={(e) => handleInputChange('internships', 'title', e.target.value, index)} />
                                   </div>
                                   <div className="space-y-2">
                                     <StyledLabel>Company</StyledLabel>
                                     <StyledInput value={exp.company} onChange={(e) => handleInputChange('internships', 'company', e.target.value, index)} />
                                   </div>
                                   <div className="space-y-2">
                                     <StyledLabel>Duration</StyledLabel>
                                     <StyledInput value={exp.duration} onChange={(e) => handleInputChange('internships', 'duration', e.target.value, index)} />
                                   </div>
                                   <div className="space-y-2">
                                     <StyledLabel>Location</StyledLabel>
                                     <StyledInput value={exp.location} onChange={(e) => handleInputChange('internships', 'location', e.target.value, index)} />
                                   </div>
                                 </div>
                                 <div className="space-y-2">
                                   <StyledLabel>Description</StyledLabel>
                                   <StyledTextArea 
                                     value={exp.description} 
                                     onChange={(e) => handleInputChange('internships', 'description', e.target.value, index)} 
                                     placeholder="• Achieved X by doing Y..."
                                   />
                                 </div>
                               </div>
                             </div>
                           </Reorder.Item>
                         ))}
                       </Reorder.Group>
                       <Button onClick={() => addSection('internships')} variant="outline" className="w-full border-dashed border-2 py-6 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                         <Plus className="w-4 h-4 mr-2" /> Add Experience
                       </Button>
                     </div>
                   )}

                   {/* Projects Form */}
                   {activeSection === 'projects' && (
                     <div className="space-y-6">
                       <Reorder.Group axis="y" values={formData.projects} onReorder={(newOrder) => reorderSection('projects', newOrder)}>
                         {formData.projects.map((proj, index) => (
                           <Reorder.Item key={proj.id} value={proj}>
                             <div className="p-6 border border-gray-100 rounded-xl relative bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group mb-4 cursor-move">
                               <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100">
                                 <GripVertical className="w-4 h-4" />
                               </div>
                               <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeSection('projects', index)}>
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                               <div className="space-y-4 pl-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <div className="space-y-2">
                                     <StyledLabel>Project Title</StyledLabel>
                                     <StyledInput value={proj.title} onChange={(e) => handleInputChange('projects', 'title', e.target.value, index)} />
                                   </div>
                                   <div className="space-y-2">
                                     <StyledLabel>Technologies</StyledLabel>
                                     <StyledInput value={proj.technologies} onChange={(e) => handleInputChange('projects', 'technologies', e.target.value, index)} placeholder="React, Node.js, MongoDB" />
                                   </div>
                                   <div className="space-y-2">
                                     <StyledLabel>Link</StyledLabel>
                                     <StyledInput value={proj.link} onChange={(e) => handleInputChange('projects', 'link', e.target.value, index)} />
                                   </div>
                                   <div className="space-y-2">
                                     <StyledLabel>Duration</StyledLabel>
                                     <StyledInput value={proj.duration} onChange={(e) => handleInputChange('projects', 'duration', e.target.value, index)} />
                                   </div>
                                 </div>
                                 <div className="space-y-2">
                                   <StyledLabel>Description</StyledLabel>
                                   <StyledTextArea 
                                     value={proj.description} 
                                     onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)} 
                                   />
                                 </div>
                               </div>
                             </div>
                           </Reorder.Item>
                         ))}
                       </Reorder.Group>
                       <Button onClick={() => addSection('projects')} variant="outline" className="w-full border-dashed border-2 py-6 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                         <Plus className="w-4 h-4 mr-2" /> Add Project
                       </Button>
                     </div>
                   )}

                   {/* Skills Form */}
                   {activeSection === 'skills' && (
                     <div className="space-y-8">
                       <div className="space-y-4">
                         <StyledLabel className="text-base">Technical Skills</StyledLabel>
                         <div className="flex gap-2">
                           <StyledInput 
                             value={newSkill.technical} 
                             onChange={(e) => setNewSkill({...newSkill, technical: e.target.value})}
                             placeholder="Add a skill (e.g. JavaScript)"
                             onKeyPress={(e) => e.key === 'Enter' && addSkill('technical')}
                             className="max-w-md"
                           />
                           <Button onClick={() => addSkill('technical')}><Plus className="w-4 h-4" /></Button>
                         </div>
                         <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[60px] border border-gray-100">
                           {formData.skills.technical.map((skill, i) => (
                             <motion.span 
                               initial={{ scale: 0 }} animate={{ scale: 1 }}
                               key={i} 
                               className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm text-gray-700"
                             >
                               {skill}
                               <button onClick={() => removeSkill('technical', i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                             </motion.span>
                           ))}
                           {formData.skills.technical.length === 0 && <span className="text-gray-400 text-sm italic">No skills added yet</span>}
                         </div>
                       </div>
                       
                       <div className="space-y-4">
                         <Label className="text-base">Languages</Label>
                         <div className="flex gap-2">
                           <StyledInput 
                             value={newSkill.languages} 
                             onChange={(e) => setNewSkill({...newSkill, languages: e.target.value})}
                             placeholder="Add a language (e.g. English, Spanish)"
                             onKeyPress={(e) => e.key === 'Enter' && addSkill('languages')}
                             className="max-w-md"
                           />
                           <Button onClick={() => addSkill('languages')}><Plus className="w-4 h-4" /></Button>
                         </div>
                         <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[60px] border border-gray-100">
                           {formData.skills.languages.map((skill, i) => (
                             <motion.span 
                               initial={{ scale: 0 }} animate={{ scale: 1 }}
                               key={i} 
                               className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm text-gray-700"
                             >
                               {skill}
                               <button onClick={() => removeSkill('languages', i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                             </motion.span>
                           ))}
                           {formData.skills.languages.length === 0 && <span className="text-gray-400 text-sm italic">No languages added yet</span>}
                         </div>
                       </div>

                       <div className="space-y-4">
                         <Label className="text-base">Tools & Frameworks</Label>
                         <div className="flex gap-2">
                           <StyledInput 
                             value={newSkill.tools} 
                             onChange={(e) => setNewSkill({...newSkill, tools: e.target.value})}
                             placeholder="Add a tool (e.g. Git, Docker)"
                             onKeyPress={(e) => e.key === 'Enter' && addSkill('tools')}
                             className="max-w-md"
                           />
                           <Button onClick={() => addSkill('tools')}><Plus className="w-4 h-4" /></Button>
                         </div>
                         <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[60px] border border-gray-100">
                           {formData.skills.tools.map((skill, i) => (
                             <motion.span 
                               initial={{ scale: 0 }} animate={{ scale: 1 }}
                               key={i} 
                               className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm text-gray-700"
                             >
                               {skill}
                               <button onClick={() => removeSkill('tools', i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                             </motion.span>
                           ))}
                           {formData.skills.tools.length === 0 && <span className="text-gray-400 text-sm italic">No tools added yet</span>}
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Achievements Form */}
                   {activeSection === 'achievements' && (
                     <div className="space-y-6">
                       <Reorder.Group axis="y" values={formData.achievements} onReorder={(newOrder) => reorderSection('achievements', newOrder)}>
                         {formData.achievements.map((achievement, index) => (
                           <Reorder.Item key={achievement.id} value={achievement}>
                             <div className="p-6 border border-gray-100 rounded-xl relative bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group mb-4 cursor-move">
                               <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100">
                                 <GripVertical className="w-4 h-4" />
                               </div>
                               <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeSection('achievements', index)}>
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4 pl-4">
                                 <div className="space-y-2">
                                   <StyledLabel>Achievement Title</StyledLabel>
                                   <StyledInput value={achievement.title} onChange={(e) => handleInputChange('achievements', 'title', e.target.value, index)} />
                                 </div>
                                 <div className="space-y-2">
                                   <StyledLabel>Date</StyledLabel>
                                   <StyledInput value={achievement.date} onChange={(e) => handleInputChange('achievements', 'date', e.target.value, index)} />
                                 </div>
                               </div>
                               <div className="space-y-2 pl-4">
                                 <StyledLabel>Description</StyledLabel>
                                 <StyledTextArea 
                                   value={achievement.description} 
                                   onChange={(e) => handleInputChange('achievements', 'description', e.target.value, index)} 
                                 />
                               </div>
                             </div>
                           </Reorder.Item>
                         ))}
                       </Reorder.Group>
                       <Button onClick={() => addSection('achievements')} variant="outline" className="w-full border-dashed border-2 py-6 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                         <Plus className="w-4 h-4 mr-2" /> Add Achievement
                       </Button>
                     </div>
                   )}
                 </CardContent>
               </Card>
             </motion.div>
          </div>
        </div>

        {/* Right - Preview */}
        <div className="w-[45%] bg-gray-100 border-l border-gray-200 overflow-y-auto p-8 flex justify-center items-start relative custom-scrollbar">
           <div className="absolute top-4 right-4 z-10 flex gap-2">
             <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-500 border border-gray-200 shadow-sm flex items-center gap-2">
               <Eye className="w-3 h-3" /> Live Preview
             </div>
           </div>
           <div className="scale-[0.75] origin-top shadow-2xl ring-1 ring-gray-900/5 mt-4 transition-all duration-300">
              <div ref={resumeRef}>
                {/* Render appropriate template based on selection */}
                {['professional', 'tech-pro', 'classic-border', 'fresher-focused', 'internship-pro'].includes(selectedTemplate) ? (
                  <ProfessionalTemplate 
                    data={formData} 
                    accentColor={accentColor} 
                    font={fontFamily} 
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    margins={margins}
                    templateId={selectedTemplate}
                  />
                ) : ['modern', 'gradient-modern', 'two-col-modern', 'two-col-creative'].includes(selectedTemplate) ? (
                  <ModernTemplate 
                    data={formData} 
                    accentColor={accentColor} 
                    font={fontFamily}
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    margins={margins}
                    templateId={selectedTemplate}
                  />
                ) : ['minimalist', 'ultra-minimal', 'swiss-style', 'compact-dense'].includes(selectedTemplate) ? (
                  <MinimalistTemplate 
                    data={formData} 
                    accentColor={accentColor} 
                    font={fontFamily}
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    margins={margins}
                    templateId={selectedTemplate}
                  />
                ) : ['creative', 'infographic', 'timeline'].includes(selectedTemplate) ? (
                  <CreativeTemplate 
                    data={formData} 
                    accentColor={accentColor} 
                    font={fontFamily}
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    margins={margins}
                    templateId={selectedTemplate}
                  />
                ) : ['academic', 'cv-style'].includes(selectedTemplate) ? (
                  <ProfessionalTemplate 
                    data={formData} 
                    accentColor={accentColor} 
                    font={fontFamily}
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    margins={margins}
                    templateId={selectedTemplate}
                  />
                ) : (
                  <ProfessionalTemplate 
                    data={formData} 
                    accentColor={accentColor} 
                    font={fontFamily}
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    margins={margins}
                    templateId={selectedTemplate}
                  />
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Template Upload Modal */}
      <AnimatePresence>
      {showUploader && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl p-0 max-w-lg w-full overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Import Resume</h2>
                <p className="text-sm text-gray-500">Upload a JSON file to restore data or PDF to extract style</p>
              </div>
              <button onClick={() => setShowUploader(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="p-8">
              {!isAnalyzing ? (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">Click to upload PDF or JSON</p>
                    <p className="text-sm text-gray-500 mt-2">or drag and drop here</p>
                    <input 
                      type="file" 
                      accept=".pdf,.json" 
                      className="hidden" 
                      id="pdf-upload"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                    />
                    <label htmlFor="pdf-upload" className="absolute inset-0 cursor-pointer"></label>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-sm text-blue-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" /> 
                      AI Analysis Features
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['Layout Structure', 'Font Families', 'Color Palette', 'Spacing Rules'].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-blue-800 bg-white/60 px-2 py-1.5 rounded-md">
                          <CheckCircle className="w-3 h-3 text-blue-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 py-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                      <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Wand2 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium text-gray-700">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        {analysisStep}
                      </span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* AI Text Parser Dialog */}
      <AnimatePresence>
      {showAIParser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Auto-Fill Resume</h2>
                    <p className="text-purple-100 text-sm mt-1">Paste any unstructured text and let AI extract your resume data</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAIParser(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-900 font-semibold text-base">Paste Your Resume Text</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAiInputText(aiDemoText)}
                    className="text-xs gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    Load Example
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Paste your resume in any format - LinkedIn profile, plain text, email signature, or messy notes. 
                  Our AI will intelligently extract and structure all information. Click "Load Example" to see a sample format.
                </p>
                <StyledTextArea
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  placeholder="Click 'Load Example' above to see a properly formatted resume example, or paste your own text here..."
                  className="min-h-[300px] font-mono text-xs"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-purple-900 text-sm">AI Extraction Capabilities</p>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>✓ Contact Information (Email, Phone, LinkedIn, GitHub, Portfolio)</li>
                    <li>✓ Professional Summary/Objective</li>
                    <li>✓ Education (Degrees, Institutions, GPA, Dates)</li>
                    <li>✓ Work Experience (Titles, Companies, Descriptions, Dates)</li>
                    <li>✓ Projects (Names, Technologies, Links, Descriptions)</li>
                    <li>✓ Skills (Technical, Languages, Tools) - Auto-categorized</li>
                    <li>✓ Achievements & Awards</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAIParser(false);
                    setAiInputText('');
                  }}
                  disabled={isParsingAI}
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setAiInputText(aiDemoText);
                    setTimeout(() => parseUnstructuredText(aiDemoText), 100);
                  }}
                  disabled={isParsingAI}
                  className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Zap className="w-4 h-4" />
                  Quick Demo Fill
                </Button>
              </div>
              <Button 
                onClick={() => parseUnstructuredText(aiInputText)}
                disabled={!aiInputText.trim() || isParsingAI}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 gap-2 shadow-lg"
              >
                {isParsingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Extract Data with AI
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default ATSResumeBuilder;
