// Web-only storage using localStorage

export type StorageItemValue =
  | string
  | number
  | boolean
  | null
  | StorageItemValue[]
  | { [key: string]: StorageItemValue };

class Storage {
  async getItem<Fallback extends StorageItemValue>(
    key: string,
    fallback: Fallback
  ): Promise<Fallback | null> {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as Fallback;
    } catch (e) {
      console.warn(`[storage] getItem(${key}) failed`, e);
      return fallback;
    }
  }

  async setItem<Value extends StorageItemValue>(
    key: string,
    value: Value
  ): Promise<boolean> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[storage] setItem(${key}) failed`, e);
      return false;
    }
  }

  async removeItem(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[storage] removeItem(${key}) failed`, e);
      return false;
    }
  }
}

export const storage = new Storage();
