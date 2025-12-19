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
  GripVertical, Type, RefreshCw, AlertCircle, Cloud, Github, Linkedin,
  Mail, Phone, MapPin, Globe, Award, Target, Zap, Star, TrendingUp,
  BookOpen, Coffee, Rocket, Heart
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import resumeService from '../services/resumeService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// === ENHANCED STYLED COMPONENTS ===
const StyledInput = ({ className, ...props }) => (
  <Input 
    className={`bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:border-blue-400 text-gray-900 ${className}`} 
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
    {required && <span className="text-red-400">*</span>}
  </Label>
);

// === 15+ PROFESSIONAL RESUME TEMPLATES ===

// Template 1: Classic Professional (ATS-Optimized)
const ClassicProfessionalTemplate = ({ data, accentColor = '#2563eb', font = 'font-sans', fontSize = 'medium', lineSpacing = 'normal', margins = 'normal' }) => {
  const getFontSize = () => fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';
  const getSpacing = () => lineSpacing === 'compact' ? 'space-y-2' : lineSpacing === 'spacious' ? 'space-y-6' : 'space-y-4';
  const getMargins = () => margins === 'narrow' ? 'p-6' : margins === 'wide' ? 'p-14' : 'p-10';

  return (
    <div className={`${getMargins()} bg-white text-gray-900 ${font} max-w-[210mm] mx-auto min-h-[297mm]`}>
      <div className="border-b-2 pb-4 mb-6" style={{ borderColor: accentColor }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: accentColor }}>{data.personalInfo.fullName}</h1>
        <div className={`flex flex-wrap gap-3 ${getFontSize()} text-gray-600`}>
          {data.personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{data.personalInfo.location}</span>}
          {data.personalInfo.linkedIn && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" />{data.personalInfo.linkedIn}</span>}
          {data.personalInfo.github && <span className="flex items-center gap-1"><Github className="w-3 h-3" />{data.personalInfo.github}</span>}
        </div>
      </div>

      {data.objective && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2" style={{ color: accentColor }}>Professional Summary</h2>
          <p className={`${getFontSize()} text-gray-700 leading-relaxed`}>{data.objective}</p>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-3" style={{ color: accentColor }}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                </div>
                <div className="text-right">
                  <p className={`${getFontSize()} font-semibold text-gray-700`}>{edu.graduationDate}</p>
                  {edu.gpa && <p className={`${getFontSize()} text-gray-600`}>GPA: {edu.gpa}</p>}
                </div>
              </div>
              {edu.relevantCoursework && <p className={`${getFontSize()} text-gray-600 mt-1`}>Relevant Coursework: {edu.relevantCoursework}</p>}
            </div>
          ))}
        </div>
      )}

      {(data.skills.technical.length > 0 || data.skills.languages.length > 0) && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-3" style={{ color: accentColor }}>Technical Skills</h2>
          <div className={`${getFontSize()} ${getSpacing()}`}>
            {data.skills.languages.length > 0 && (
              <p><span className="font-bold">Programming Languages:</span> {data.skills.languages.join(', ')}</p>
            )}
            {data.skills.technical.length > 0 && (
              <p><span className="font-bold">Technologies & Frameworks:</span> {data.skills.technical.join(', ')}</p>
            )}
            {data.skills.tools.length > 0 && (
              <p><span className="font-bold">Tools & Platforms:</span> {data.skills.tools.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {data.internships.some(i => i.title) && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-3" style={{ borderColor: accentColor }}>Experience</h2>
          {data.internships.filter(i => i.title).map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900">{exp.title}</h3>
                <span className={`${getFontSize()} font-semibold text-gray-600`}>{exp.duration}</span>
              </div>
              <p className="text-gray-700">{exp.company} | {exp.location}</p>
              <p className={`${getFontSize()} text-gray-600 mt-1 whitespace-pre-line`}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {data.projects.some(p => p.title) && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-3" style={{ color: accentColor }}>Projects</h2>
          {data.projects.filter(p => p.title).map((proj, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900">{proj.title}</h3>
                {proj.link && <a href={proj.link} className={`${getFontSize()} text-blue-600 hover:underline`}>{proj.link}</a>}
              </div>
              {proj.technologies && <p className={`${getFontSize()} font-semibold text-gray-600`}>Tech Stack: {proj.technologies}</p>}
              <p className={`${getFontSize()} text-gray-600 mt-1`}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {data.achievements.some(a => a.title) && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-3" style={{ color: accentColor }}>Achievements & Awards</h2>
          <ul className="list-disc list-outside ml-5 space-y-1">
            {data.achievements.filter(a => a.title).map((ach, i) => (
              <li key={i} className={`${getFontSize()} text-gray-700`}>
                <span className="font-bold">{ach.title}</span>
                {ach.date && <span className="text-gray-500"> ({ach.date})</span>}
                {ach.description && <span> - {ach.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Template 2: Modern Tech (Google/Microsoft Style)
const ModernTechTemplate = ({ data, accentColor = '#4285f4', font = 'font-sans', fontSize = 'medium', lineSpacing = 'normal', margins = 'normal' }) => {
  const getFontSize = () => fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';
  const getMargins = () => margins === 'narrow' ? 'p-6' : margins === 'wide' ? 'p-14' : 'p-10';

  return (
    <div className={`${getMargins()} bg-white text-gray-900 ${font} max-w-[210mm] mx-auto min-h-[297mm]`}>
      <div className="flex items-center gap-6 mb-8 pb-6 border-b">
        {data.personalInfo.photo && (
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-md" style={{ borderColor: accentColor }}>
            <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2" style={{ color: accentColor }}>{data.personalInfo.fullName}</h1>
          <p className="text-lg text-gray-600 font-medium">{data.objective && data.objective.split('.')[0]}</p>
          <div className={`flex flex-wrap gap-3 mt-2 ${getFontSize()} text-gray-500`}>
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {data.internships.some(i => i.title) && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: accentColor }}>
                <div className="w-1 h-6 rounded" style={{ backgroundColor: accentColor }}></div>
                EXPERIENCE
              </h2>
              <div className="space-y-6">
                {data.internships.filter(i => i.title).map((exp, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
                    <h3 className="font-bold text-lg">{exp.title}</h3>
                    <p className="text-gray-600 font-medium">{exp.company}</p>
                    <p className={`${getFontSize()} text-gray-500 mb-2`}>{exp.duration} | {exp.location}</p>
                    <p className={`${getFontSize()} text-gray-700`}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.projects.some(p => p.title) && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: accentColor }}>
                <div className="w-1 h-6 rounded" style={{ backgroundColor: accentColor }}></div>
                PROJECTS
              </h2>
              <div className="space-y-6">
                {data.projects.filter(p => p.title).map((proj, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-lg">{proj.title}</h3>
                      {proj.link && <a href={proj.link} className={`${getFontSize()} text-blue-600`}>{proj.link}</a>}
                    </div>
                    {proj.technologies && <p className={`${getFontSize()} font-semibold text-gray-500`}>{proj.technologies}</p>}
                    <p className={`${getFontSize()} text-gray-700 mt-1`}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3" style={{ color: accentColor }}>EDUCATION</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg mb-3">
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p className={`${getFontSize()} text-gray-700`}>{edu.institution}</p>
                  <p className={`${getFontSize()} text-gray-500`}>{edu.graduationDate}</p>
                  {edu.gpa && <p className={`${getFontSize()} font-semibold text-gray-600`}>GPA: {edu.gpa}</p>}
                </div>
              ))}
            </section>
          )}

          {(data.skills.technical.length > 0 || data.skills.languages.length > 0) && (
            <section>
              <h2 className="text-lg font-bold mb-3" style={{ color: accentColor }}>SKILLS</h2>
              <div className="space-y-3">
                {data.skills.languages.length > 0 && (
                  <div>
                    <h4 className={`${getFontSize()} font-bold text-gray-600 mb-2`}>Languages</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.languages.map((s, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.technical.length > 0 && (
                  <div>
                    <h4 className={`${getFontSize()} font-bold text-gray-600 mb-2`}>Technologies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.technical.map((s, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">{s}</span>
                      ))}
                    </div>
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

// Template 3: Minimalist Clean
const MinimalistCleanTemplate = ({ data, accentColor = '#1a202c', font = 'font-serif', fontSize = 'medium', lineSpacing = 'normal', margins = 'normal' }) => {
  const getFontSize = () => fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';
  const getMargins = () => margins === 'narrow' ? 'p-6' : margins === 'wide' ? 'p-14' : 'p-10';

  return (
    <div className={`${getMargins()} bg-white text-gray-900 ${font} max-w-[210mm] mx-auto min-h-[297mm]`}>
      <div className="text-center mb-10 border-b pb-6">
        <h1 className="text-5xl font-light tracking-wider mb-3" style={{ color: accentColor }}>{data.personalInfo.fullName}</h1>
        <div className={`${getFontSize()} text-gray-600 space-x-4`}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>|</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>|</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      {data.objective && (
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className={`${getFontSize()} text-gray-600 italic leading-relaxed`}>{data.objective}</p>
        </div>
      )}

      <div className="space-y-8">
        {data.education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-center mb-4 text-gray-400">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="text-center mb-4">
                <h3 className="font-bold">{edu.institution}</h3>
                <p className="text-gray-700">{edu.degree}</p>
                <p className={`${getFontSize()} text-gray-500`}>{edu.graduationDate} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
              </div>
            ))}
          </section>
        )}

        {data.internships.some(i => i.title) && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-center mb-6 text-gray-400">Experience</h2>
            {data.internships.filter(i => i.title).map((exp, i) => (
              <div key={i} className="mb-6">
                <div className="text-center mb-2">
                  <h3 className="font-bold text-lg">{exp.title}</h3>
                  <p className="text-gray-700">{exp.company} | {exp.duration}</p>
                </div>
                <p className={`${getFontSize()} text-gray-600 text-center max-w-3xl mx-auto`}>{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {data.projects.some(p => p.title) && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-center mb-6 text-gray-400">Projects</h2>
            <div className="grid grid-cols-2 gap-6">
              {data.projects.filter(p => p.title).map((proj, i) => (
                <div key={i} className="border-t pt-4">
                  <h3 className="font-bold text-center">{proj.title}</h3>
                  {proj.technologies && <p className={`${getFontSize()} text-gray-500 text-center mb-2`}>{proj.technologies}</p>}
                  <p className={`${getFontSize()} text-gray-600 text-center`}>{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(data.skills.technical.length > 0 || data.skills.languages.length > 0) && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-center mb-4 text-gray-400">Skills</h2>
            <div className="text-center space-y-2">
              {data.skills.languages.length > 0 && (
                <p className={`${getFontSize()} text-gray-700`}>
                  <span className="font-bold">Languages:</span> {data.skills.languages.join(' • ')}
                </p>
              )}
              {data.skills.technical.length > 0 && (
                <p className={`${getFontSize()} text-gray-700`}>
                  <span className="font-bold">Technologies:</span> {data.skills.technical.join(' • ')}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Template 4: Creative Developer (Startups/Creative Tech)
const CreativeDeveloperTemplate = ({ data, accentColor = '#8b5cf6', font = 'font-sans', fontSize = 'medium', lineSpacing = 'normal', margins = 'normal' }) => {
  const getFontSize = () => fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className={`bg-white text-gray-900 ${font} max-w-[210mm] mx-auto min-h-[297mm] flex`}>
      <div className="w-1/3 p-8 text-white" style={{ backgroundColor: accentColor }}>
        {data.personalInfo.photo && (
          <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/30">
            <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-center mb-6">{data.personalInfo.fullName}</h1>
        
        <div className="space-y-3 text-sm text-white/90 mb-8">
          {data.personalInfo.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{data.personalInfo.email}</span></div>}
          {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{data.personalInfo.phone}</span></div>}
          {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{data.personalInfo.location}</span></div>}
          {data.personalInfo.linkedIn && <div className="flex items-center gap-2"><Linkedin className="w-4 h-4" /><span className="truncate">{data.personalInfo.linkedIn}</span></div>}
          {data.personalInfo.github && <div className="flex items-center gap-2"><Github className="w-4 h-4" /><span className="truncate">{data.personalInfo.github}</span></div>}
        </div>

        {data.education.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-white/20 pb-2">Education</h3>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-4">
                <p className="font-bold text-white">{edu.degree}</p>
                <p className="text-white/80 text-sm">{edu.institution}</p>
                <p className="text-white/60 text-xs">{edu.graduationDate}</p>
              </div>
            ))}
          </div>
        )}

        {(data.skills.technical.length > 0 || data.skills.languages.length > 0) && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-white/20 pb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {[...data.skills.languages, ...data.skills.technical].map((skill, i) => (
                <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-2/3 p-10 space-y-8">
        {data.objective && (
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: accentColor }}>About Me</h2>
            <p className={`${getFontSize()} text-gray-700 leading-relaxed`}>{data.objective}</p>
          </section>
        )}

        {data.internships.some(i => i.title) && (
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: accentColor }}>Experience</h2>
            <div className="space-y-6">
              {data.internships.filter(i => i.title).map((exp, i) => (
                <div key={i} className="border-l-4 pl-4" style={{ borderColor: accentColor }}>
                  <h3 className="font-bold text-lg">{exp.title}</h3>
                  <p className="text-gray-600 font-medium">{exp.company} | {exp.duration}</p>
                  <p className={`${getFontSize()} text-gray-700 mt-2`}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.some(p => p.title) && (
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: accentColor }}>Projects</h2>
            <div className="space-y-6">
              {data.projects.filter(p => p.title).map((proj, i) => (
                <div key={i}>
                  <h3 className="font-bold text-lg">{proj.title}</h3>
                  {proj.technologies && <p className={`${getFontSize()} text-gray-500 font-semibold`}>{proj.technologies}</p>}
                  <p className={`${getFontSize()} text-gray-700 mt-1`}>{proj.description}</p>
                  {proj.link && <a href={proj.link} className="text-xs text-blue-600 hover:underline mt-1 inline-block">View Project →</a>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Template 5: Two-Column Professional
const TwoColumnProfessionalTemplate = ({ data, accentColor = '#059669', font = 'font-sans', fontSize = 'medium', lineSpacing = 'normal', margins = 'normal' }) => {
  const getFontSize = () => fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';
  const getMargins = () => margins === 'narrow' ? 'p-6' : margins === 'wide' ? 'p-12' : 'p-10';

  return (
    <div className={`${getMargins()} bg-white text-gray-900 ${font} max-w-[210mm] mx-auto min-h-[297mm]`}>
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-2" style={{ color: accentColor }}>{data.personalInfo.fullName}</h1>
        <div className="h-1 w-24 mx-auto mb-4" style={{ backgroundColor: accentColor }}></div>
        <div className={`${getFontSize()} text-gray-600 space-x-3`}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>•</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>•</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-6">
          {data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 pb-2 border-b" style={{ borderColor: accentColor, color: accentColor }}>EDUCATION</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-4">
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p className={`${getFontSize()} text-gray-700`}>{edu.institution}</p>
                  <p className={`${getFontSize()} text-gray-500`}>{edu.graduationDate}</p>
                  {edu.gpa && <p className={`${getFontSize()} font-semibold`}>GPA: {edu.gpa}</p>}
                </div>
              ))}
            </section>
          )}

          {(data.skills.technical.length > 0 || data.skills.languages.length > 0) && (
            <section>
              <h2 className="text-lg font-bold mb-3 pb-2 border-b" style={{ borderColor: accentColor, color: accentColor }}>SKILLS</h2>
              <div className="space-y-3">
                {data.skills.languages.length > 0 && (
                  <div>
                    <h4 className={`${getFontSize()} font-bold text-gray-700 mb-1`}>Languages</h4>
                    <p className={`${getFontSize()} text-gray-600`}>{data.skills.languages.join(', ')}</p>
                  </div>
                )}
                {data.skills.technical.length > 0 && (
                  <div>
                    <h4 className={`${getFontSize()} font-bold text-gray-700 mb-1`}>Technologies</h4>
                    <p className={`${getFontSize()} text-gray-600`}>{data.skills.technical.join(', ')}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {data.achievements.some(a => a.title) && (
            <section>
              <h2 className="text-lg font-bold mb-3 pb-2 border-b" style={{ borderColor: accentColor, color: accentColor }}>AWARDS</h2>
              <ul className="space-y-2">
                {data.achievements.filter(a => a.title).map((ach, i) => (
                  <li key={i} className={`${getFontSize()}`}>
                    <p className="font-bold text-gray-900">{ach.title}</p>
                    {ach.date && <p className="text-gray-500 text-xs">{ach.date}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="col-span-2 space-y-6">
          {data.objective && (
            <section>
              <h2 className="text-lg font-bold mb-3 pb-2 border-b" style={{ borderColor: accentColor, color: accentColor }}>PROFESSIONAL SUMMARY</h2>
              <p className={`${getFontSize()} text-gray-700 leading-relaxed`}>{data.objective}</p>
            </section>
          )}

          {data.internships.some(i => i.title) && (
            <section>
              <h2 className="text-lg font-bold mb-3 pb-2 border-b" style={{ borderColor: accentColor, color: accentColor }}>EXPERIENCE</h2>
              <div className="space-y-5">
                {data.internships.filter(i => i.title).map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-lg">{exp.title}</h3>
                      <span className={`${getFontSize()} text-gray-500`}>{exp.duration}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{exp.company} | {exp.location}</p>
                    <p className={`${getFontSize()} text-gray-600 mt-1`}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.projects.some(p => p.title) && (
            <section>
              <h2 className="text-lg font-bold mb-3 pb-2 border-b" style={{ borderColor: accentColor, color: accentColor }}>PROJECTS</h2>
              <div className="space-y-5">
                {data.projects.filter(p => p.title).map((proj, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-lg">{proj.title}</h3>
                      {proj.link && <a href={proj.link} className={`${getFontSize()} text-blue-600`}>{proj.link}</a>}
                    </div>
                    {proj.technologies && <p className={`${getFontSize()} text-gray-500 font-semibold`}>{proj.technologies}</p>}
                    <p className={`${getFontSize()} text-gray-600 mt-1`}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

// [CONTINUED IN NEXT MESSAGE - File too large]
