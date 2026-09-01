export interface College {
  _id: string;
  name: string;
  shortName?: string;
  state: string;
  city: string;
  country: string;
  university?: string;
  type: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
