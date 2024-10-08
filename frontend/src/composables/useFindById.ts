import { Ref } from 'vue';

export function useFindById<T extends { id: number }>(items: Ref<T[]>) {
  const findById = (id: number, key: keyof T) => {
    const item = items.value.find((item) => item.id === id);
    return item ? item[key] || "Non spécifié" : "Non spécifié";
  };

  return { findById };
}
