import { InventoryApparelSize } from '../enums/inventory.enum';

export interface Inventory {
  id: string;
  title: string;
  description: string;
  code: string;
  size: InventoryApparelSize;
  quantity: number;
  price: number;
  vendorId: string;
  editedBy?: string;
}
