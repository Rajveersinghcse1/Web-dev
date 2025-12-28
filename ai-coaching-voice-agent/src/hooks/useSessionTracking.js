"use client";
import { useCallback } from 'react';
import { useProgressStore, useSessionStore, useAnalyticsStore } from '@/store';
import { checkAchievements, triggerAchievement } from '@/lib/achievements';

/**
 * Hook to track session completion and award XP/achievements
 * Call trackSessionComplete when a coaching session finishes
 */
export function useSessionTracking() {
  const addXP = useProgressStore(state => state.addXP);
  const updateStreak = useProgressStore(state => state.updateStreak);
  const unlockAchievement = useProgressStore(state => state.unlockAchievement);
  const addSession = useAnalyticsStore(state => state.addSession);
  const startSession = useSessionStore(state => state.startSession);
  const endSession = useSessionStore(state => state.endSession);

  /**
   * Track session start
   * @param {Object} session - Session details
   * @param {string} session.mode - Coaching mode (lecture, mock_interview, etc.)
   * @param {string} session.topic - Session topic
   */
  const trackSessionStart = useCallback((session) => {
    startSession({
      mode: session.mode,
      topic: session.topic,
      startTime: Date.now(),
    });
  }, [startSession]);

  /**
   * Track session completion and award XP/achievements
   * @param {Object} session - Session details
   * @param {string} session.mode - Coaching mode
   * @param {string} session.topic - Session topic
   * @param {number} session.durationMinutes - Session duration in minutes
   * @param {number} session.messageCount - Number of messages exchanged
   * @param {number} [session.rating] - Optional user rating (1-5)
   */
  const trackSessionComplete = useCallback((session) => {
    // End active session
    endSession();

    // Calculate XP based on duration and engagement
    const baseXP = 50; // Base XP for completing a session
    const timeBonus = Math.min(session.durationMinutes * 2, 100); // 2 XP per minute, max 100
    const messageBonus = Math.min(session.messageCount * 5, 50); // 5 XP per message, max 50
    const totalXP = baseXP + timeBonus + messageBonus;

    // Award XP
    addXP(totalXP);

    // Update streak
    updateStreak();

    // Record session in analytics
    addSession({
      mode: session.mode,
      topic: session.topic,
      duration: session.durationMinutes,
      xpEarned: totalXP,
      timestamp: Date.now(),
      rating: session.rating,
      messageCount: session.messageCount,
    });

    // Check for newly unlocked achievements
    const newAchievements = checkAchievements();
    
    // Trigger achievement notifications
    if (newAchievements.length > 0) {
      // Unlock achievements in store
      newAchievements.forEach(achievement => {
        unlockAchievement(achievement.id);
      });

      // Trigger visual celebrations (with slight delays for multiple achievements)
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          triggerAchievement(achievement);
        }, index * 2000); // 2 second delay between each
      });
    }

    return {
      xpEarned: totalXP,
      achievementsUnlocked: newAchievements,
    };
  }, [addXP, updateStreak, unlockAchievement, addSession, endSession]);

  /**
   * Award bonus XP for specific actions
   * @param {number} amount - XP amount to award
   * @param {string} reason - Reason for bonus XP
   */
  const awardBonusXP = useCallback((amount, reason = 'bonus') => {
    addXP(amount);
    
    // Check for level-up achievements
    const newAchievements = checkAchievements();
    if (newAchievements.length > 0) {
      newAchievements.forEach(achievement => {
        unlockAchievement(achievement.id);
        triggerAchievement(achievement);
      });
    }

    return {
      xpAwarded: amount,
      reason,
    };
  }, [addXP, unlockAchievement]);

  return {
    trackSessionStart,
    trackSessionComplete,
    awardBonusXP,
  };
}
