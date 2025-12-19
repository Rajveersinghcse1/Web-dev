import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useGame } from '../../context/GameContext';
import { 
  Code, 
  Brain, 
  Smartphone, 
  Shield, 
  Database, 
  Zap, 
  Target, 
  Cloud,
  Lock,
  CheckCircle,
  Star,
  Plus,
  ArrowRight,
  Trophy,
  BookOpen,
  Lightbulb,
  Cpu,
  Server,
  Eye,
  Settings
} from 'lucide-react';

/**
 * Advanced Skill Tree System for Gamified Learning
 * Features:
 * - 8 specialized skill trees (Frontend, Backend, AI, Mobile, DevOps, Security, Algorithms, Databases)
 * - Branching paths with prerequisites
 * - Unlockable abilities and bonuses
 * - Visual skill progression
 * - Skill combinations and synergies
 * - Mastery levels and prestige systems
 */

// Comprehensive Skill Tree Database
const SKILL_TREES = {
  frontend: {
    id: 'frontend',
    name: 'Frontend Mastery',
    icon: <Code className="w-6 h-6" />,
    color: 'blue',
    description: 'Master the art of user interfaces and user experience',
    maxLevel: 50,
    branches: {
      foundations: {
        name: 'Web Foundations',
        skills: [
          {
            id: 'html_basics',
            name: 'HTML Fundamentals',
            level: 1,
            maxLevel: 5,
            prerequisites: [],
            cost: 1,
            description: 'Master semantic HTML and document structure',
            benefits: ['5% faster HTML coding', 'Semantic markup bonus'],
            unlocks: ['css_basics', 'accessibility_basics']
          },
          {
            id: 'css_basics',
            name: 'CSS Styling',
            level: 1,
            maxLevel: 5,
            prerequisites: ['html_basics'],
            cost: 2,
            description: 'Learn styling, layouts, and responsive design',
            benefits: ['10% design speed boost', 'Responsive layout mastery'],
            unlocks: ['css_animations', 'sass_preprocessor']
          },
          {
            id: 'javascript_core',
            name: 'JavaScript Core',
            level: 1,
            maxLevel: 10,
            prerequisites: ['html_basics'],
            cost: 3,
            description: 'Master JavaScript fundamentals and ES6+',
            benefits: ['15% coding efficiency', 'Modern JS features'],
            unlocks: ['dom_manipulation', 'async_programming']
          }
        ]
      },
      frameworks: {
        name: 'Modern Frameworks',
        skills: [
          {
            id: 'react_mastery',
            name: 'React Expertise',
            level: 1,
            maxLevel: 10,
            prerequisites: ['javascript_core', 'dom_manipulation'],
            cost: 5,
            description: 'Build complex applications with React',
            benefits: ['25% React productivity', 'Component architecture mastery'],
            unlocks: ['nextjs_development', 'react_native']
          },
          {
            id: 'vue_mastery',
            name: 'Vue.js Expertise',
            level: 1,
            maxLevel: 8,
            prerequisites: ['javascript_core'],
            cost: 4,
            description: 'Create dynamic UIs with Vue.js',
            benefits: ['20% Vue productivity', 'Reactive programming'],
            unlocks: ['nuxt_development', 'vue_composition']
          },
          {
            id: 'angular_mastery',
            name: 'Angular Expertise',
            level: 1,
            maxLevel: 8,
            prerequisites: ['javascript_core', 'typescript_basics'],
            cost: 6,
            description: 'Enterprise applications with Angular',
            benefits: ['30% Angular efficiency', 'Enterprise architecture'],
            unlocks: ['angular_universal', 'ngrx_state']
          }
        ]
      },
      advanced: {
        name: 'Advanced Techniques',
        skills: [
          {
            id: 'performance_optimization',
            name: 'Performance Guru',
            level: 1,
            maxLevel: 5,
            prerequisites: ['react_mastery', 'webpack_mastery'],
            cost: 8,
            description: 'Optimize applications for maximum performance',
            benefits: ['50% faster load times', 'Performance monitoring'],
            unlocks: ['micro_frontends', 'web_vitals']
          },
          {
            id: 'accessibility_expert',
            name: 'Accessibility Champion',
            level: 1,
            maxLevel: 5,
            prerequisites: ['html_basics', 'css_basics'],
            cost: 4,
            description: 'Create inclusive web experiences',
            benefits: ['WCAG compliance', 'Screen reader optimization'],
            unlocks: ['aria_mastery', 'inclusive_design']
          }
        ]
      }
    }
  },

  backend: {
    id: 'backend',
    name: 'Backend Engineering',
    icon: <Server className="w-6 h-6" />,
    color: 'green',
    description: 'Build scalable server-side applications and APIs',
    maxLevel: 50,
    branches: {
      foundations: {
        name: 'Server Foundations',
        skills: [
          {
            id: 'nodejs_basics',
            name: 'Node.js Fundamentals',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 2,
            description: 'Master server-side JavaScript development',
            benefits: ['20% Node.js efficiency', 'Event loop mastery'],
            unlocks: ['express_framework', 'npm_mastery']
          },
          {
            id: 'python_backend',
            name: 'Python Backend',
            level: 1,
            maxLevel: 10,
            prerequisites: [],
            cost: 3,
            description: 'Build robust backends with Python',
            benefits: ['25% Python productivity', 'Clean code principles'],
            unlocks: ['django_framework', 'flask_mastery', 'fastapi_development']
          },
          {
            id: 'api_design',
            name: 'API Architecture',
            level: 1,
            maxLevel: 8,
            prerequisites: ['nodejs_basics'],
            cost: 4,
            description: 'Design RESTful and GraphQL APIs',
            benefits: ['API best practices', '30% faster API development'],
            unlocks: ['graphql_mastery', 'api_security']
          }
        ]
      },
      databases: {
        name: 'Data Management',
        skills: [
          {
            id: 'sql_mastery',
            name: 'SQL Expert',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 3,
            description: 'Master relational database design and queries',
            benefits: ['Complex query optimization', 'Database design'],
            unlocks: ['postgresql_advanced', 'mysql_optimization']
          },
          {
            id: 'nosql_databases',
            name: 'NoSQL Specialist',
            level: 1,
            maxLevel: 6,
            prerequisites: [],
            cost: 4,
            description: 'Work with MongoDB, Redis, and document stores',
            benefits: ['Document modeling', 'Caching strategies'],
            unlocks: ['mongodb_aggregation', 'redis_mastery']
          }
        ]
      },
      scalability: {
        name: 'Scale & Performance',
        skills: [
          {
            id: 'microservices',
            name: 'Microservices Architect',
            level: 1,
            maxLevel: 8,
            prerequisites: ['api_design', 'docker_containers'],
            cost: 10,
            description: 'Design distributed microservice architectures',
            benefits: ['Service decomposition', 'Distributed systems'],
            unlocks: ['service_mesh', 'event_driven_architecture']
          },
          {
            id: 'caching_strategies',
            name: 'Caching Master',
            level: 1,
            maxLevel: 5,
            prerequisites: ['api_design'],
            cost: 6,
            description: 'Implement advanced caching techniques',
            benefits: ['Performance optimization', 'Cache invalidation'],
            unlocks: ['cdn_optimization', 'distributed_caching']
          }
        ]
      }
    }
  },

  ai: {
    id: 'ai',
    name: 'AI & Machine Learning',
    icon: <Brain className="w-6 h-6" />,
    color: 'purple',
    description: 'Harness the power of artificial intelligence',
    maxLevel: 50,
    branches: {
      foundations: {
        name: 'AI Foundations',
        skills: [
          {
            id: 'python_ai',
            name: 'Python for AI',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 3,
            description: 'Master Python libraries for AI development',
            benefits: ['NumPy/Pandas mastery', 'Data manipulation'],
            unlocks: ['machine_learning', 'data_visualization']
          },
          {
            id: 'statistics_basics',
            name: 'Statistics & Probability',
            level: 1,
            maxLevel: 6,
            prerequisites: [],
            cost: 4,
            description: 'Mathematical foundations for AI',
            benefits: ['Statistical analysis', 'Probability theory'],
            unlocks: ['hypothesis_testing', 'bayesian_inference']
          }
        ]
      },
      machine_learning: {
        name: 'Machine Learning',
        skills: [
          {
            id: 'supervised_learning',
            name: 'Supervised Learning',
            level: 1,
            maxLevel: 8,
            prerequisites: ['python_ai', 'statistics_basics'],
            cost: 6,
            description: 'Master classification and regression algorithms',
            benefits: ['Model training', 'Feature engineering'],
            unlocks: ['ensemble_methods', 'model_optimization']
          },
          {
            id: 'deep_learning',
            name: 'Neural Networks',
            level: 1,
            maxLevel: 10,
            prerequisites: ['supervised_learning'],
            cost: 8,
            description: 'Build and train neural networks',
            benefits: ['TensorFlow/PyTorch', 'Network architectures'],
            unlocks: ['computer_vision', 'nlp_processing']
          }
        ]
      },
      specialized: {
        name: 'AI Specializations',
        skills: [
          {
            id: 'computer_vision',
            name: 'Computer Vision',
            level: 1,
            maxLevel: 8,
            prerequisites: ['deep_learning'],
            cost: 10,
            description: 'Image and video analysis with AI',
            benefits: ['Image processing', 'Object detection'],
            unlocks: ['facial_recognition', 'medical_imaging']
          },
          {
            id: 'nlp_processing',
            name: 'Natural Language Processing',
            level: 1,
            maxLevel: 8,
            prerequisites: ['deep_learning'],
            cost: 10,
            description: 'Understand and generate human language',
            benefits: ['Text analysis', 'Language models'],
            unlocks: ['chatbot_development', 'sentiment_analysis']
          }
        ]
      }
    }
  },

  mobile: {
    id: 'mobile',
    name: 'Mobile Development',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'pink',
    description: 'Create amazing mobile applications',
    maxLevel: 40,
    branches: {
      crossplatform: {
        name: 'Cross-Platform',
        skills: [
          {
            id: 'react_native',
            name: 'React Native',
            level: 1,
            maxLevel: 8,
            prerequisites: ['react_mastery'],
            cost: 6,
            description: 'Build native apps with React',
            benefits: ['Cross-platform development', 'Native performance'],
            unlocks: ['expo_development', 'native_modules']
          },
          {
            id: 'flutter_development',
            name: 'Flutter Mastery',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 6,
            description: 'Create beautiful UIs with Flutter',
            benefits: ['Dart programming', 'Material Design'],
            unlocks: ['flutter_web', 'flutter_desktop']
          }
        ]
      },
      native: {
        name: 'Native Development',
        skills: [
          {
            id: 'ios_development',
            name: 'iOS Development',
            level: 1,
            maxLevel: 10,
            prerequisites: [],
            cost: 8,
            description: 'Build native iOS applications',
            benefits: ['Swift programming', 'UIKit mastery'],
            unlocks: ['swiftui_development', 'ios_animations']
          },
          {
            id: 'android_development',
            name: 'Android Development',
            level: 1,
            maxLevel: 10,
            prerequisites: [],
            cost: 8,
            description: 'Create native Android apps',
            benefits: ['Kotlin programming', 'Android SDK'],
            unlocks: ['jetpack_compose', 'android_architecture']
          }
        ]
      }
    }
  },

  devops: {
    id: 'devops',
    name: 'DevOps & Cloud',
    icon: <Cloud className="w-6 h-6" />,
    color: 'orange',
    description: 'Automate, deploy, and scale applications',
    maxLevel: 45,
    branches: {
      containers: {
        name: 'Containerization',
        skills: [
          {
            id: 'docker_mastery',
            name: 'Docker Expert',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 4,
            description: 'Containerize applications with Docker',
            benefits: ['Container optimization', 'Multi-stage builds'],
            unlocks: ['kubernetes_orchestration', 'docker_compose']
          },
          {
            id: 'kubernetes_orchestration',
            name: 'Kubernetes Orchestrator',
            level: 1,
            maxLevel: 10,
            prerequisites: ['docker_mastery'],
            cost: 8,
            description: 'Orchestrate containers at scale',
            benefits: ['Cluster management', 'Service discovery'],
            unlocks: ['helm_charts', 'istio_service_mesh']
          }
        ]
      },
      cloud: {
        name: 'Cloud Platforms',
        skills: [
          {
            id: 'aws_mastery',
            name: 'AWS Architect',
            level: 1,
            maxLevel: 10,
            prerequisites: [],
            cost: 6,
            description: 'Build scalable solutions on AWS',
            benefits: ['EC2/S3 mastery', 'Serverless computing'],
            unlocks: ['aws_lambda', 'aws_security']
          },
          {
            id: 'ci_cd_pipelines',
            name: 'CI/CD Master',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 5,
            description: 'Automate testing and deployment',
            benefits: ['Pipeline optimization', 'Automated testing'],
            unlocks: ['jenkins_mastery', 'github_actions']
          }
        ]
      }
    }
  },

  security: {
    id: 'security',
    name: 'Cybersecurity',
    icon: <Shield className="w-6 h-6" />,
    color: 'red',
    description: 'Protect applications and data from threats',
    maxLevel: 40,
    branches: {
      foundations: {
        name: 'Security Foundations',
        skills: [
          {
            id: 'web_security',
            name: 'Web Security',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 4,
            description: 'Secure web applications from common threats',
            benefits: ['OWASP Top 10', 'XSS/CSRF protection'],
            unlocks: ['penetration_testing', 'security_auditing']
          },
          {
            id: 'cryptography',
            name: 'Cryptography',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 6,
            description: 'Implement encryption and secure communication',
            benefits: ['Encryption algorithms', 'Key management'],
            unlocks: ['blockchain_security', 'secure_protocols']
          }
        ]
      },
      advanced: {
        name: 'Advanced Security',
        skills: [
          {
            id: 'ethical_hacking',
            name: 'Ethical Hacking',
            level: 1,
            maxLevel: 10,
            prerequisites: ['web_security', 'network_security'],
            cost: 10,
            description: 'Find and fix security vulnerabilities',
            benefits: ['Penetration testing', 'Vulnerability assessment'],
            unlocks: ['red_team_operations', 'forensics']
          }
        ]
      }
    }
  },

  algorithms: {
    id: 'algorithms',
    name: 'Algorithms & Data Structures',
    icon: <Target className="w-6 h-6" />,
    color: 'indigo',
    description: 'Master computational thinking and problem solving',
    maxLevel: 50,
    branches: {
      foundations: {
        name: 'Core Concepts',
        skills: [
          {
            id: 'basic_algorithms',
            name: 'Algorithm Fundamentals',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 3,
            description: 'Master sorting, searching, and basic algorithms',
            benefits: ['O(n) analysis', 'Problem decomposition'],
            unlocks: ['advanced_sorting', 'graph_algorithms']
          },
          {
            id: 'data_structures',
            name: 'Data Structure Mastery',
            level: 1,
            maxLevel: 8,
            prerequisites: [],
            cost: 4,
            description: 'Arrays, trees, graphs, and hash tables',
            benefits: ['Optimal data organization', 'Memory efficiency'],
            unlocks: ['balanced_trees', 'advanced_hashing']
          }
        ]
      },
      advanced: {
        name: 'Advanced Algorithms',
        skills: [
          {
            id: 'dynamic_programming',
            name: 'Dynamic Programming',
            level: 1,
            maxLevel: 8,
            prerequisites: ['basic_algorithms'],
            cost: 8,
            description: 'Solve complex optimization problems',
            benefits: ['Memoization techniques', 'Optimal substructure'],
            unlocks: ['advanced_dp', 'game_theory']
          },
          {
            id: 'graph_algorithms',
            name: 'Graph Theory',
            level: 1,
            maxLevel: 8,
            prerequisites: ['data_structures'],
            cost: 6,
            description: 'Master graph traversal and shortest paths',
            benefits: ['BFS/DFS mastery', 'Network analysis'],
            unlocks: ['minimum_spanning_tree', 'network_flow']
          }
        ]
      }
    }
  },

  databases: {
    id: 'databases',
    name: 'Database Engineering',
    icon: <Database className="w-6 h-6" />,
    color: 'teal',
    description: 'Design and optimize data storage systems',
    maxLevel: 45,
    branches: {
      relational: {
        name: 'Relational Databases',
        skills: [
          {
            id: 'sql_advanced',
            name: 'Advanced SQL',
            level: 1,
            maxLevel: 10,
            prerequisites: [],
            cost: 4,
            description: 'Master complex queries and optimization',
            benefits: ['Query optimization', 'Index strategies'],
            unlocks: ['stored_procedures', 'database_tuning']
          },
          {
            id: 'database_design',
            name: 'Database Architecture',
            level: 1,
            maxLevel: 8,
            prerequisites: ['sql_advanced'],
            cost: 6,
            description: 'Design scalable database schemas',
            benefits: ['Normalization', 'Performance tuning'],
            unlocks: ['distributed_databases', 'replication']
          }
        ]
      },
      modern: {
        name: 'Modern Data Systems',
        skills: [
          {
            id: 'big_data',
            name: 'Big Data Processing',
            level: 1,
            maxLevel: 8,
            prerequisites: ['database_design'],
            cost: 8,
            description: 'Handle massive datasets with modern tools',
            benefits: ['Spark/Hadoop', 'Data pipelines'],
            unlocks: ['stream_processing', 'data_lakes']
          }
        ]
      }
    }
  }
};

const SkillTreeSystem = () => {
  const { gameState, spendSkillPoints, awardXP, showNotification } = useGame();
  const [selectedTree, setSelectedTree] = useState('frontend');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const currentTree = SKILL_TREES[selectedTree];
  const playerSkills = gameState.skills || {};
  const availablePoints = gameState.skillPoints || 0;

  // Get skill level for a specific skill
  const getSkillLevel = (skillId) => {
    return playerSkills[skillId]?.level || 0;
  };

  // Check if skill can be upgraded
  const canUpgradeSkill = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    const hasPoints = availablePoints >= skill.cost;
    const meetsPrereqs = skill.prerequisites.every(prereq => getSkillLevel(prereq) > 0);
    const notMaxLevel = currentLevel < skill.maxLevel;
    
    return hasPoints && meetsPrereqs && notMaxLevel;
  };

  // Upgrade a skill
  const upgradeSkill = (skill) => {
    if (!canUpgradeSkill(skill)) return;
    
    const success = spendSkillPoints(skill.cost, skill.id);
    if (success) {
      showNotification({
        type: 'success',
        title: 'Skill Upgraded! 🎯',
        message: `${skill.name} upgraded to level ${getSkillLevel(skill.id) + 1}`,
        icon: '⬆️'
      });
    }
  };

  // Get tree progress
  const getTreeProgress = (treeId) => {
    const tree = SKILL_TREES[treeId];
    let totalSkills = 0;
    let unlockedSkills = 0;
    
    Object.values(tree.branches).forEach(branch => {
      branch.skills.forEach(skill => {
        totalSkills++;
        if (getSkillLevel(skill.id) > 0) {
          unlockedSkills++;
        }
      });
    });
    
    return {
      total: totalSkills,
      unlocked: unlockedSkills,
      percentage: Math.round((unlockedSkills / totalSkills) * 100)
    };
  };

  // Get color classes for skill tree
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      pink: 'border-pink-200 bg-pink-50 text-pink-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700',
      red: 'border-red-200 bg-red-50 text-red-700',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      teal: 'border-teal-200 bg-teal-50 text-teal-700'
    };
    return colorMap[color] || 'border-gray-200 bg-gray-50 text-gray-700';
  };

  // Render skill node
  const renderSkillNode = (skill, branchName) => {
    const currentLevel = getSkillLevel(skill.id);
    const canUpgrade = canUpgradeSkill(skill);
    const isLocked = skill.prerequisites.some(prereq => getSkillLevel(prereq) === 0);
    const isMaxLevel = currentLevel >= skill.maxLevel;

    return (
      <div
        key={skill.id}
        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
          currentLevel > 0
            ? `${getColorClasses(currentTree.color)} shadow-md`
            : isLocked
            ? 'border-gray-300 bg-gray-100 text-gray-400'
            : 'border-gray-200 bg-white hover:border-gray-300'
        } ${canUpgrade ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
        onClick={() => setSelectedSkill(skill)}
        onMouseEnter={() => setHoveredSkill(skill)}
        onMouseLeave={() => setHoveredSkill(null)}
      >
        {/* Lock icon for locked skills */}
        {isLocked && (
          <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-400" />
        )}
        
        {/* Max level indicator */}
        {isMaxLevel && (
          <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-500" />
        )}

        <div className="text-center">
          <h4 className="font-semibold text-sm mb-1">{skill.name}</h4>
          <div className="text-xs text-gray-600 mb-2">
            Level {currentLevel}/{skill.maxLevel}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentLevel > 0 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              style={{ width: `${(currentLevel / skill.maxLevel) * 100}%` }}
            ></div>
          </div>
          
          {/* Cost indicator */}
          {!isMaxLevel && (
            <div className={`text-xs ${canUpgrade ? 'text-green-600' : 'text-gray-500'}`}>
              Cost: {skill.cost} SP
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="skill-tree-system max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🌟 Skill Trees</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Unlock abilities and master your chosen paths</p>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">{availablePoints}</div>
              <div className="text-sm text-gray-600">Skill Points</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tree Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Trees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(SKILL_TREES).map((tree) => {
                const progress = getTreeProgress(tree.id);
                return (
                  <button
                    key={tree.id}
                    onClick={() => setSelectedTree(tree.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedTree === tree.id
                        ? getColorClasses(tree.color)
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {tree.icon}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{tree.name}</div>
                        <div className="text-xs text-gray-600">
                          {progress.unlocked}/{progress.total} unlocked
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Skill Tree Display */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentTree.icon}
                  <div>
                    <CardTitle>{currentTree.name}</CardTitle>
                    <p className="text-sm text-gray-600">{currentTree.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {getTreeProgress(selectedTree).percentage}%
                  </div>
                  <div className="text-xs text-gray-600">Mastery</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Skill Branches */}
              <div className="space-y-8">
                {Object.entries(currentTree.branches).map(([branchKey, branch]) => (
                  <div key={branchKey}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      {branch.name}
                    </h3>
                    
                    {/* Skills Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {branch.skills.map(skill => renderSkillNode(skill, branchKey))}
                    </div>
                    
                    {/* Connection Lines (Visual representation) */}
                    <div className="mt-4 text-center text-xs text-gray-400">
                      Skills in this branch build upon each other
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedSkill.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSkill(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">{selectedSkill.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Current Level</div>
                    <div>{getSkillLevel(selectedSkill.id)}/{selectedSkill.maxLevel}</div>
                  </div>
                  <div>
                    <div className="font-medium">Upgrade Cost</div>
                    <div>{selectedSkill.cost} SP</div>
                  </div>
                </div>

                {/* Prerequisites */}
                {selectedSkill.prerequisites.length > 0 && (
                  <div>
                    <div className="font-medium mb-2">Prerequisites</div>
                    <div className="space-y-1">
                      {selectedSkill.prerequisites.map(prereq => (
                        <div key={prereq} className="text-sm text-gray-600">
                          • {prereq.replace('_', ' ')} (Level {getSkillLevel(prereq)})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                <div>
                  <div className="font-medium mb-2">Benefits</div>
                  <div className="space-y-1">
                    {selectedSkill.benefits.map((benefit, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unlocks */}
                {selectedSkill.unlocks && (
                  <div>
                    <div className="font-medium mb-2">Unlocks</div>
                    <div className="space-y-1">
                      {selectedSkill.unlocks.map((unlock, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {unlock.replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upgrade Button */}
                {getSkillLevel(selectedSkill.id) < selectedSkill.maxLevel && (
                  <Button
                    onClick={() => upgradeSkill(selectedSkill)}
                    disabled={!canUpgradeSkill(selectedSkill)}
                    className="w-full"
                  >
                    {canUpgradeSkill(selectedSkill) ? (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Upgrade Skill
                      </>
                    ) : (
                      'Cannot Upgrade'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredSkill && !selectedSkill && (
        <div className="fixed z-40 bg-black text-white p-2 rounded text-xs max-w-xs pointer-events-none"
             style={{
               left: '50%',
               top: '50%',
               transform: 'translate(-50%, -50%)'
             }}>
          <div className="font-medium">{hoveredSkill.name}</div>
          <div>{hoveredSkill.description}</div>
          <div className="mt-1 text-yellow-300">Cost: {hoveredSkill.cost} SP</div>
        </div>
      )}
    </div>
  );
};

export default SkillTreeSystem;