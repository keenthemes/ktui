const KTElementMap = new Map();

const KTData = {
  set(element: HTMLElement, key: string, value: unknown): void {
    if (!KTElementMap.has(element)) {
      KTElementMap.set(element, new Map());
    }

    const valueMap = KTElementMap.get(element);

    valueMap.set(key, value);
  },

  get(element: HTMLElement, key: string): unknown {
    if (KTElementMap.has(element)) {
      return KTElementMap.get(element).get(key) || null;
    }

    return null;
  },

  has(element: HTMLElement, key: string): boolean {
    return KTElementMap.has(element) && KTElementMap.get(element).has(key);
  },

  remove(element: HTMLElement, key: string): void {
    if (!KTElementMap.has(element) || !KTElementMap.get(element).has(key)) {
      return;
    }

    const valueMap = KTElementMap.get(element);

    valueMap.delete(key);

    if (valueMap.size === 0) {
      KTElementMap.delete(element);
    }
  }
};

export default KTData;
