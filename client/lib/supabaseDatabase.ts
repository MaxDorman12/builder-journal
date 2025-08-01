// Supabase Database service - replaces Firebase CloudStorage
import { supabase } from './supabase'
import { JournalEntry, MapPin, WishlistItem } from '@shared/api'

export class SupabaseDatabase {
  // Journal Entries
  static async saveJournalEntry(entry: JournalEntry): Promise<void> {
    console.log("💾 Saving journal entry to Supabase Database:", {
      id: entry.id,
      title: entry.title,
      imagesCount: entry.images?.length || 0,
      videosCount: entry.videos?.length || 0,
    });

    try {
      const { error } = await supabase
        .from('journal_entries')
        .upsert({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          images: entry.images || [],
          videos: entry.videos || [],
          location_name: entry.locationName,
          latitude: entry.latitude,
          longitude: entry.longitude,
          created_at: entry.createdAt,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("❌ Supabase Database save error:", error);
        throw error;
      }

      console.log("✅ Journal entry saved to Supabase Database successfully");
    } catch (error) {
      console.error("❌ Failed to save journal entry to Supabase:", error);
      throw error;
    }
  }

  static async getJournalEntries(): Promise<JournalEntry[]> {
    console.log("📖 Fetching journal entries from Supabase Database...");
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Failed to fetch journal entries:", error.message || error);

        // Check if it's a missing table error
        if (error.message?.includes('relation "journal_entries" does not exist') ||
            error.code === '42P01') {
          console.error("💡 Database tables not created yet. Please run the SQL migration.");
          return []; // Return empty array for missing tables
        }

        throw new Error(`Failed to fetch journal entries: ${error.message || error}`);
      }

      const entries: JournalEntry[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        images: row.images || [],
        videos: row.videos || [],
        locationName: row.location_name,
        latitude: row.latitude,
        longitude: row.longitude,
        createdAt: row.created_at
      }));

      console.log(`✅ Loaded ${entries.length} journal entries from Supabase`);
      return entries;
    } catch (error) {
      console.error("❌ Failed to get journal entries:", error);
      return [];
    }
  }

  static async deleteJournalEntry(id: string): Promise<void> {
    console.log("🗑️ Deleting journal entry from Supabase:", id);
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("❌ Failed to delete journal entry:", error);
        throw error;
      }

      console.log("✅ Journal entry deleted from Supabase");
    } catch (error) {
      console.error("❌ Failed to delete journal entry:", error);
      throw error;
    }
  }

  // Map Pins
  static async saveMapPin(pin: MapPin): Promise<void> {
    console.log("📍 Saving map pin to Supabase Database:", pin.title);
    
    try {
      const { error } = await supabase
        .from('map_pins')
        .upsert({
          id: pin.id,
          title: pin.title,
          description: pin.description,
          latitude: pin.latitude,
          longitude: pin.longitude,
          type: pin.type,
          created_at: pin.createdAt || new Date().toISOString()
        });

      if (error) {
        console.error("❌ Failed to save map pin:", error);
        throw error;
      }

      console.log("✅ Map pin saved to Supabase Database");
    } catch (error) {
      console.error("❌ Failed to save map pin:", error);
      throw error;
    }
  }

  static async getMapPins(): Promise<MapPin[]> {
    console.log("🗺️ Fetching map pins from Supabase Database...");
    
    try {
      const { data, error } = await supabase
        .from('map_pins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Failed to fetch map pins:", error.message || error);
        throw new Error(`Failed to fetch map pins: ${error.message || error}`);
      }

      const pins: MapPin[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        latitude: row.latitude,
        longitude: row.longitude,
        type: row.type,
        createdAt: row.created_at
      }));

      console.log(`✅ Loaded ${pins.length} map pins from Supabase`);
      return pins;
    } catch (error) {
      console.error("❌ Failed to get map pins:", error);
      return [];
    }
  }

  static async deleteMapPin(id: string): Promise<void> {
    console.log("🗑️ Deleting map pin from Supabase:", id);
    
    try {
      const { error } = await supabase
        .from('map_pins')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("❌ Failed to delete map pin:", error);
        throw error;
      }

      console.log("✅ Map pin deleted from Supabase");
    } catch (error) {
      console.error("❌ Failed to delete map pin:", error);
      throw error;
    }
  }

  // Wishlist Items
  static async saveWishlistItem(item: WishlistItem): Promise<void> {
    console.log("📝 Saving wishlist item to Supabase Database:", item.title);
    
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .upsert({
          id: item.id,
          title: item.title,
          description: item.description,
          priority: item.priority,
          completed: item.completed,
          created_at: item.createdAt || new Date().toISOString()
        });

      if (error) {
        console.error("❌ Failed to save wishlist item:", error);
        throw error;
      }

      console.log("✅ Wishlist item saved to Supabase Database");
    } catch (error) {
      console.error("❌ Failed to save wishlist item:", error);
      throw error;
    }
  }

  static async getWishlistItems(): Promise<WishlistItem[]> {
    console.log("📋 Fetching wishlist items from Supabase Database...");
    
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Failed to fetch wishlist items:", error);
        throw error;
      }

      const items: WishlistItem[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        priority: row.priority,
        completed: row.completed,
        createdAt: row.created_at
      }));

      console.log(`✅ Loaded ${items.length} wishlist items from Supabase`);
      return items;
    } catch (error) {
      console.error("❌ Failed to get wishlist items:", error);
      return [];
    }
  }

  static async deleteWishlistItem(id: string): Promise<void> {
    console.log("🗑️ Deleting wishlist item from Supabase:", id);
    
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("❌ Failed to delete wishlist item:", error);
        throw error;
      }

      console.log("✅ Wishlist item deleted from Supabase");
    } catch (error) {
      console.error("❌ Failed to delete wishlist item:", error);
      throw error;
    }
  }

  // Charlie Data
  static async setCharlieData(data: { image: string; description: string }): Promise<void> {
    console.log("🐕 Saving Charlie data to Supabase Database:", {
      hasImage: !!data.image,
      imageLength: data.image?.length || 0,
      descriptionLength: data.description?.length || 0,
    });

    try {
      const { error } = await supabase
        .from('charlie_data')
        .upsert({
          id: 'charlie',
          image: data.image,
          description: data.description,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("❌ Failed to save Charlie data:", error);
        throw error;
      }

      console.log("✅ Charlie data saved to Supabase Database successfully");
    } catch (error) {
      console.error("❌ Failed to save Charlie data:", error);
      throw error;
    }
  }

  static async getCharlieData(): Promise<{ image: string; description: string }> {
    console.log("🐕 Fetching Charlie data from Supabase Database...");
    
    try {
      const { data, error } = await supabase
        .from('charlie_data')
        .select('*')
        .eq('id', 'charlie')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("❌ Failed to fetch Charlie data:", error.message || error);
        throw new Error(`Failed to fetch Charlie data: ${error.message || error}`);
      }

      if (!data) {
        console.log("📝 No Charlie data found, returning default");
        return {
          image: "",
          description: "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.\n\nWhether it's hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.\n\nHis favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾"
        };
      }

      console.log("✅ Charlie data loaded from Supabase:", {
        hasImage: !!data.image,
        imageLength: data.image?.length || 0
      });

      return {
        image: data.image || "",
        description: data.description
      };
    } catch (error) {
      console.error("❌ Failed to get Charlie data:", error);
      return {
        image: "",
        description: "Charlie's data is temporarily unavailable."
      };
    }
  }

  // Real-time subscriptions (replaces Firebase listeners)
  static subscribeToJournalEntries(callback: (entries: JournalEntry[]) => void) {
    console.log("🔄 Setting up real-time subscription for journal entries...");
    
    const subscription = supabase
      .channel('journal_entries_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'journal_entries' },
        async () => {
          console.log("🔄 Journal entries changed, fetching latest...");
          const entries = await this.getJournalEntries();
          callback(entries);
        }
      )
      .subscribe();

    return () => {
      console.log("🔇 Unsubscribing from journal entries");
      supabase.removeChannel(subscription);
    };
  }

  static subscribeToMapPins(callback: (pins: MapPin[]) => void) {
    console.log("🔄 Setting up real-time subscription for map pins...");
    
    const subscription = supabase
      .channel('map_pins_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'map_pins' },
        async () => {
          console.log("🔄 Map pins changed, fetching latest...");
          const pins = await this.getMapPins();
          callback(pins);
        }
      )
      .subscribe();

    return () => {
      console.log("🔇 Unsubscribing from map pins");
      supabase.removeChannel(subscription);
    };
  }

  static subscribeToWishlistItems(callback: (items: WishlistItem[]) => void) {
    console.log("🔄 Setting up real-time subscription for wishlist items...");
    
    const subscription = supabase
      .channel('wishlist_items_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wishlist_items' },
        async () => {
          console.log("🔄 Wishlist items changed, fetching latest...");
          const items = await this.getWishlistItems();
          callback(items);
        }
      )
      .subscribe();

    return () => {
      console.log("🔇 Unsubscribing from wishlist items");
      supabase.removeChannel(subscription);
    };
  }

  static subscribeToCharlieData(callback: (data: { image: string; description: string }) => void) {
    console.log("🔄 Setting up real-time subscription for Charlie data...");
    
    const subscription = supabase
      .channel('charlie_data_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'charlie_data' },
        async () => {
          console.log("🔄 Charlie data changed, fetching latest...");
          const data = await this.getCharlieData();
          callback(data);
        }
      )
      .subscribe();

    return () => {
      console.log("🔇 Unsubscribing from Charlie data");
      supabase.removeChannel(subscription);
    };
  }

  // Test connection
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('charlie_data')
        .select('id')
        .limit(1);

      if (error) {
        console.error("❌ Supabase connection test failed:", error);

        // Check if it's a missing table error
        if (error.message?.includes('relation "charlie_data" does not exist') ||
            error.code === '42P01') {
          return {
            success: false,
            message: "Database tables not created yet. Please run the SQL migration script in Supabase Dashboard > SQL Editor."
          };
        }

        return { success: false, message: `Connection failed: ${error.message || error}` };
      }

      console.log("✅ Supabase Database connection successful");
      return { success: true, message: "Supabase Database connected successfully" };
    } catch (error) {
      console.error("❌ Supabase connection test error:", error);
      return { success: false, message: `Connection error: ${error}` };
    }
  }
}
