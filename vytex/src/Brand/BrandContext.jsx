import React, { createContext, useContext, useState } from 'react';

// Brand Context for managing brand-specific state
const BrandContext = createContext();

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

export const BrandProvider = ({ children }) => {
  const [brandData, setBrandData] = useState({
    name: 'Brand Dashboard',
    email: 'brand@example.com',
    balance: 24580,
    growth: 12.5,
    notifications: 3
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateBrandData = (newData) => {
    setBrandData(prev => ({ ...prev, ...newData }));
  };

  const value = {
    brandData,
    updateBrandData,
    isLoading,
    setIsLoading
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};