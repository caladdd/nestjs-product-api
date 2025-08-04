import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  ContentfulItem,
  ContentfulProduct,
  ContentfulResponse,
} from './dto/contenful.dto';

@Injectable()
export class ContentfulService {
  private readonly spaceId = process.env.CONTENTFUL_SPACE_ID;
  private readonly accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  private readonly environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';
  private readonly contentType =
    process.env.CONTENTFUL_CONTENT_TYPE || 'product';

  async fetchProducts(): Promise<ContentfulProduct[]> {
    const url = `https://cdn.contentful.com/spaces/${this.spaceId}/environments/${this.environment}/entries`;
    const res = await axios.get<ContentfulResponse>(url, {
      params: {
        access_token: this.accessToken,
        content_type: this.contentType,
      },
    });

    return res.data.items.map((item: ContentfulItem) => {
      const { fields } = item;
      const { sys } = item;

      return {
        id: String(sys.id),
        sku: fields.sku,
        name: fields.name,
        brand: fields.brand,
        model: fields.model,
        category: fields.category,
        color: fields.color,
        price: parseFloat(String(fields.price ?? 0)),
        currency: fields.currency,
        stock: parseInt(String(fields.stock ?? 0), 10),
        locale: sys.locale,
        createdAt: sys.createdAt,
        updatedAt: sys.updatedAt,
      };
    });
  }
}
