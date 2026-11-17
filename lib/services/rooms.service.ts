import { createMockListings } from "@/data/rooms.mock";
import { toISODate } from "@/lib/padel/dates";
import { validateNewListing } from "@/lib/rooms/rooms";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import { MAX_ROOM_PHOTOS, type RoomListing, type RoomService, type RoomType } from "@/types/rooms";
import { hasSession } from "./user.service";

const LISTINGS_KEY = "room-listings";
const PHOTO_BUCKET = "room-photos";

function load(): RoomListing[] {
  return readJSON<RoomListing[] | null>(LISTINGS_KEY, null) ?? createMockListings(new Date());
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the photo."));
    reader.readAsDataURL(blob);
  });
}

/** Demo mode: listings live in this browser (localStorage), photos as data URLs. */
const localRoomService: RoomService = {
  async listListings() {
    return load();
  },
  async getListing(id) {
    return load().find((l) => l.id === id) ?? null;
  },
  async createListing(input, photos, userId) {
    const error = validateNewListing(input, toISODate(new Date()));
    if (error) throw new Error(error);
    const listing: RoomListing = {
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
      id: crypto.randomUUID(),
      photos: await Promise.all(photos.slice(0, MAX_ROOM_PHOTOS).map(toDataUrl)),
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    writeJSON(LISTINGS_KEY, [listing, ...load()]);
    return listing;
  },
  async deleteListing(id, userId) {
    const listings = load();
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    if (listing.createdBy !== userId) throw new Error("Only the person who posted it can delete.");
    writeJSON(
      LISTINGS_KEY,
      listings.filter((l) => l.id !== id),
    );
  },
  onChange() {
    return () => {};
  },
};

/** One row of `room_listings` (see supabase/migrations). */
interface ListingRow {
  id: string;
  kind: RoomListing["kind"];
  title: string;
  room_type: RoomType;
  area: string;
  rent: number;
  bills_included: boolean;
  available_from: string;
  available_until: string | null;
  description: string;
  photos: string[];
  created_by: string;
  created_at: string;
}

function rowToListing(row: ListingRow): RoomListing {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    roomType: row.room_type,
    area: row.area,
    rent: row.rent,
    billsIncluded: row.bills_included,
    availableFrom: row.available_from,
    availableUntil: row.available_until ?? "",
    description: row.description,
    photos: row.photos,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function fail(error: { message: string }): never {
  throw new Error(error.message);
}

/** Accounts mode: shared listings in Supabase, photos in the `room-photos` bucket. */
const supabaseRoomService: RoomService = {
  async listListings() {
    if (!(await hasSession())) return [];
    const { data, error } = await getSupabase()
      .from("room_listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) fail(error);
    return (data as ListingRow[]).map(rowToListing);
  },
  async getListing(id) {
    const { data, error } = await getSupabase()
      .from("room_listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error);
    return data ? rowToListing(data as ListingRow) : null;
  },
  async createListing(input, photos, userId) {
    const problem = validateNewListing(input, toISODate(new Date()));
    if (problem) throw new Error(problem);

    // Photos first: <user id>/<listing id>/<n>.jpg, so deleting the listing can remove the folder.
    const id = crypto.randomUUID();
    const bucket = getSupabase().storage.from(PHOTO_BUCKET);
    const urls: string[] = [];
    for (const [i, photo] of photos.slice(0, MAX_ROOM_PHOTOS).entries()) {
      const path = `${userId}/${id}/${i + 1}.jpg`;
      const { error } = await bucket.upload(path, photo, { contentType: "image/jpeg" });
      if (error) throw new Error("Could not upload a photo. Please try smaller images.");
      urls.push(bucket.getPublicUrl(path).data.publicUrl);
    }

    const { data, error } = await getSupabase()
      .from("room_listings")
      .insert({
        id,
        kind: input.kind,
        title: input.title.trim(),
        room_type: input.roomType,
        area: input.area,
        rent: input.rent,
        bills_included: input.billsIncluded,
        available_from: input.availableFrom,
        available_until: input.availableUntil || null,
        description: input.description.trim(),
        photos: urls,
        created_by: userId,
      })
      .select("*")
      .single();
    if (error) {
      await bucket.remove(urls.map((_, i) => `${userId}/${id}/${i + 1}.jpg`));
      fail(error);
    }
    return rowToListing(data as ListingRow);
  },
  async deleteListing(id, userId) {
    const { error } = await getSupabase()
      .from("room_listings")
      .delete()
      .eq("id", id)
      .eq("created_by", userId);
    if (error) fail(error);
    const bucket = getSupabase().storage.from(PHOTO_BUCKET);
    const { data: files } = await bucket.list(`${userId}/${id}`);
    if (files?.length) await bucket.remove(files.map((f) => `${userId}/${id}/${f.name}`));
  },
  onChange(listener) {
    const channel = getSupabase()
      .channel("rooms")
      .on("postgres_changes", { event: "*", schema: "public", table: "room_listings" }, listener)
      .subscribe();
    return () => void getSupabase().removeChannel(channel);
  },
};

export const roomService: RoomService =
  AUTH_MODE === "accounts" ? supabaseRoomService : localRoomService;
