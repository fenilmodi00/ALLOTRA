import axios from 'axios';

// Base API URL - replace with your actual backend URL in production
const API_URL = 'http://localhost:4000/api';

// Dummy data for development when API is unavailable
const DUMMY_IPOS = [
  {
    id: '1',
    name: 'TechCorp Inc.',
    symbol: 'TECH',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-06-05'),
    lotSize: 10,
    priceRange: '₹900 - ₹950',
    minLots: 1,
    maxLots: 14,
    status: 'active' as const,
    allotmentDate: new Date('2023-06-10'),
    listingDate: new Date('2023-06-15'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Green Energy Solutions',
    symbol: 'GES',
    startDate: new Date('2023-06-10'),
    endDate: new Date('2023-06-14'),
    lotSize: 15,
    priceRange: '₹350 - ₹370',
    minLots: 1,
    maxLots: 10,
    status: 'upcoming' as const,
    allotmentDate: new Date('2023-06-20'),
    listingDate: new Date('2023-06-25'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'MediPharm Labs',
    symbol: 'MPL',
    startDate: new Date('2023-05-15'),
    endDate: new Date('2023-05-19'),
    lotSize: 20,
    priceRange: '₹500 - ₹525',
    minLots: 1,
    maxLots: 8,
    status: 'closed' as const,
    allotmentDate: new Date('2023-05-25'),
    listingDate: new Date('2023-05-30'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const DUMMY_PAN_CARDS = [
  {
    id: '1',
    userId: 'demo-user',
    panNumber: 'ABCDE1234F',
    name: 'John Doe',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    userId: 'demo-user',
    panNumber: 'FGHIJ5678K',
    name: 'Jane Smith',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const DUMMY_ALLOTMENTS = [
  {
    id: '1',
    ipoId: '1',
    panId: '1',
    appliedLots: 2,
    status: 'allotted',
    allottedShares: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    ipo: DUMMY_IPOS[0],
    panCard: DUMMY_PAN_CARDS[0]
  },
  {
    id: '2',
    ipoId: '3',
    panId: '1',
    appliedLots: 3,
    status: 'not_allotted',
    allottedShares: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ipo: DUMMY_IPOS[2],
    panCard: DUMMY_PAN_CARDS[0]
  }
];

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for request and response
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API helper methods
const api = {
  setToken: (token: string) => {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  clearToken: () => {
    delete apiClient.defaults.headers.common['Authorization'];
  },
  
  // Generic request methods
  get: (url: string, config = {}) => apiClient.get(url, config),
  post: (url: string, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url: string, data = {}, config = {}) => apiClient.put(url, data, config),
  delete: (url: string, config = {}) => apiClient.delete(url, config),
  
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      apiClient.post('/auth/login', { email, password }),
    register: (name: string, email: string, password: string) => 
      apiClient.post('/auth/register', { name, email, password }),
    validate: () => apiClient.get('/auth/validate'),
  },
  
  // PAN Card endpoints
  panCards: {
    getAll: () => {
      return new Promise((resolve) => {
        resolve({ data: DUMMY_PAN_CARDS });
      });
    },
    getById: (id: string) => {
      return new Promise((resolve) => {
        const panCard = DUMMY_PAN_CARDS.find(p => p.id === id);
        resolve({ data: panCard });
      });
    },
    create: (data: { panNumber: string; name: string }) => {
      return new Promise((resolve) => {
        const newPanCard = {
          id: Date.now().toString(),
          userId: 'demo-user',
          ...data,
          isDefault: DUMMY_PAN_CARDS.length === 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        DUMMY_PAN_CARDS.push(newPanCard);
        resolve({ data: newPanCard });
      });
    },
    update: (id: string, data: { name?: string; isDefault?: boolean }) => {
      return new Promise((resolve) => {
        const index = DUMMY_PAN_CARDS.findIndex(p => p.id === id);
        if (index !== -1) {
          DUMMY_PAN_CARDS[index] = { ...DUMMY_PAN_CARDS[index], ...data, updatedAt: new Date() };
          resolve({ data: DUMMY_PAN_CARDS[index] });
        }
      });
    },
    delete: (id: string) => {
      return new Promise((resolve) => {
        const index = DUMMY_PAN_CARDS.findIndex(p => p.id === id);
        if (index !== -1) {
          DUMMY_PAN_CARDS.splice(index, 1);
        }
        resolve({ data: { success: true } });
      });
    },
    setDefault: (id: string) => {
      return new Promise((resolve) => {
        DUMMY_PAN_CARDS.forEach(p => {
          p.isDefault = p.id === id;
        });
        resolve({ data: { success: true } });
      });
    },
  },
  
  // IPO endpoints
  ipos: {
    getAll: () => {
      return new Promise((resolve) => {
        resolve({ data: DUMMY_IPOS });
      });
    },
    getById: (id: string) => {
      return new Promise((resolve) => {
        const ipo = DUMMY_IPOS.find(i => i.id === id);
        resolve({ data: ipo });
      });
    },
    getActive: () => {
      return new Promise((resolve) => {
        const activeIpos = DUMMY_IPOS.filter(i => i.status === 'active');
        resolve({ data: activeIpos });
      });
    },
    getUpcoming: () => {
      return new Promise((resolve) => {
        const upcomingIpos = DUMMY_IPOS.filter(i => i.status === 'upcoming');
        resolve({ data: upcomingIpos });
      });
    },
    getClosed: () => {
      return new Promise((resolve) => {
        const closedIpos = DUMMY_IPOS.filter(i => i.status === 'closed');
        resolve({ data: closedIpos });
      });
    },
  },
  
  // Allotment Status endpoints
  allotments: {
    getAll: () => {
      return new Promise((resolve) => {
        resolve({ data: DUMMY_ALLOTMENTS });
      });
    },
    getById: (id: string) => {
      return new Promise((resolve) => {
        const allotment = DUMMY_ALLOTMENTS.find(a => a.id === id);
        resolve({ data: allotment });
      });
    },
    create: (data: { panId: string; ipoId: string; appliedLots: number }) => {
      return new Promise((resolve) => {
        const ipo = DUMMY_IPOS.find(i => i.id === data.ipoId);
        const panCard = DUMMY_PAN_CARDS.find(p => p.id === data.panId);
        
        if (!ipo || !panCard) {
          resolve({ data: { error: 'IPO or PAN card not found' } });
          return;
        }
        
        const newAllotment = {
          id: Date.now().toString(),
          ...data,
          status: Math.random() > 0.5 ? 'allotted' : 'not_allotted',
          allottedShares: Math.random() > 0.5 ? data.appliedLots * 10 : 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipo,
          panCard
        };
        DUMMY_ALLOTMENTS.push(newAllotment);
        resolve({ data: newAllotment });
      });
    },
    update: (id: string, data: { appliedLots?: number }) => {
      return new Promise((resolve) => {
        const index = DUMMY_ALLOTMENTS.findIndex(a => a.id === id);
        if (index !== -1) {
          DUMMY_ALLOTMENTS[index] = { ...DUMMY_ALLOTMENTS[index], ...data, updatedAt: new Date() };
          resolve({ data: DUMMY_ALLOTMENTS[index] });
        }
      });
    },
    delete: (id: string) => {
      return new Promise((resolve) => {
        const index = DUMMY_ALLOTMENTS.findIndex(a => a.id === id);
        if (index !== -1) {
          DUMMY_ALLOTMENTS.splice(index, 1);
        }
        resolve({ data: { success: true } });
      });
    },
    check: (id: string) => {
      return new Promise((resolve) => {
        // Simulate checking allotment status
        setTimeout(() => {
          resolve({ data: { success: true, message: 'Allotment status checked successfully' } });
        }, 1000);
      });
    },
  },
};

export default api; 