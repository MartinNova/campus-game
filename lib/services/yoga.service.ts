import { YOGA_CLASSES } from "@/data/yoga.mock";
import type { YogaService } from "@/types/yoga";

/** Static implementation. Swap for a Supabase version later; the UI stays the same. */
export const yogaService: YogaService = {
  async listClasses() {
    return YOGA_CLASSES;
  },
};
