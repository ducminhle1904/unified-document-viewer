# API Contract

## `GET /api/vehicles/:vin/documents`

Returns a consolidated list of documents related to one vehicle.

### Path Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `vin` | string | yes | 17-character Vehicle Identification Number. VINs are normalized to uppercase. |

### Successful Response

Status: `200`

```json
{
  "requestId": "4f3779f4-5a3d-4cb6-8a70-fb65798c0792",
  "vin": "1HGCM82633A004352",
  "status": "complete",
  "documents": [
    {
      "id": "service:service-7001",
      "externalId": "service-7001",
      "source": "SERVICE_SYSTEM",
      "type": "SERVICE_INVOICE",
      "title": "12 month service invoice",
      "documentDate": "2026-01-15T09:10:00.000Z",
      "customerName": "Alex Morgan",
      "metadata": {
        "repairOrderNumber": "RO-7001",
        "duplicateKey": null
      }
    }
  ],
  "warnings": [],
  "upstream": [
    {
      "source": "SALES_SYSTEM",
      "status": "success",
      "latencyMs": 15,
      "documentCount": 2
    },
    {
      "source": "SERVICE_SYSTEM",
      "status": "success",
      "latencyMs": 20,
      "documentCount": 2
    }
  ]
}
```

### Status Values

- `complete`: both mocked upstream systems succeeded.
- `partial`: one upstream system failed and the other returned usable results.
- `failed`: both upstream systems failed.

### Error Responses

Invalid VIN:

```json
{
  "code": "INVALID_VIN",
  "message": "VIN must be 17 characters and use allowed VIN characters."
}
```

Both upstream systems unavailable:

```json
{
  "code": "UPSTREAM_DOCUMENT_SYSTEMS_UNAVAILABLE",
  "message": "Both upstream document systems failed.",
  "requestId": "4f3779f4-5a3d-4cb6-8a70-fb65798c0792",
  "vin": "1HGCM82633A004352",
  "status": "failed",
  "documents": [],
  "warnings": [
    {
      "code": "UPSTREAM_ERROR",
      "source": "SALES_SYSTEM",
      "message": "Sales System API failed"
    }
  ],
  "upstream": []
}
```

### Behavioral Guarantees

- The backend calls Sales and Service systems in parallel.
- Each document includes a `source` field.
- Results are sorted by `documentDate` descending.
- Duplicate documents are removed by normalized document ID.
- Search audit metadata is persisted for complete, partial, and failed searches.
- Controlled errors are returned instead of stack traces.

### Demo VINs

- `1HGCM82633A004352`: complete response with Sales and Service documents.
- `2HGCM82633A004353`: complete response with no documents.
- `1HGCM82633A00435S`: partial response because Sales fails and Service succeeds.
- `1HGCM82633A00435V`: partial response because Service fails and Sales succeeds.
- `1HGCM82633A00435X`: failed response because both upstream systems fail.
