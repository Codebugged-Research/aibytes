import React from 'react';
import { 
  Award, 
  Brain, 
  Layers, 
  Target, 
  Smartphone, 
  PawPrint, 
  Camera, 
  Bot, 
  Scale, 
  BarChart2, 
  Puzzle, 
  Globe, 
  Film, 
  User, 
  XCircle, 
  CheckCircle, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

const emojiMap = {
  '🥉': Award,
  '🧠': Brain,
  '🍰': Layers,
  '🎯': Target,
  '📱': Smartphone,
  '🐶': PawPrint,
  '📷': Camera,
  '🤖': Bot,
  '⚖️': Scale,
  '📊': BarChart2,
  '🧩': Puzzle,
  '🌍': Globe,
  '🎬': Film,
  '👤': User,
  '❌': XCircle,
  '✅': CheckCircle,
  '🎉': Sparkles
};

/**
 * Helper to dynamically resolve a clean Lucide component for any emoji string.
 * @param {string} emoji The emoji character or tag
 * @param {object} props SVG properties (size, className, strokeWidth, etc.)
 */
export const getIconForEmoji = (emoji, props = {}) => {
  const cleanEmoji = typeof emoji === 'string' ? emoji.trim() : '';
  const IconComponent = emojiMap[cleanEmoji] || HelpCircle;
  return <IconComponent {...props} />;
};
