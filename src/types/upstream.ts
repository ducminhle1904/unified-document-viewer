export interface SalesDocument {
  dealId: string;
  documentId: string;
  documentType: string;
  signedAt: string;
  buyerName: string;
  fileName: string;
  duplicateKey?: string;
}

export interface ServiceDocument {
  repairOrderNumber: string;
  attachmentId: string;
  category: string;
  createdAt: string;
  customer: {
    displayName: string;
  };
  description: string;
  duplicateKey?: string;
}
