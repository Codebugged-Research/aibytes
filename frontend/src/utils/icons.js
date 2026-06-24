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
  Clock,
  Lightbulb,
  Package,
  Folder,
  Database,
  Radio,
  Archive,
  Search,
  Eye,
  LineChart,
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
  '🎉': Sparkles,
  '🕰️': Clock,
  '🤔': Brain,
  '📦': Package,
  '🗂️': Folder,
  '🗄️': Database,
  '📡': Radio,
  '🗃️': Archive,
  '🔎': Search,
  '🧹': Sparkles,
  '🕵️': Eye,
  '📈': LineChart,
  '💡': Lightbulb,
};

/**
 * Resolve a clean Lucide component for an emoji string. Falls back to a neutral
 * Sparkles icon (never a question mark) for any unmapped emoji.
 * @param {string} emoji The emoji character or tag
 * @param {object} props SVG properties (size, className, strokeWidth, etc.)
 */
export const getIconForEmoji = (emoji, props = {}) => {
  const cleanEmoji = typeof emoji === 'string' ? emoji.trim() : '';
  const IconComponent = emojiMap[cleanEmoji] || Sparkles;
  return <IconComponent {...props} />;
};
