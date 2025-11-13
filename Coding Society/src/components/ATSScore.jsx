import React, { useState, useEffect } from 'react';
import { Progress } from './ui/progress';

const ATSScore = ({ studentInfo }) => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Basic ATS scoring logic
    let newScore = 0;
    if (studentInfo.name) newScore += 10;
    if (studentInfo.email) newScore += 10;
    if (studentInfo.phone) newScore += 10;
    if (studentInfo.education) newScore += 20;
    if (studentInfo.experience) newScore += 30;
    if (studentInfo.skills) newScore += 20;
    setScore(newScore);
  }, [studentInfo]);

  return (
    <div>
      <h3 className="text-lg font-bold">ATS Score</h3>
      <Progress value={score} className="w-full" />
      <p className="text-sm text-center mt-2">{score}%</p>
    </div>
  );
};

export default ATSScore;
