import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const UPDATES_FILE = path.join(DATA_DIR, 'updates.json');

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  website_url: string;
  icon_url: string;
  icon: string;
  color: string;
}

export interface Update {
  id: number;
  product_id: number;
  product_slug: string;
  product_name: string;
  product_color: string;
  title: string;
  summary: string | null;
  content: string | null;
  source_url: string | null;
  source_type: string;
  published_at: string | null;
  fetched_at: string;
  is_new: boolean;
}

export function getProducts(): Product[] {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getUpdates(limit?: number): Update[] {
  if (!fs.existsSync(UPDATES_FILE)) {
    return [];
  }
  const data = fs.readFileSync(UPDATES_FILE, 'utf-8');
  const updates: Update[] = JSON.parse(data);
  
  // 按发布时间排序（新的在前）
  const sorted = updates.sort((a, b) => {
    const dateA = a.published_at || a.fetched_at;
    const dateB = b.published_at || b.fetched_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getProductBySlug(slug: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.slug === slug);
}

export function getUpdatesByProduct(slug: string): Update[] {
  const updates = getUpdates();
  return updates.filter(u => u.product_slug === slug);
}

export function getProductUpdateCount(slug: string): number {
  const updates = getUpdates();
  return updates.filter(u => u.product_slug === slug).length;
}

export function getProductLastUpdated(slug: string): string | null {
  const updates = getUpdatesByProduct(slug);
  if (updates.length === 0) return null;
  return updates[0].published_at || updates[0].fetched_at;
}
