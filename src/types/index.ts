export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PanCard {
  id: string;
  userId: string;
  panNumber: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPO {
  id: string;
  name: string;
  symbol: string;
  startDate: Date;
  endDate: Date;
  lotSize: number;
  priceRange: string;
  minLots: number;
  maxLots: number;
  status: 'upcoming' | 'active' | 'closed';
  allotmentDate?: Date;
  listingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AllotmentStatus {
  id: string;
  userId: string;
  panId: string;
  ipoId: string;
  status: 'pending' | 'allotted' | 'not_allotted';
  appliedLots: number;
  allottedLots: number;
  appliedDate: Date;
  checkedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Navigation related types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  PanManagement: undefined;
  Results: undefined;
  Settings: undefined;
};

export type AdminStackParamList = {
  AdminPanel: undefined;
}; 