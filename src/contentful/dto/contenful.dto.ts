export interface ContentfulProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentfulFields {
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: string | number;
  currency: string;
  stock: string | number;
}

interface ContentfulSys {
  id: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentfulItem {
  fields: ContentfulFields;
  sys: ContentfulSys;
}

export interface ContentfulResponse {
  items: ContentfulItem[];
}
