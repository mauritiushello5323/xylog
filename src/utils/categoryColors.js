// Category → color mapping
// border: photo border & capsule outline color
// bg: capsule background
// dot: active filter indicator

export const CATEGORIES = {
  all:        { label: 'ALL',        border: '#1a1a1a', bg: '#1a1a1a',   text: '#fff'    },
  shopping:   { label: 'SHOPPING',   border: '#FF6B7A', bg: '#FFE0E3',   text: '#c0001a' },
  food:       { label: 'FOOD',       border: '#FF9500', bg: '#FFE8C8',   text: '#8B4A00' },
  cafe:       { label: 'CAFE',       border: '#FDCB1A', bg: '#FFF5C0',   text: '#7A5F00' },
  transport:  { label: 'TRANSPORT',  border: '#4DC594', bg: '#D4F5E7',   text: '#1a6640' },
  sightseeing:{ label: 'SIGHTS',     border: '#6FA8FF', bg: '#DDE9FF',   text: '#1a3c8a' },
  stay:       { label: 'STAY',       border: '#B97FFF', bg: '#ECD9FF',   text: '#5a1a9a' },
  other:      { label: 'OTHER',      border: '#A0A0A0', bg: '#EBEBEB',   text: '#3a3a3a' },
}

export function getCategoryColor(category) {
  return CATEGORIES[category] ?? CATEGORIES.other
}

export const CATEGORY_KEYS = Object.keys(CATEGORIES)
