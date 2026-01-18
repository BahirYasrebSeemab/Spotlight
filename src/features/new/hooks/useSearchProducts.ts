// ========================================
// src/features/new/hooks/useSearchProducts.ts
// Hook for searching existing products
// ========================================
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../newServices/item.services';
import { useDebounce } from '@/src/shared/hooks/useDebounce';

export function useSearchProducts(params: { name?: string; brandName?: string; upc?: string }) {
  const debouncedName = useDebounce(params.name, 500);
  const debouncedBrand = useDebounce(params.brandName, 500);
  const debouncedUPC = useDebounce(params.upc, 500);

  return useQuery({
    queryKey: ['product-search', debouncedName, debouncedBrand, debouncedUPC],
    queryFn: async () => {
      const { data, error } = await searchProducts({
        name: debouncedName,
        brandName: debouncedBrand,
        upc: debouncedUPC,
      });
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!(debouncedName || debouncedBrand || debouncedUPC),
    staleTime: 30000, // 30 seconds
  });
}
