# Required API Endpoints

This document lists additional API endpoints or modifications to existing ones that are required for the mobile application functionality based on the agreed UI flow.

## Items API

### Get Item by Barcode
- **Endpoint**: `GET /v1/items/byBarcode/:code`
- **Auth Required**: Yes (Assumed, as most item-related endpoints require auth)
- **Description**: Retrieves the details of an item by scanning its barcode. This is essential for the barcode scanning flow to quickly find an item.
- **Parameters**:
  - `code`: The barcode string.
- **Response (Success - Item Found)**:
  ```json
  {
    "item": {
      "itemId": "string",
      "name": "string",
      "description": "string",
      "categoryId": "string",
      "attributes": {
        "key": "value"
      },
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
      // Include other relevant item fields as per GET /v1/items/:id
    }
  }
  ```
- **Response (Error - Item Not Found - HTTP 404)**:
  ```json
  {
    "error": "Item not found",
    "message": "No item found with the provided barcode."
  }
  ```
- **Notes**:
  - This endpoint will be used in the "Scan" tab. If an item is found, the app will navigate to its Item Detail screen.
  - If not found, the app will prompt the user if they want to create a new item.
