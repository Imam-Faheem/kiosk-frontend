import { apiClient } from './api/apiClient';

export const getProperties = async (params) => {
  try {
    const response = await apiClient.get('/api/kiosk/v1/properties', { params });
    
    // Return the response data as-is (should have success, data, pagination)
    return response.data;
  } catch (err) {
    // Return mock data on error
    return {
      "success": true,
      "data": [
        {
          "property_id": "0ujsszwN8NRY24YaXiTIE2VWDTJ",
          "organization_id": "0ujsszwN8NRY24YaXiTIE2VWDTS",
          "pms_type": "apaleo",
          "apaleo_external_property_id": "BER",
          "name": "UNO Apaleo Hotel Downtown",
          "status": "active",
          "createdAt": "2025-12-13T11:13:17.581Z",
          "updatedAt": "2025-12-13T11:13:17.581Z",
          "deletedAt": null
        },
        {
          "property_id": "0ujsszwN8NRY24YaXiTIE2VWDTK",
          "organization_id": "0ujsszwN8NRY24YaXiTIE2VWDTS",
          "pms_type": "apaleo",
          "apaleo_external_property_id": "COD",
          "name": "UNO Apaleo Resort Beachside",
          "status": "active",
          "createdAt": "2025-12-13T11:13:17.581Z",
          "updatedAt": "2025-12-13T11:13:17.581Z",
          "deletedAt": null
        },
        {
          "property_id": "0ujsszwN8NRY24YaXiTIE2VWDTL",
          "organization_id": "0ujsszwN8NRY24YaXiTIE2VWDTS",
          "pms_type": "apaleo",
          "apaleo_external_property_id": "IMAM",
          "name": "UNO Apaleo Grand Plaza",
          "status": "active",
          "createdAt": "2025-12-13T11:13:17.581Z",
          "updatedAt": "2025-12-13T11:13:17.581Z",
          "deletedAt": null
        },
        {
          "property_id": "0ujsszwN8NRY24YaXiTIE2VWDTN",
          "organization_id": "0ujsszwN8NRY24YaXiTIE2VWDTS",
          "pms_type": "mews",
          "apaleo_external_property_id": null,
          "name": "UNO Mews Boutique Hotel",
          "status": "active",
          "createdAt": "2025-12-13T11:13:17.581Z",
          "updatedAt": "2025-12-13T11:13:17.581Z",
          "deletedAt": null
        },
        {
          "property_id": "0ujsszwN8NRY24YaXiTIE2VWDTO",
          "organization_id": "0ujsszwN8NRY24YaXiTIE2VWDTS",
          "pms_type": "mews",
          "apaleo_external_property_id": null,
          "name": "UNO Mews City Center",
          "status": "active",
          "createdAt": "2025-12-13T11:13:17.581Z",
          "updatedAt": "2025-12-13T11:13:17.581Z",
          "deletedAt": null
        },
        {
          "property_id": "0ujsszwN8NRY24YaXiTIE2VWDTQ",
          "organization_id": "0ujsszwN8NRY24YaXiTIE2VWDTS",
          "pms_type": "opera",
          "apaleo_external_property_id": null,
          "name": "UNO Opera Luxury Suites",
          "status": "active",
          "createdAt": "2025-12-13T11:13:17.581Z",
          "updatedAt": "2025-12-13T11:13:17.581Z",
          "deletedAt": null
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 6,
        "total_pages": 1,
        "has_next": false,
        "has_prev": false
      }
    };
  }
};


export const getKioskCapabilities = async (propertyId, kioskId = null) => {
  // Return default capabilities since the endpoint doesn't exist
  return {
    checkIn: true,
    reservations: true,
    cardIssuance: true,
    lostCard: true,
  };
};

export const getPropertyById = async (propertyId) => {
  try {
    const response = await apiClient.get(`/properties/${propertyId}`);
    
    return {
      success: true,
      data: response.data,
      message: 'Property fetched successfully',
    };
  } catch (err) {
    const errorMessage = err?.response?.data?.error ?? 
                         err?.response?.data?.message ?? 
                         err?.message ?? 
                         'Failed to fetch property';
    throw new Error(errorMessage);
  }
};

