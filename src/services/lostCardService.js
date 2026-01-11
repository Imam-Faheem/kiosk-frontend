// This file is deprecated - use cardIssuanceService.js instead
// Kept for backward compatibility
import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
import { STORAGE_KEYS, API_CONFIG } from '../config/constants';
import { issueCard as issueHardwareCard } from './hardware/hardwareService';

export * from './cardIssuanceService';

const getPropertyContext = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { propertyId: null, organizationId: API_CONFIG.ORGANIZATION_ID ?? null };
    }
    
    const propertyData = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    if (propertyData) {
      const parsed = JSON.parse(propertyData);
      if (parsed.propertyId && parsed.organizationId) {
        return {
          propertyId: parsed.propertyId,
          organizationId: parsed.organizationId,
        };
      }
    }

    try {
      const propertyStoreData = localStorage.getItem('property-storage');
      if (propertyStoreData) {
        const storeParsed = JSON.parse(propertyStoreData);
        const selectedProperty = storeParsed?.state?.selectedProperty;
        const propertyId = storeParsed?.state?.propertyId;
        
        if (selectedProperty && propertyId) {
          const organizationId = selectedProperty.organization_id ?? selectedProperty.organizationId;
          if (organizationId) {
            return {
              propertyId: propertyId,
              organizationId: organizationId,
            };
          }
        }
      }
    } catch (e) {
      // Ignore errors when reading property store
    }

    return {
      propertyId: null,
      organizationId: API_CONFIG.ORGANIZATION_ID ?? null,
    };
  } catch {
    return { 
      propertyId: null, 
      organizationId: API_CONFIG.ORGANIZATION_ID ?? null,
    };
  }
};

/**
 * Validate lost card request
 * POST /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/validate-lost-card
 * @param {string} reservationId - Reservation ID
 * @param {string} propertyId - Property ID (optional)
 * @param {string} organizationId - Organization ID (optional)
 * @returns {Promise<Object>} Validation result
 */
export const validateLostCard = async (reservationId, propertyId = null, organizationId = null) => {
  if (!reservationId) {
    throw new Error('Reservation ID is required.');
  }
  
  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to validate lost card request.');
  }
  
  const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/validate-lost-card`;
  
  console.log('[validateLostCard] Making request:', {
    endpoint,
    method: 'POST',
    propertyId: finalPropertyId,
    organizationId: finalOrganizationId,
    reservationId,
  });

  try {
    const response = await apiClient.post(endpoint);
    
    console.log('[validateLostCard] Success:', {
      status: response.status,
      data: response.data,
    });
    
    return response.data;
  } catch (error) {
    console.error('[validateLostCard] Error:', {
      endpoint,
      propertyId: finalPropertyId,
      organizationId: finalOrganizationId,
      reservationId,
      error: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.response?.statusText ??
                   error?.message ??
                   'Failed to validate lost card request';
    throw new Error(message);
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use validateLostCard instead
 */
export const getLostCardRequest = async (reservationId, propertyId = null, organizationId = null) => {
  return validateLostCard(reservationId, propertyId, organizationId);
};

export const validateLostCardGuest = async (data) => {
  const { reservationNumber, lastName } = data;

  if (!reservationNumber) {
    throw new Error(translateError('reservationIdRequired'));
  }

  const context = getPropertyContext();
  
  if (!context.propertyId || !context.organizationId) {
    throw new Error('Property ID and Organization ID are required to validate lost card guest.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/reservations/${reservationNumber}/details`;

  try {
    const response = await apiClient.get(endpoint, {
      params: lastName ? { lastName } : {},
    });
    
    const apiData = response.data?.success === true && response.data?.data 
      ? response.data.data 
      : response.data;

    if (!apiData) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    // Validate lastName if provided
    if (lastName) {
      const lastNameLower = lastName.trim().toLowerCase();
      const reservationLastName = apiData?.primaryGuest?.lastName?.trim().toLowerCase();

      if (!reservationLastName || lastNameLower !== reservationLastName) {
        throw new Error(translateError('lastNameMismatch'));
      }
    }

    const hasPrimaryGuest = !!apiData.primaryGuest;
    const hasFolios = Array.isArray(apiData.folios) && apiData.folios.length > 0;
    const hasGuestName = !!apiData.guest_name;

    if (!hasPrimaryGuest && !hasFolios && !hasGuestName) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    return {
      success: true,
      data: apiData,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   translateError('guestValidationFailed');
    throw new Error(message);
  }
};

export const regenerateLostCard = async (data) => {
  const context = getPropertyContext();
  
  if (!context.propertyId || !context.organizationId) {
    throw new Error('Property ID and Organization ID are required to regenerate lost card.');
  }
  
  // Extract reservation_id from data (can be reservation_id, reservationId, or id)
  const reservationId = data?.reservation_id ?? data?.reservationId ?? data?.id;
  
  if (!reservationId) {
    throw new Error('Reservation ID is required to regenerate lost card.');
  }

  try {
    // Step A: Validate lost card request
    const validateEndpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/reservations/${reservationId}/validate-lost-card`;
    
    console.log('[regenerateLostCard] Step A: Validating lost card request', {
      endpoint: validateEndpoint,
      reservationId
    });

    const validateResponse = await apiClient.post(validateEndpoint);
    
    if (!validateResponse.data?.success) {
      throw new Error(validateResponse.data?.error || validateResponse.data?.message || 'Validation failed');
    }

    console.log('[regenerateLostCard] Validation successful', {
      booking_id: validateResponse.data?.data?.reservation?.bookingId
    });

    // Step B: Issue card (get card data from TTLock)
    const issueEndpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/reservations/${reservationId}/issue-lost-card`;
    
    console.log('[regenerateLostCard] Step B: Issuing card data', {
      endpoint: issueEndpoint
    });

    const issueResponse = await apiClient.post(issueEndpoint);
    
    if (!issueResponse.data?.success) {
      throw new Error(issueResponse.data?.error || issueResponse.data?.message || 'Failed to issue card');
    }

    const cardData = issueResponse.data?.data;
    
    console.log('[regenerateLostCard] Card data retrieved successfully', {
      card_no: cardData?.cardNo,
      has_card_data: !!cardData?.cardData,
      has_hotel_info: !!cardData?.hotelInfo
    });

    // Step C: Send cardData and hotelInfo to hardware service
    if (cardData?.cardData) {
      console.log('[regenerateLostCard] Step C: Triggering hardware card issuance', {
        card_data_length: cardData.cardData.length,
        has_hotel_info: !!cardData.hotelInfo
      });

      try {
        // Issue card via hardware service with cardData and hotelInfo
        const hardwareResult = await issueHardwareCard(cardData.cardData, cardData.hotelInfo);
        
        console.log('[regenerateLostCard] Hardware card issued successfully', {
          card_id: hardwareResult?.data?.cardId,
          card_type: hardwareResult?.data?.cardType
        });

        // Merge hardware result with API result
        return {
          success: true,
          data: {
            ...cardData,
            hardware: {
              success: true,
              cardId: hardwareResult?.data?.cardId,
              cardType: hardwareResult?.data?.cardType,
              encodedAt: hardwareResult?.data?.encodedAt
            }
          }
        };
      } catch (hardwareError) {
        console.error('[regenerateLostCard] Hardware card issuance failed', {
          error: hardwareError.message
        });

        // Return API result but include hardware error
        return {
          success: true,
          data: {
            ...cardData,
            hardware: {
              success: false,
              error: hardwareError.message,
              message: 'Card data retrieved but physical card issuance failed'
            }
          }
        };
      }
    } else {
      console.warn('[regenerateLostCard] No card data in response, skipping hardware issuance');
      return {
        success: true,
        data: cardData
      };
    }
  } catch (error) {
    const baseURL = apiClient.defaults?.baseURL ?? API_CONFIG.BASE_URL ?? 'http://localhost:8000';
    const issueEndpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/reservations/${reservationId}/issue-lost-card`;
    const fullUrl = `${baseURL}${issueEndpoint}`;
    
    // Check if this is a CORS error
    const isCorsError = !error.response && (
      error.message?.includes('CORS') ||
      error.message?.includes('Access-Control') ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('blocked by CORS policy')
    );
    
    console.error('[regenerateLostCard] Error calling Kong:', {
      endpoint: issueEndpoint,
      baseURL,
      fullUrl,
      propertyId: context.propertyId,
      organizationId: context.organizationId,
      reservationId,
      error: error.message,
      errorCode: error.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      isCorsError,
      requestConfig: {
        url: issueEndpoint,
        method: 'POST',
        baseURL: baseURL,
      },
    });

    // Handle CORS errors with a more helpful message
    if (isCorsError) {
      const corsMessage = `CORS error: The request to ${fullUrl} was blocked. Please ensure Kong is configured to allow the X-Organization-ID and X-Property-ID headers in CORS preflight responses.`;
      console.error('[regenerateLostCard] CORS Error Details:', corsMessage);
      throw new Error('Connection error: Unable to reach the server. Please check that Kong is running and CORS is properly configured.');
    }

    // Display the error message from the API response
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.response?.statusText ??
                   error?.message ??
                   'Failed to regenerate card';
    throw new Error(message);
  }
};

