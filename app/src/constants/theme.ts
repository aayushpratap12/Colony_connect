export const Colors = {
  primary: '#2563EB',      // Blue 600
  primaryDark: '#1D4ED8',  // Blue 700
  primaryLight: '#DBEAFE', // Blue 100
  secondary: '#7C3AED',    // Violet 600
  accent: '#F59E0B',       // Amber 500

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textDisabled: '#CBD5E1',
  textInverse: '#FFFFFF',

  // Role-based
  residentColor: '#2563EB',
  secretaryColor: '#7C3AED',
  guardColor: '#059669',

  // SOS
  sosRed: '#DC2626',
  sosRedLight: '#FEE2E2',

  overlay: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
