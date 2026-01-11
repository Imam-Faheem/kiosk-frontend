import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
import { STORAGE_KEYS } from '../config/constants';
import { API_CONFIG } from '../config/constants';
import { issueCard as issueHardwareCard } from './hardware/hardwareService';

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
 * Validate lost card request (specific to lost cards)
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
  
  try {
    const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/validate-lost-card`;
    const response = await apiClient.post(endpoint);
    
    if (!response.data?.success) {
      throw new Error(response.data?.error || response.data?.message || 'Validation failed');
    }
    
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to validate lost card request';
    throw new Error(message);
  }
};

/**
 * Issue card for a reservation (general function for lost cards, new reservations, check-ins)
 * @param {string|Object} reservationIdOrData - Reservation ID string or object with reservation_id/reservationId/id
 * @param {string} propertyId - Property ID (optional)
 * @param {string} organizationId - Organization ID (optional)
 * @returns {Promise<Object>} Card issuance result with cardData, hotelInfo, and hardware result
 */
export const issueCard = async (reservationIdOrData, propertyId = null, organizationId = null) => {
  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to issue card.');
  }
  
  // Extract reservation_id from data (can be reservation_id, reservationId, id, or direct string)
  const reservationId = typeof reservationIdOrData === 'string' 
    ? reservationIdOrData 
    : reservationIdOrData?.reservation_id ?? reservationIdOrData?.reservationId ?? reservationIdOrData?.id;
  
  if (!reservationId) {
    throw new Error('Reservation ID is required to issue card.');
  }

  try {
    // Step A: Validate reservation (optional - can be skipped for new reservations/check-ins)
    // For lost cards, we validate first. For new reservations/check-ins, we can skip this.
    let validationResult = null;
    try {
      const validateEndpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/validate-lost-card`;
      const validateResponse = await apiClient.post(validateEndpoint);
      
      if (validateResponse.data?.success) {
        validationResult = validateResponse.data.data;
        console.log('[issueCard] Validation successful', {
          booking_id: validationResult?.reservation?.bookingId
        });
      }
    } catch (validationError) {
      // Validation is optional - if it fails, we can still proceed for new reservations/check-ins
      console.warn('[issueCard] Validation skipped or failed, proceeding with card issuance', {
        error: validationError.message
      });
    }

    // Step B: Issue card (get card data from TTLock)
    // POST /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/issue-card
    const issueEndpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/issue-card`;
    
    console.log('[issueCard] Issuing card data', {
      endpoint: issueEndpoint,
      fullUrl: `${apiClient.defaults?.baseURL ?? API_CONFIG.BASE_URL ?? 'http://localhost:8000'}${issueEndpoint}`,
      reservationId,
      method: 'POST',
    });

    const issueResponse = await apiClient.post(issueEndpoint);
    
    console.log('[issueCard] API response:', {
      status: issueResponse.status,
      hasSuccess: issueResponse.data?.success,
      hasData: !!issueResponse.data?.data,
    });
    
    // Handle both wrapped and unwrapped responses
    const cardData = issueResponse.data?.success === true && issueResponse.data?.data
      ? issueResponse.data.data
      : issueResponse.data?.data ?? issueResponse.data;
    
    if (!cardData) {
      throw new Error(issueResponse.data?.error || issueResponse.data?.message || 'Failed to issue card - no card data returned');
    }
    
    console.log('[issueCard] Card data retrieved successfully', {
      card_no: cardData?.cardNo,
      has_card_data: !!cardData?.cardData,
      has_hotel_info: !!cardData?.hotelInfo
    });

    // Step C: Send cardData and hotelInfo to hardware service
    if (cardData?.cardData) {
      console.log('[issueCard] Triggering hardware card issuance', {
        card_data_length: cardData.cardData.length,
        has_hotel_info: !!cardData.hotelInfo
      });

      try {
        // Issue card via hardware service with cardData and hotelInfo
        const hardwareResult = await issueHardwareCard(cardData.cardData, cardData.hotelInfo);
        
        console.log('[issueCard] Hardware card issued successfully', {
          card_id: hardwareResult?.data?.cardId,
          card_type: hardwareResult?.data?.cardType
        });

        // Merge hardware result with API result
        return {
          success: true,
          data: {
            ...cardData,
            validation: validationResult,
            hardware: {
              success: true,
              cardId: hardwareResult?.data?.cardId,
              cardType: hardwareResult?.data?.cardType,
              encodedAt: hardwareResult?.data?.encodedAt
            }
          }
        };
      } catch (hardwareError) {
        console.error('[issueCard] Hardware card issuance failed', {
          error: hardwareError.message,
          errorType: hardwareError.name,
          stack: hardwareError.stack,
        });

        // Determine error type for user-friendly messages
        const errorMessage = hardwareError.message || 'Unknown hardware error';
        let userFriendlyMessage = 'Card data retrieved but physical card issuance failed';
        
        if (errorMessage.toLowerCase().includes('dispenser') || errorMessage.toLowerCase().includes('dispense')) {
          userFriendlyMessage = 'Card dispenser error: Unable to dispense the card. Please contact staff for assistance.';
        } else if (errorMessage.toLowerCase().includes('encoder') || errorMessage.toLowerCase().includes('encode')) {
          userFriendlyMessage = 'Card encoder error: Unable to encode the card. Please contact staff for assistance.';
        } else if (errorMessage.toLowerCase().includes('timeout')) {
          userFriendlyMessage = 'Card processing timeout: The card dispenser did not respond in time. Please try again or contact staff.';
        } else if (errorMessage.toLowerCase().includes('connection') || errorMessage.toLowerCase().includes('network')) {
          userFriendlyMessage = 'Hardware connection error: Unable to connect to card dispenser. Please contact staff.';
        }

        // Return API result but include hardware error with user-friendly message
        return {
          success: false, // Mark as failed since hardware failed
          data: {
            ...cardData,
            validation: validationResult,
            hardware: {
              success: false,
              error: hardwareError.message,
              userFriendlyMessage: userFriendlyMessage,
              errorType: errorMessage.toLowerCase().includes('dispenser') ? 'dispenser' : 
                        errorMessage.toLowerCase().includes('encoder') ? 'encoder' : 'unknown',
            }
          },
          error: userFriendlyMessage,
        };
      }
    } else {
      console.warn('[issueCard] No card data in response, skipping hardware issuance');
      return {
        success: true,
        data: {
          ...cardData,
          validation: validationResult
        }
      };
    }
  } catch (error) {
    const baseURL = apiClient.defaults?.baseURL ?? API_CONFIG.BASE_URL ?? 'http://localhost:8000';
    
    // Check if this is a CORS error
    const isCorsError = !error.response && (
      error.message?.includes('CORS') ||
      error.message?.includes('Access-Control') ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('blocked by CORS policy')
    );
    
    console.error('[issueCard] Error calling API:', {
      propertyId: finalPropertyId,
      organizationId: finalOrganizationId,
      reservationId,
      error: error.message,
      errorCode: error.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      isCorsError
    });

    // Handle CORS errors with a more helpful message
    if (isCorsError) {
      throw new Error('Connection error: Unable to reach the server. Please check that Kong is running and CORS is properly configured.');
    }

    // Display the error message from the API response
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.response?.statusText ??
                   error?.message ??
                   'Failed to issue card';
    throw new Error(message);
  }
};

/**
 * Validate lost card guest (legacy function - kept for backward compatibility)
 * @deprecated Use validateLostCard instead
 */
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

// Legacy exports for backward compatibility
export const regenerateLostCard = issueCard;
export const getLostCardRequest = validateLostCard;
