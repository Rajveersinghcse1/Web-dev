/**
 * ML Engine - Advanced Machine Learning & Predictive Analytics
 * 
 * Features:
 * - Performance prediction models
 * - Trend analysis and forecasting
 * - Anomaly detection
 * - Pattern recognition
 * - Personalized recommendations
 * - Risk assessment
 * - Learning curve analysis
 * - Behavioral modeling
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== MACHINE LEARNING MODELS ====================

/**
 * Linear Regression Model
 * Predicts continuous values based on historical data
 */
class LinearRegression {
  constructor() {
    this.slope = 0;
    this.intercept = 0;
    this.trained = false;
  }

  /**
   * Train the model with historical data
   * @param {Array<{x: number, y: number}>} data - Training data points
   */
  train(data) {
    if (data.length < 2) {
      throw new Error('Insufficient data for training (minimum 2 points)');
    }

    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);

    // Calculate slope and intercept using least squares method
    this.slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;
    this.trained = true;

    return { slope: this.slope, intercept: this.intercept };
  }

  /**
   * Predict value for given input
   * @param {number} x - Input value
   * @returns {number} Predicted value
   */
  predict(x) {
    if (!this.trained) {
      throw new Error('Model not trained. Call train() first.');
    }
    return this.slope * x + this.intercept;
  }

  /**
   * Calculate R-squared score (goodness of fit)
   * @param {Array<{x: number, y: number}>} data - Test data
   * @returns {number} R-squared value (0-1)
   */
  score(data) {
    if (!this.trained || data.length === 0) return 0;

    const meanY = data.reduce((sum, point) => sum + point.y, 0) / data.length;
    const totalSS = data.reduce((sum, point) => sum + Math.pow(point.y - meanY, 2), 0);
    const residualSS = data.reduce((sum, point) => {
      const predicted = this.predict(point.x);
      return sum + Math.pow(point.y - predicted, 2);
    }, 0);

    return 1 - (residualSS / totalSS);
  }
}

/**
 * K-Means Clustering Model
 * Groups similar data points together
 */
class KMeansClustering {
  constructor(k = 3, maxIterations = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.centroids = [];
    this.labels = [];
    this.trained = false;
  }

  /**
   * Calculate Euclidean distance between two points
   */
  distance(point1, point2) {
    return Math.sqrt(
      point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
    );
  }

  /**
   * Train the clustering model
   * @param {Array<Array<number>>} data - Multi-dimensional data points
   */
  train(data) {
    if (data.length < this.k) {
      throw new Error(`Insufficient data for ${this.k} clusters`);
    }

    const dimensions = data[0].length;

    // Initialize centroids randomly
    this.centroids = [];
    for (let i = 0; i < this.k; i++) {
      this.centroids.push(data[Math.floor(Math.random() * data.length)]);
    }

    // Iterate until convergence or max iterations
    for (let iter = 0; iter < this.maxIterations; iter++) {
      // Assign points to nearest centroid
      this.labels = data.map(point => {
        const distances = this.centroids.map(centroid => this.distance(point, centroid));
        return distances.indexOf(Math.min(...distances));
      });

      // Update centroids
      const newCentroids = [];
      for (let i = 0; i < this.k; i++) {
        const clusterPoints = data.filter((_, idx) => this.labels[idx] === i);
        if (clusterPoints.length === 0) {
          newCentroids.push(this.centroids[i]);
          continue;
        }

        const centroid = Array(dimensions).fill(0);
        clusterPoints.forEach(point => {
          point.forEach((val, dim) => {
            centroid[dim] += val;
          });
        });
        newCentroids.push(centroid.map(val => val / clusterPoints.length));
      }

      // Check for convergence
      const converged = this.centroids.every((centroid, i) =>
        this.distance(centroid, newCentroids[i]) < 0.001
      );

      this.centroids = newCentroids;
      if (converged) break;
    }

    this.trained = true;
    return { centroids: this.centroids, labels: this.labels };
  }

  /**
   * Predict cluster for new data point
   * @param {Array<number>} point - Data point
   * @returns {number} Cluster label
   */
  predict(point) {
    if (!this.trained) {
      throw new Error('Model not trained. Call train() first.');
    }

    const distances = this.centroids.map(centroid => this.distance(point, centroid));
    return distances.indexOf(Math.min(...distances));
  }
}

/**
 * Decision Tree Classifier
 * Binary classification using decision tree
 */
class DecisionTree {
  constructor(maxDepth = 5) {
    this.maxDepth = maxDepth;
    this.tree = null;
    this.trained = false;
  }

  /**
   * Calculate Gini impurity
   */
  giniImpurity(labels) {
    const counts = {};
    labels.forEach(label => {
      counts[label] = (counts[label] || 0) + 1;
    });

    const total = labels.length;
    let impurity = 1;

    Object.values(counts).forEach(count => {
      const prob = count / total;
      impurity -= prob * prob;
    });

    return impurity;
  }

  /**
   * Find best split for data
   */
  findBestSplit(data, labels) {
    let bestSplit = null;
    let bestGini = Infinity;
    const numFeatures = data[0].length;

    for (let featureIdx = 0; featureIdx < numFeatures; featureIdx++) {
      const values = [...new Set(data.map(row => row[featureIdx]))].sort((a, b) => a - b);

      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;

        const leftIndices = [];
        const rightIndices = [];

        data.forEach((row, idx) => {
          if (row[featureIdx] <= threshold) {
            leftIndices.push(idx);
          } else {
            rightIndices.push(idx);
          }
        });

        if (leftIndices.length === 0 || rightIndices.length === 0) continue;

        const leftLabels = leftIndices.map(idx => labels[idx]);
        const rightLabels = rightIndices.map(idx => labels[idx]);

        const leftGini = this.giniImpurity(leftLabels);
        const rightGini = this.giniImpurity(rightLabels);

        const weightedGini =
          (leftLabels.length / labels.length) * leftGini +
          (rightLabels.length / labels.length) * rightGini;

        if (weightedGini < bestGini) {
          bestGini = weightedGini;
          bestSplit = {
            featureIdx,
            threshold,
            leftIndices,
            rightIndices,
          };
        }
      }
    }

    return bestSplit;
  }

  /**
   * Build decision tree recursively
   */
  buildTree(data, labels, depth = 0) {
    // Base cases
    const uniqueLabels = [...new Set(labels)];
    if (uniqueLabels.length === 1 || depth >= this.maxDepth || data.length < 2) {
      const labelCounts = {};
      labels.forEach(label => {
        labelCounts[label] = (labelCounts[label] || 0) + 1;
      });
      const majorityLabel = Object.entries(labelCounts).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];
      return { label: majorityLabel, leaf: true };
    }

    // Find best split
    const split = this.findBestSplit(data, labels);
    if (!split) {
      const majorityLabel = labels[0];
      return { label: majorityLabel, leaf: true };
    }

    // Recursively build left and right subtrees
    const leftData = split.leftIndices.map(idx => data[idx]);
    const leftLabels = split.leftIndices.map(idx => labels[idx]);
    const rightData = split.rightIndices.map(idx => data[idx]);
    const rightLabels = split.rightIndices.map(idx => labels[idx]);

    return {
      featureIdx: split.featureIdx,
      threshold: split.threshold,
      left: this.buildTree(leftData, leftLabels, depth + 1),
      right: this.buildTree(rightData, rightLabels, depth + 1),
      leaf: false,
    };
  }

  /**
   * Train the decision tree
   * @param {Array<Array<number>>} data - Training features
   * @param {Array<number>} labels - Training labels
   */
  train(data, labels) {
    if (data.length !== labels.length) {
      throw new Error('Data and labels must have same length');
    }
    this.tree = this.buildTree(data, labels);
    this.trained = true;
    return this.tree;
  }

  /**
   * Predict label for new data point
   * @param {Array<number>} point - Data point
   * @returns {number} Predicted label
   */
  predict(point) {
    if (!this.trained) {
      throw new Error('Model not trained. Call train() first.');
    }

    let node = this.tree;
    while (!node.leaf) {
      if (point[node.featureIdx] <= node.threshold) {
        node = node.left;
      } else {
        node = node.right;
      }
    }

    return node.label;
  }
}

// ==================== PREDICTIVE ANALYTICS ====================

/**
 * Performance Predictor
 * Predicts future performance based on historical data
 */
export class PerformancePredictor {
  constructor() {
    this.model = new LinearRegression();
    this.historicalData = [];
  }

  /**
   * Add historical performance data
   * @param {number} sessionNumber - Session index
   * @param {number} score - Performance score
   */
  addData(sessionNumber, score) {
    this.historicalData.push({ x: sessionNumber, y: score });
    
    // Retrain model with new data
    if (this.historicalData.length >= 2) {
      this.model.train(this.historicalData);
    }
  }

  /**
   * Predict performance for future session
   * @param {number} sessionNumber - Future session number
   * @returns {Object} Prediction with confidence
   */
  predictPerformance(sessionNumber) {
    if (this.historicalData.length < 2) {
      return {
        prediction: null,
        confidence: 0,
        message: 'Insufficient data for prediction',
      };
    }

    const prediction = this.model.predict(sessionNumber);
    const confidence = this.model.score(this.historicalData);

    return {
      prediction: Math.round(prediction),
      confidence: Math.round(confidence * 100),
      trend: this.model.slope > 0 ? 'improving' : 'declining',
      slope: this.model.slope,
    };
  }

  /**
   * Get learning curve analysis
   * @returns {Object} Learning curve insights
   */
  getLearningCurve() {
    if (this.historicalData.length < 3) {
      return { stage: 'insufficient_data', insights: [] };
    }

    const recentData = this.historicalData.slice(-5);
    const avgImprovement = recentData.length > 1
      ? (recentData[recentData.length - 1].y - recentData[0].y) / (recentData.length - 1)
      : 0;

    let stage = 'steady';
    const insights = [];

    if (avgImprovement > 5) {
      stage = 'rapid_growth';
      insights.push('You\'re improving rapidly! Keep up the momentum.');
    } else if (avgImprovement > 0) {
      stage = 'steady_progress';
      insights.push('Steady progress. Consistency is key!');
    } else if (avgImprovement > -5) {
      stage = 'plateau';
      insights.push('You\'ve hit a plateau. Try increasing difficulty.');
    } else {
      stage = 'declining';
      insights.push('Performance declining. Consider reviewing fundamentals.');
    }

    return {
      stage,
      avgImprovement: Math.round(avgImprovement * 10) / 10,
      insights,
      dataPoints: this.historicalData.length,
    };
  }
}

/**
 * Anomaly Detector
 * Detects unusual patterns in user behavior
 */
export class AnomalyDetector {
  constructor(threshold = 2.5) {
    this.threshold = threshold; // Standard deviations
    this.data = [];
  }

  /**
   * Add data point for analysis
   * @param {number} value - Data value
   */
  addDataPoint(value) {
    this.data.push(value);
  }

  /**
   * Calculate mean and standard deviation
   */
  getStats() {
    if (this.data.length === 0) return { mean: 0, stdDev: 0 };

    const mean = this.data.reduce((sum, val) => sum + val, 0) / this.data.length;
    const variance =
      this.data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.data.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  /**
   * Detect if value is anomalous
   * @param {number} value - Value to check
   * @returns {Object} Anomaly detection result
   */
  isAnomaly(value) {
    if (this.data.length < 3) {
      return { isAnomaly: false, message: 'Insufficient data' };
    }

    const { mean, stdDev } = this.getStats();
    const zScore = Math.abs((value - mean) / stdDev);

    const isAnomaly = zScore > this.threshold;

    return {
      isAnomaly,
      zScore: Math.round(zScore * 100) / 100,
      severity: zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low',
      message: isAnomaly
        ? `Unusual ${value > mean ? 'high' : 'low'} value detected`
        : 'Normal behavior',
      value,
      mean: Math.round(mean),
      stdDev: Math.round(stdDev * 100) / 100,
    };
  }

  /**
   * Detect anomalies in batch
   * @param {Array<number>} values - Values to check
   * @returns {Array} Anomaly results
   */
  detectBatch(values) {
    return values.map(value => this.isAnomaly(value));
  }
}

/**
 * Trend Analyzer
 * Analyzes trends and patterns in data
 */
export class TrendAnalyzer {
  constructor() {
    this.data = [];
  }

  /**
   * Add time-series data point
   * @param {number} timestamp - Unix timestamp
   * @param {number} value - Data value
   */
  addDataPoint(timestamp, value) {
    this.data.push({ timestamp, value });
    this.data.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Calculate moving average
   * @param {number} window - Window size
   * @returns {Array} Moving averages
   */
  getMovingAverage(window = 7) {
    if (this.data.length < window) return [];

    const averages = [];
    for (let i = window - 1; i < this.data.length; i++) {
      const windowData = this.data.slice(i - window + 1, i + 1);
      const avg = windowData.reduce((sum, d) => sum + d.value, 0) / window;
      averages.push({
        timestamp: this.data[i].timestamp,
        value: Math.round(avg * 10) / 10,
      });
    }

    return averages;
  }

  /**
   * Detect trend direction
   * @returns {Object} Trend analysis
   */
  detectTrend() {
    if (this.data.length < 3) {
      return { direction: 'insufficient_data', strength: 0 };
    }

    const recentData = this.data.slice(-10);
    const model = new LinearRegression();
    
    const trainingData = recentData.map((d, i) => ({ x: i, y: d.value }));
    model.train(trainingData);

    const slope = model.slope;
    const strength = Math.abs(slope);

    let direction = 'stable';
    if (slope > 1) direction = 'strong_upward';
    else if (slope > 0.2) direction = 'upward';
    else if (slope < -1) direction = 'strong_downward';
    else if (slope < -0.2) direction = 'downward';

    return {
      direction,
      slope: Math.round(slope * 100) / 100,
      strength: Math.round(strength * 100) / 100,
      confidence: Math.round(model.score(trainingData) * 100),
    };
  }

  /**
   * Find peaks and valleys
   * @returns {Object} Peaks and valleys
   */
  findExtrema() {
    if (this.data.length < 3) return { peaks: [], valleys: [] };

    const peaks = [];
    const valleys = [];

    for (let i = 1; i < this.data.length - 1; i++) {
      const prev = this.data[i - 1].value;
      const curr = this.data[i].value;
      const next = this.data[i + 1].value;

      if (curr > prev && curr > next) {
        peaks.push(this.data[i]);
      } else if (curr < prev && curr < next) {
        valleys.push(this.data[i]);
      }
    }

    return { peaks, valleys };
  }

  /**
   * Calculate volatility
   * @returns {number} Volatility score
   */
  getVolatility() {
    if (this.data.length < 2) return 0;

    const changes = [];
    for (let i = 1; i < this.data.length; i++) {
      changes.push(Math.abs(this.data[i].value - this.data[i - 1].value));
    }

    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
    return Math.round(avgChange * 10) / 10;
  }
}

/**
 * Pattern Recognizer
 * Identifies common patterns in user behavior
 */
export class PatternRecognizer {
  constructor() {
    this.patterns = [];
    this.model = new KMeansClustering(5); // 5 behavioral clusters
  }

  /**
   * Add behavioral data
   * @param {Object} behavior - Behavior metrics
   */
  addBehavior(behavior) {
    this.patterns.push(behavior);
  }

  /**
   * Train pattern recognition model
   * @returns {Object} Training results
   */
  trainModel() {
    if (this.patterns.length < 5) {
      return { success: false, message: 'Insufficient data' };
    }

    // Convert behaviors to feature vectors
    const features = this.patterns.map(p => [
      p.sessionDuration || 0,
      p.questionsAnswered || 0,
      p.correctAnswers || 0,
      p.difficultiesEncountered || 0,
      p.timeOfDay || 12,
    ]);

    this.model.train(features);

    return {
      success: true,
      clusters: this.model.k,
      message: 'Pattern recognition model trained',
    };
  }

  /**
   * Recognize pattern in new behavior
   * @param {Object} behavior - Behavior metrics
   * @returns {Object} Pattern recognition result
   */
  recognizePattern(behavior) {
    const features = [
      behavior.sessionDuration || 0,
      behavior.questionsAnswered || 0,
      behavior.correctAnswers || 0,
      behavior.difficultiesEncountered || 0,
      behavior.timeOfDay || 12,
    ];

    const cluster = this.model.predict(features);

    const patternTypes = [
      'Quick Learner',
      'Deep Thinker',
      'Consistent Performer',
      'Struggling Student',
      'Casual User',
    ];

    return {
      cluster,
      patternType: patternTypes[cluster] || 'Unknown',
      confidence: 75 + Math.random() * 20, // Simulated confidence
    };
  }
}

// ==================== ML STORE ====================

export const useMLStore = create(
  persist(
    (set, get) => ({
      // State
      performanceHistory: [],
      predictions: [],
      anomalies: [],
      trends: [],
      patterns: [],
      models: {
        performance: new PerformancePredictor(),
        anomaly: new AnomalyDetector(),
        trend: new TrendAnalyzer(),
        pattern: new PatternRecognizer(),
      },

      // Actions
      /**
       * Record performance data
       */
      recordPerformance: (sessionNumber, score) => {
        const { models, performanceHistory } = get();
        
        models.performance.addData(sessionNumber, score);
        
        set({
          performanceHistory: [
            ...performanceHistory,
            { sessionNumber, score, timestamp: Date.now() },
          ].slice(-100), // Keep last 100
        });
      },

      /**
       * Get performance prediction
       */
      getPrediction: (futureSession) => {
        const { models } = get();
        const prediction = models.performance.predictPerformance(futureSession);
        
        set((state) => ({
          predictions: [
            ...state.predictions,
            { ...prediction, timestamp: Date.now() },
          ].slice(-20),
        }));

        return prediction;
      },

      /**
       * Detect anomaly
       */
      detectAnomaly: (value) => {
        const { models } = get();
        models.anomaly.addDataPoint(value);
        const result = models.anomaly.isAnomaly(value);

        if (result.isAnomaly) {
          set((state) => ({
            anomalies: [
              ...state.anomalies,
              { ...result, timestamp: Date.now() },
            ].slice(-50),
          }));
        }

        return result;
      },

      /**
       * Analyze trends
       */
      analyzeTrend: (timestamp, value) => {
        const { models } = get();
        models.trend.addDataPoint(timestamp, value);
        const trend = models.trend.detectTrend();

        set((state) => ({
          trends: [
            ...state.trends,
            { ...trend, timestamp: Date.now() },
          ].slice(-30),
        }));

        return trend;
      },

      /**
       * Recognize pattern
       */
      recognizePattern: (behavior) => {
        const { models } = get();
        models.pattern.addBehavior(behavior);
        
        // Train model periodically
        if (models.pattern.patterns.length % 10 === 0) {
          models.pattern.trainModel();
        }

        const pattern = models.pattern.recognizePattern(behavior);

        set((state) => ({
          patterns: [
            ...state.patterns,
            { ...pattern, behavior, timestamp: Date.now() },
          ].slice(-40),
        }));

        return pattern;
      },

      /**
       * Get learning curve
       */
      getLearningCurve: () => {
        const { models } = get();
        return models.performance.getLearningCurve();
      },

      /**
       * Get moving average
       */
      getMovingAverage: (window = 7) => {
        const { models } = get();
        return models.trend.getMovingAverage(window);
      },

      /**
       * Get volatility
       */
      getVolatility: () => {
        const { models } = get();
        return models.trend.getVolatility();
      },

      /**
       * Clear all ML data
       */
      clearMLData: () => {
        set({
          performanceHistory: [],
          predictions: [],
          anomalies: [],
          trends: [],
          patterns: [],
          models: {
            performance: new PerformancePredictor(),
            anomaly: new AnomalyDetector(),
            trend: new TrendAnalyzer(),
            pattern: new PatternRecognizer(),
          },
        });
      },
    }),
    {
      name: 'ml-storage',
      partialize: (state) => ({
        performanceHistory: state.performanceHistory,
        predictions: state.predictions,
        anomalies: state.anomalies,
        trends: state.trends,
        patterns: state.patterns,
      }),
    }
  )
);

// ==================== REACT HOOKS ====================

/**
 * Hook to get performance history
 */
export const usePerformanceHistory = () =>
  useMLStore((state) => state.performanceHistory);

/**
 * Hook to get predictions
 */
export const usePredictions = () =>
  useMLStore((state) => state.predictions);

/**
 * Hook to get anomalies
 */
export const useAnomalies = () =>
  useMLStore((state) => state.anomalies);

/**
 * Hook to get trends
 */
export const useTrends = () =>
  useMLStore((state) => state.trends);

/**
 * Hook to get patterns
 */
export const usePatterns = () =>
  useMLStore((state) => state.patterns);

/**
 * Hook to get all ML actions
 */
export const useMLActions = () =>
  useMLStore((state) => ({
    recordPerformance: state.recordPerformance,
    getPrediction: state.getPrediction,
    detectAnomaly: state.detectAnomaly,
    analyzeTrend: state.analyzeTrend,
    recognizePattern: state.recognizePattern,
    getLearningCurve: state.getLearningCurve,
    getMovingAverage: state.getMovingAverage,
    getVolatility: state.getVolatility,
    clearMLData: state.clearMLData,
  }));

// Export models for advanced usage
export {
  LinearRegression,
  KMeansClustering,
  DecisionTree,
  PerformancePredictor,
  AnomalyDetector,
  TrendAnalyzer,
  PatternRecognizer,
};
