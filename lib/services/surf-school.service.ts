import { SURF_SCHOOLS } from "@/data/surf-schools";
import type { SurfSchoolService } from "@/types/surf";

/** Static implementation. Swap for a Supabase version later; the UI stays the same. */
export const surfSchoolService: SurfSchoolService = {
  async listSchools(spotId) {
    return spotId ? SURF_SCHOOLS.filter((s) => s.spotId === spotId) : SURF_SCHOOLS;
  },
};
