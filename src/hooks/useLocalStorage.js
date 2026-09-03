import { useState, useEffect } from 'react';
import storage from '../utils/storage';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    return storage.getItem(key, initialValue);
  });

  useEffect(() => {
    storage.setItem(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export default useLocalStorage;
