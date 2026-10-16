const SOURCE_VALUES = [
  'Abundance', 'Acceptance', 'Accountability', 'Achievement', 'Advancement', 'Adventure', 'Advocacy',
  'Ambition', 'Appreciation', 'Attractiveness', 'Autonomy', 'Balance', 'Being the Best', 'Benevolence',
  'Boldness', 'Brilliance', 'Calmness', 'Caring', 'Challenge', 'Charity', 'Cheerfulness', 'Cleverness',
  'Community', 'Commitment', 'Compassion', 'Cooperation', 'Collaboration', 'Consistency', 'Contribution',
  'Creativity', 'Credibility', 'Curiosity', 'Daring', 'Decisiveness', 'Dedication', 'Dependability',
  'Diversity', 'Empathy', 'Encouragement', 'Enthusiasm', 'Ethics', 'Excellence', 'Expressiveness',
  'Fairness', 'Family', 'Friendships', 'Flexibility', 'Freedom', 'Fun', 'Generosity', 'Grace', 'Growth',
  'Happiness', 'Health', 'Honesty', 'Humility', 'Humor', 'Inclusiveness', 'Independence', 'Individuality',
  'Innovation', 'Inspiration', 'Intelligence', 'Intuition', 'Joy', 'Kindness', 'Knowledge', 'Leadership',
  'Learning', 'Love', 'Loyalty', 'Making a Difference', 'Mindfulness', 'Motivation', 'Optimism',
  'Open-Mindedness', 'Originality', 'Passion', 'Performance', 'Personal Development', 'Proactive',
  'Professionalism', 'Quality', 'Recognition', 'Risk Taking', 'Safety', 'Security', 'Service',
  'Spirituality', 'Stability', 'Peace', 'Perfection', 'Playfulness', 'Popularity', 'Power', 'Preparedness',
  'Proactivity', 'Punctuality', 'Relationships', 'Reliability', 'Resilience', 'Resourcefulness',
  'Responsibility', 'Responsiveness', 'Self-Control', 'Selflessness', 'Simplicity', 'Success', 'Teamwork',
  'Thankfulness', 'Thoughtfulness', 'Traditionalism', 'Trustworthiness', 'Understanding', 'Uniqueness',
  'Usefulness', 'Versatility', 'Vision', 'Warmth', 'Wealth', 'Well-Being', 'Wisdom', 'Zeal',
]

export const VALUES: string[] = [...new Set(SOURCE_VALUES)].sort((a, b) => a.localeCompare(b))

export const EXAMPLE_GROUPS: { label: string; values: string[] }[] = [
  { label: 'Freedom', values: ['Abundance', 'Growth', 'Wealth', 'Security', 'Freedom', 'Independence', 'Flexibility', 'Peace'] },
  {
    label: 'Making a Difference',
    values: ['Acceptance', 'Compassion', 'Inclusiveness', 'Intuition', 'Kindness', 'Love', 'Making a Difference', 'Open-Mindedness', 'Trustworthiness', 'Relationships'],
  },
  { label: 'Mindfulness', values: ['Appreciation', 'Encouragement', 'Thankfulness', 'Thoughtfulness', 'Mindfulness'] },
  { label: 'Well-Being', values: ['Balance', 'Health', 'Personal Development', 'Spirituality', 'Well-Being'] },
  { label: 'Happiness', values: ['Cheerfulness', 'Fun', 'Happiness', 'Humor', 'Inspiration', 'Joy', 'Optimism', 'Playfulness'] },
]
