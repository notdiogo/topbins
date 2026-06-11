// Map country names (as stored in bracket_teams.name) to flag emojis
export const countryEmojiMap: Record<string, string> = {
  // Group A
  'Mexico':          '🇲🇽',
  'Korea Republic':  '🇰🇷',
  'South Africa':    '🇿🇦',
  'Czechia':         '🇨🇿',
  // Group B
  'Canada':          '🇨🇦',
  'Switzerland':     '🇨🇭',
  'Bosnia-Herz.':    '🇧🇦',
  'Qatar':           '🇶🇦',
  // Group C
  'Brazil':          '🇧🇷',
  'Morocco':         '🇲🇦',
  'Scotland':        '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Haiti':           '🇭🇹',
  // Group D
  'Türkiye':         '🇹🇷',
  'USA':             '🇺🇸',
  'Australia':       '🇦🇺',
  'Paraguay':        '🇵🇾',
  // Group E
  'Germany':         '🇩🇪',
  'Côte d\'Ivoire':  '🇨🇮',
  'Ecuador':         '🇪🇨',
  'Curaçao':         '🇨🇼',
  // Group F
  'Netherlands':     '🇳🇱',
  'Japan':           '🇯🇵',
  'Sweden':          '🇸🇪',
  'Tunisia':         '🇹🇳',
  // Group G
  'Belgium':         '🇧🇪',
  'Egypt':           '🇪🇬',
  'IR Iran':         '🇮🇷',
  'New Zealand':     '🇳🇿',
  // Group H
  'Spain':           '🇪🇸',
  'Uruguay':         '🇺🇾',
  'Saudi Arabia':    '🇸🇦',
  'Cabo Verde':      '🇨🇻',
  // Group I
  'France':          '🇫🇷',
  'Norway':          '🇳🇴',
  'Senegal':         '🇸🇳',
  'Iraq':            '🇮🇶',
  // Group J
  'Argentina':       '🇦🇷',
  'Algeria':         '🇩🇿',
  'Austria':         '🇦🇹',
  'Jordan':          '🇯🇴',
  // Group K
  'Portugal':        '🇵🇹',
  'Colombia':        '🇨🇴',
  'Congo DR':        '🇨🇩',
  'Uzbekistan':      '🇺🇿',
  // Group L
  'England':         '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croatia':         '🇭🇷',
  'Ghana':           '🇬🇭',
  'Panama':          '🇵🇦',
};

export const getCountryEmoji = (countryName?: string): string => {
  if (!countryName) return '';
  return countryEmojiMap[countryName] || '';
};

export const formatCountryWithEmoji = (countryName?: string): string => {
  if (!countryName) return '';
  const emoji = getCountryEmoji(countryName);
  return emoji ? `${emoji} ${countryName}` : countryName;
};
