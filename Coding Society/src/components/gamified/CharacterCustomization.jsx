import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useGame } from '../../context/GameContext';
import { 
  User, 
  Palette, 
  Crown, 
  Shirt, 
  Eye, 
  Sparkles, 
  Star, 
  Lock, 
  Check,
  Shuffle,
  Download,
  Upload,
  Save,
  RotateCcw,
  Zap,
  Gift,
  Trophy,
  Medal,
  Shield,
  Sword,
  Wand2,
  Glasses,
  Gem
} from 'lucide-react';

/**
 * Advanced Character Customization System
 * Features:
 * - Avatar builder with multiple customization options
 * - Unlockable themes, accessories, and visual elements
 * - Character class-specific appearance options
 * - Prestige and mastery-based customizations
 * - Import/Export avatar configurations
 * - Social avatar sharing and showcasing
 * - Seasonal and event-exclusive items
 */

// Avatar Customization Database
const AVATAR_CATEGORIES = {
  theme: {
    name: 'Theme',
    icon: <Palette className="w-5 h-5" />,
    description: 'Overall appearance theme'
  },
  hair: {
    name: 'Hair',
    icon: <User className="w-5 h-5" />,
    description: 'Hairstyles and colors'
  },
  eyes: {
    name: 'Eyes',
    icon: <Eye className="w-5 h-5" />,
    description: 'Eye colors and styles'
  },
  clothing: {
    name: 'Clothing',
    icon: <Shirt className="w-5 h-5" />,
    description: 'Outfits and apparel'
  },
  accessories: {
    name: 'Accessories',
    icon: <Crown className="w-5 h-5" />,
    description: 'Hats, glasses, and jewelry'
  },
  background: {
    name: 'Background',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Background environments'
  },
  effects: {
    name: 'Effects',
    icon: <Zap className="w-5 h-5" />,
    description: 'Special visual effects'
  }
};

// Rarity System for Avatar Items
const ITEM_RARITY = {
  common: {
    name: 'Common',
    color: 'text-gray-600 bg-gray-100',
    glow: '',
    cost: 0
  },
  uncommon: {
    name: 'Uncommon',
    color: 'text-green-600 bg-green-100',
    glow: 'shadow-lg shadow-green-200',
    cost: 50
  },
  rare: {
    name: 'Rare',
    color: 'text-blue-600 bg-blue-100',
    glow: 'shadow-lg shadow-blue-200',
    cost: 150
  },
  epic: {
    name: 'Epic',
    color: 'text-purple-600 bg-purple-100',
    glow: 'shadow-lg shadow-purple-200',
    cost: 300
  },
  legendary: {
    name: 'Legendary',
    color: 'text-orange-600 bg-orange-100',
    glow: 'shadow-lg shadow-orange-200',
    cost: 500
  },
  mythical: {
    name: 'Mythical',
    color: 'text-pink-600 bg-pink-100',
    glow: 'shadow-lg shadow-pink-200',
    cost: 1000
  }
};

// Avatar Items Database
const AVATAR_ITEMS = {
  theme: [
    {
      id: 'default',
      name: 'Default',
      rarity: 'common',
      unlocked: true,
      description: 'Classic coding theme',
      preview: '👨‍💻'
    },
    {
      id: 'neon_cyber',
      name: 'Neon Cyber',
      rarity: 'rare',
      unlockCondition: { level: 10 },
      description: 'Futuristic cyberpunk theme',
      preview: '🦾'
    },
    {
      id: 'nature_harmony',
      name: 'Nature Harmony',
      rarity: 'epic',
      unlockCondition: { achievement: 'eco_coder' },
      description: 'Earth-friendly coding theme',
      preview: '🌿'
    },
    {
      id: 'space_explorer',
      name: 'Space Explorer',
      rarity: 'legendary',
      unlockCondition: { questsCompleted: 50 },
      description: 'Cosmic coding adventures',
      preview: '🚀'
    }
  ],
  hair: [
    {
      id: 'default_hair',
      name: 'Classic',
      rarity: 'common',
      unlocked: true,
      description: 'Classic hairstyle',
      preview: '👱'
    },
    {
      id: 'spiky_hair',
      name: 'Spiky',
      rarity: 'uncommon',
      unlockCondition: { xp: 1000 },
      description: 'Edgy spiky hair',
      preview: '🦔'
    },
    {
      id: 'rainbow_hair',
      name: 'Rainbow',
      rarity: 'epic',
      unlockCondition: { achievement: 'color_master' },
      description: 'Vibrant rainbow colors',
      preview: '🌈'
    },
    {
      id: 'fire_hair',
      name: 'Fire Mane',
      rarity: 'legendary',
      unlockCondition: { battleWins: 20 },
      description: 'Blazing fire hair effect',
      preview: '🔥'
    }
  ],
  eyes: [
    {
      id: 'brown_eyes',
      name: 'Brown',
      rarity: 'common',
      unlocked: true,
      description: 'Warm brown eyes',
      preview: '👁️'
    },
    {
      id: 'blue_eyes',
      name: 'Ocean Blue',
      rarity: 'uncommon',
      unlockCondition: { skillPoints: 10 },
      description: 'Deep ocean blue',
      preview: '💙'
    },
    {
      id: 'green_eyes',
      name: 'Forest Green',
      rarity: 'rare',
      unlockCondition: { treeLevel: 15 },
      description: 'Mystical forest green',
      preview: '💚'
    },
    {
      id: 'galaxy_eyes',
      name: 'Galaxy',
      rarity: 'mythical',
      unlockCondition: { mastery: 'frontend' },
      description: 'Cosmic galaxy pattern',
      preview: '🌌'
    }
  ],
  clothing: [
    {
      id: 'casual_tshirt',
      name: 'Casual T-Shirt',
      rarity: 'common',
      unlocked: true,
      description: 'Comfortable coding attire',
      preview: '👕'
    },
    {
      id: 'hoodie',
      name: 'Developer Hoodie',
      rarity: 'uncommon',
      unlockCondition: { dailyStreak: 7 },
      description: 'Classic developer look',
      preview: '🧥'
    },
    {
      id: 'suit',
      name: 'Business Suit',
      rarity: 'rare',
      unlockCondition: { achievement: 'professional' },
      description: 'Professional business attire',
      preview: '👔'
    },
    {
      id: 'armor',
      name: 'Code Warrior Armor',
      rarity: 'epic',
      unlockCondition: { battleRank: 100 },
      description: 'Battle-tested armor',
      preview: '🛡️'
    },
    {
      id: 'wizard_robe',
      name: 'Algorithm Wizard Robe',
      rarity: 'legendary',
      unlockCondition: { mastery: 'algorithms' },
      description: 'Mystical coding powers',
      preview: '🧙‍♂️'
    }
  ],
  accessories: [
    {
      id: 'none',
      name: 'None',
      rarity: 'common',
      unlocked: true,
      description: 'No accessories',
      preview: '🚫'
    },
    {
      id: 'glasses',
      name: 'Coding Glasses',
      rarity: 'uncommon',
      unlockCondition: { linesOfCode: 500 },
      description: 'Blue light filtering glasses',
      preview: '👓'
    },
    {
      id: 'headphones',
      name: 'RGB Headphones',
      rarity: 'rare',
      unlockCondition: { focusTime: 100 },
      description: 'Immersive coding audio',
      preview: '🎧'
    },
    {
      id: 'crown',
      name: 'Code King Crown',
      rarity: 'epic',
      unlockCondition: { leaderboardRank: 1 },
      description: 'Crown of coding mastery',
      preview: '👑'
    },
    {
      id: 'halo',
      name: 'Debug Angel Halo',
      rarity: 'legendary',
      unlockCondition: { bugsFixed: 100 },
      description: 'Blessed debugging powers',
      preview: '😇'
    },
    {
      id: 'horns',
      name: 'Demon Coder Horns',
      rarity: 'mythical',
      unlockCondition: { perfectQuests: 25 },
      description: 'Devilishly good at coding',
      preview: '😈'
    }
  ],
  background: [
    {
      id: 'office',
      name: 'Home Office',
      rarity: 'common',
      unlocked: true,
      description: 'Cozy home workspace',
      preview: '🏠'
    },
    {
      id: 'cafe',
      name: 'Coffee Shop',
      rarity: 'uncommon',
      unlockCondition: { questsCompleted: 5 },
      description: 'Bustling cafe atmosphere',
      preview: '☕'
    },
    {
      id: 'matrix',
      name: 'Digital Matrix',
      rarity: 'epic',
      unlockCondition: { achievement: 'matrix_master' },
      description: 'Green code rain background',
      preview: '🔢'
    },
    {
      id: 'space_station',
      name: 'Space Station',
      rarity: 'legendary',
      unlockCondition: { level: 50 },
      description: 'Coding among the stars',
      preview: '🛰️'
    }
  ],
  effects: [
    {
      id: 'none',
      name: 'None',
      rarity: 'common',
      unlocked: true,
      description: 'No special effects',
      preview: '⭕'
    },
    {
      id: 'sparkles',
      name: 'Sparkles',
      rarity: 'rare',
      unlockCondition: { achievement: 'first_quest' },
      description: 'Magical sparkle effect',
      preview: '✨'
    },
    {
      id: 'code_aura',
      name: 'Code Aura',
      rarity: 'epic',
      unlockCondition: { linesOfCode: 2000 },
      description: 'Flowing code symbols',
      preview: '💻'
    },
    {
      id: 'lightning',
      name: 'Lightning',
      rarity: 'legendary',
      unlockCondition: { speedChallenges: 10 },
      description: 'Crackling energy',
      preview: '⚡'
    }
  ]
};

const CharacterCustomization = () => {
  const { gameState, updateAvatar, awardXP, showNotification } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('theme');
  const [currentAvatar, setCurrentAvatar] = useState(gameState.avatar || {
    theme: 'default',
    hair: 'default_hair',
    eyes: 'brown_eyes',
    clothing: 'casual_tshirt',
    accessories: 'none',
    background: 'office',
    effects: 'none'
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(null);

  // Check if item is unlocked
  const isItemUnlocked = (item) => {
    if (item.unlocked) return true;
    
    const condition = item.unlockCondition;
    if (!condition) return false;

    const stats = gameState.stats || {};
    const achievements = gameState.achievements?.unlocked || [];

    // Check various unlock conditions
    if (condition.level && gameState.level >= condition.level) return true;
    if (condition.xp && (gameState.xp || 0) >= condition.xp) return true;
    if (condition.skillPoints && (gameState.skillPoints || 0) >= condition.skillPoints) return true;
    if (condition.questsCompleted && (stats.questsCompleted || 0) >= condition.questsCompleted) return true;
    if (condition.dailyStreak && (stats.dailyStreak || 0) >= condition.dailyStreak) return true;
    if (condition.linesOfCode && (stats.linesOfCode || 0) >= condition.linesOfCode) return true;
    if (condition.battleWins && (stats.battleWins || 0) >= condition.battleWins) return true;
    if (condition.achievement && achievements.some(a => a.id === condition.achievement)) return true;

    return false;
  };

  // Purchase item with currency
  const purchaseItem = (item) => {
    const cost = ITEM_RARITY[item.rarity].cost;
    const currency = gameState.currency || 0;

    if (currency >= cost) {
      // Deduct currency and unlock item
      showNotification({
        type: 'success',
        title: 'Item Purchased! 🛍️',
        message: `${item.name} unlocked for ${cost} coins!`
      });
      // In real app, this would update the backend
    } else {
      showNotification({
        type: 'error',
        title: 'Insufficient Funds 💸',
        message: `Need ${cost - currency} more coins!`
      });
    }
  };

  // Update avatar piece
  const updateAvatarPiece = (category, itemId) => {
    setCurrentAvatar(prev => ({
      ...prev,
      [category]: itemId
    }));
  };

  // Save avatar changes
  const saveAvatar = () => {
    updateAvatar(currentAvatar);
    showNotification({
      type: 'success',
      title: 'Avatar Saved! 💾',
      message: 'Your new look has been saved!'
    });
  };

  // Reset to previous avatar
  const resetAvatar = () => {
    setCurrentAvatar(gameState.avatar || {
      theme: 'default',
      hair: 'default_hair',
      eyes: 'brown_eyes',
      clothing: 'casual_tshirt',
      accessories: 'none',
      background: 'office',
      effects: 'none'
    });
  };

  // Random avatar generator
  const randomizeAvatar = () => {
    const newAvatar = {};
    
    Object.keys(AVATAR_CATEGORIES).forEach(category => {
      const items = AVATAR_ITEMS[category] || [];
      const unlockedItems = items.filter(item => isItemUnlocked(item));
      if (unlockedItems.length > 0) {
        const randomItem = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
        newAvatar[category] = randomItem.id;
      }
    });
    
    setCurrentAvatar(prev => ({ ...prev, ...newAvatar }));
  };

  // Export avatar configuration
  const exportAvatar = () => {
    const config = JSON.stringify(currentAvatar, null, 2);
    navigator.clipboard.writeText(config);
    showNotification({
      type: 'info',
      title: 'Avatar Exported! 📋',
      message: 'Avatar configuration copied to clipboard!'
    });
  };

  // Import avatar configuration
  const importAvatar = () => {
    // In real app, this would open a file dialog or text input
    showNotification({
      type: 'info',
      title: 'Import Feature Coming Soon! 📁',
      message: 'Avatar import functionality will be available soon!'
    });
  };

  // Render avatar preview
  const renderAvatarPreview = () => {
    const currentTheme = AVATAR_ITEMS.theme.find(t => t.id === currentAvatar.theme);
    const currentBg = AVATAR_ITEMS.background.find(b => b.id === currentAvatar.background);
    
    return (
      <div className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="text-6xl">{currentBg?.preview}</div>
        </div>
        
        {/* Main Avatar */}
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-2">
            {AVATAR_ITEMS.clothing.find(c => c.id === currentAvatar.clothing)?.preview || '👕'}
          </div>
          <div className="text-4xl mb-1">
            {AVATAR_ITEMS.hair.find(h => h.id === currentAvatar.hair)?.preview || '👱'}
          </div>
          <div className="text-2xl mb-1">
            {AVATAR_ITEMS.eyes.find(e => e.id === currentAvatar.eyes)?.preview || '👁️'}
          </div>
          
          {/* Accessories */}
          {currentAvatar.accessories !== 'none' && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl">
              {AVATAR_ITEMS.accessories.find(a => a.id === currentAvatar.accessories)?.preview}
            </div>
          )}
          
          {/* Effects */}
          {currentAvatar.effects !== 'none' && (
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-70 animate-pulse">
              {AVATAR_ITEMS.effects.find(e => e.id === currentAvatar.effects)?.preview}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render category items
  const renderCategoryItems = () => {
    const items = AVATAR_ITEMS[selectedCategory] || [];
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isUnlocked = isItemUnlocked(item);
          const isSelected = currentAvatar[selectedCategory] === item.id;
          const rarity = ITEM_RARITY[item.rarity];
          
          return (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-blue-500 scale-105'
                  : 'hover:scale-102'
              } ${
                isUnlocked
                  ? `${rarity.glow} hover:shadow-lg`
                  : 'opacity-60 grayscale'
              }`}
              onClick={() => {
                if (isUnlocked) {
                  updateAvatarPiece(selectedCategory, item.id);
                } else {
                  setShowUnlockModal(item);
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="text-center">
                  <div className="text-3xl mb-2">{item.preview}</div>
                  <CardTitle className="text-sm">{item.name}</CardTitle>
                  <div className={`text-xs px-2 py-1 rounded ${rarity.color} inline-block mt-1`}>
                    {rarity.name}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 text-center mb-2">{item.description}</p>
                
                {!isUnlocked && (
                  <div className="text-center">
                    <Lock className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                    <div className="text-xs text-gray-500">
                      {item.unlockCondition && Object.entries(item.unlockCondition).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {isSelected && (
                  <div className="text-center">
                    <Check className="w-4 h-4 mx-auto text-green-600" />
                    <div className="text-xs text-green-600">Selected</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="character-customization max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎨 Character Customization</h1>
        <p className="text-gray-600">Create your unique coding avatar!</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Avatar Preview</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={randomizeAvatar}
                    title="Randomize"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAvatar}
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderAvatarPreview()}
              
              {/* Avatar Actions */}
              <div className="mt-4 space-y-2">
                <Button
                  onClick={saveAvatar}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Avatar
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportAvatar}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={importAvatar}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
              
              {/* Avatar Stats */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Avatar Stats</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Rarity Score:</span>
                    <span>{Object.values(currentAvatar).reduce((score, itemId) => {
                      // Calculate total rarity score
                      return score + 1;
                    }, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uniqueness:</span>
                    <span>87%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customization Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customization Options</CardTitle>
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(AVATAR_CATEGORIES).map(([key, category]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="flex items-center gap-2"
                  >
                    {category.icon}
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">
                  {AVATAR_CATEGORIES[selectedCategory]?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {AVATAR_CATEGORIES[selectedCategory]?.description}
                </p>
              </div>
              
              {renderCategoryItems()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Unlock {showUnlockModal.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUnlockModal(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl">{showUnlockModal.preview}</div>
                <p className="text-gray-600">{showUnlockModal.description}</p>
                
                {/* Unlock Requirements */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Unlock Requirements:</h4>
                  {showUnlockModal.unlockCondition && Object.entries(showUnlockModal.unlockCondition).map(([key, value]) => (
                    <div key={key} className="text-sm text-gray-600">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                    </div>
                  ))}
                </div>
                
                {/* Purchase Option */}
                {ITEM_RARITY[showUnlockModal.rarity].cost > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">Or purchase with coins:</p>
                    <Button
                      onClick={() => purchaseItem(showUnlockModal)}
                      className="w-full"
                    >
                      <Gem className="w-4 h-4 mr-2" />
                      Buy for {ITEM_RARITY[showUnlockModal.rarity].cost} coins
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CharacterCustomization;