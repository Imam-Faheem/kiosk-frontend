import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api/apiClient';

export const useReservationQuery = () => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchReservations = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...params.filters,
      });

      const response = await apiClient.get(`/reservations?${queryParams}`);
      const { data, pagination: paginationData } = response.data;

      setReservations(data);
      setPagination(paginationData);
      
      return { data, pagination: paginationData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch reservations';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchReservationById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/reservations/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch reservation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchReservations = useCallback(async (searchTerm, filters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      const response = await apiClient.get(`/reservations/search?${queryParams}`);
      const { data, pagination: paginationData } = response.data;

      setReservations(data);
      setPagination(paginationData);
      
      return { data, pagination: paginationData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to search reservations';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const refreshReservations = useCallback(() => {
    return fetchReservations();
  }, [fetchReservations]);

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchReservations();
  }, [pagination.page, pagination.limit]);

  return {
    reservations,
    isLoading,
    error,
    pagination,
    fetchReservations,
    fetchReservationById,
    searchReservations,
    refreshReservations,
    setPage,
    setLimit,
    clearError: () => setError(null),
  };
};
