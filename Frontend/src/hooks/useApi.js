import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useNotification();

  const {
    immediate = true,
    onSuccess,
    onError,
    showErrorNotification = true
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (showErrorNotification) {
        showError(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showError, showErrorNotification]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch
  };
};

export const useMutation = (mutationFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useNotification();

  const {
    onSuccess,
    onError,
    showErrorNotification = true,
    showSuccessNotification = false,
    successMessage = 'Operation completed successfully'
  } = options;

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFunction(...args);
      
      if (showSuccessNotification) {
        showSuccess(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (showErrorNotification) {
        showError(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFunction, onSuccess, onError, showError, showSuccess, showErrorNotification, showSuccessNotification, successMessage]);

  return {
    mutate,
    loading,
    error,
    reset: () => setError(null)
  };
};