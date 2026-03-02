import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOwnership } from "../services/ownership.services";
import { Ownership } from "../types/ownership.types";

export function useDeleteOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ownershipId: string) => {
      const { error } = await deleteOwnership(ownershipId);
      if (error) throw new Error(error);
    }
  })
}