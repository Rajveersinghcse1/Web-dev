import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FlashcardWidget = () => {
  // Mock stats
  const dueCount = 12;
  const nextReviewTime = 'Now';

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-indigo-100 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          Spaced Repetition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{dueCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cards due for review</p>
          </div>
          <Link href="/review">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Start Review <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardWidget;
