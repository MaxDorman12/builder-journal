// Supabase Database service - replaces Firebase CloudStorage
import { supabase } from "./supabase";
import { JournalEntry, MapPin, WishlistItem } from "@shared/api";

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
      const { error } = await supabase.from("journal_entries").upsert({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        images: entry.images || [],
        videos: entry.videos || [],
        location_name: entry.locationName,
        latitude: entry.latitude,
        longitude: entry.longitude,
        created_at: entry.createdAt,
        updated_at: new Date().toISOString(),
        // Include all additional fields
        date: entry.date || entry.createdAt,
        location: entry.location || entry.locationName || "",
        mood_rating: entry.moodRating || 3,
        great_for: entry.greatFor || [],
        is_busy: entry.isBusy || false,
        area_type: entry.areaType || "town",
        would_return_reason: entry.wouldReturnReason || "",
        would_return:
          entry.wouldReturn !== undefined ? entry.wouldReturn : true,
        has_free_parking_available: entry.hasFreeParkingAvailable || false,
        parking_cost: entry.parkingCost || "",
        is_paid_activity: entry.isPaidActivity || false,
        activity_cost: entry.activityCost || "",
        author: entry.author || "Family",
        likes: entry.likes || 0,
        comments: entry.comments || [],
        tags: entry.tags || [],
      });

      if (error) {
        console.error(
          "❌ Supabase Database save error:",
          error.message || error,
        );
        throw new Error(
          `Failed to save journal entry: ${error.message || error}`,
        );
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
      // Add timeout and retry logic for network issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error(
          "❌ Failed to fetch journal entries:",
          error.message || error,
        );

        // Check if it's a missing table error
        if (
          error.message?.includes(
            'relation "journal_entries" does not exist',
          ) ||
          error.code === "42P01"
        ) {
          console.error(
            "💡 Database tables not created yet. Please run the SQL migration.",
          );
          return []; // Return empty array for missing tables
        }

        throw new Error(
          `Failed to fetch journal entries: ${error.message || error}`,
        );
      }

      const entries: JournalEntry[] = (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        images: row.images || [],
        videos: row.videos || [],
        locationName: row.location_name,
        latitude: row.latitude,
        longitude: row.longitude,
        createdAt: row.created_at,
        // Add default values for fields that might be missing
        date: row.created_at || new Date().toISOString(),
        location: row.location_name || "",
        moodRating: row.mood_rating || 3,
        greatFor: row.great_for || [],
        isBusy: row.is_busy || false,
        areaType: row.area_type || "town",
        wouldReturnReason: row.would_return_reason || "",
        wouldReturn: row.would_return || true,
        hasFreeParkingAvailable: row.has_free_parking_available || false,
        parkingCost: row.parking_cost || "",
        isPaidActivity: row.is_paid_activity || false,
        activityCost: row.activity_cost || "",
        author: row.author || "Family",
        likes: row.likes || 0,
        comments: row.comments || [],
        tags: row.tags || [],
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      }));

      console.log(`✅ Loaded ${entries.length} journal entries from Supabase`);
      return entries;
    } catch (error) {
      console.error("❌ Failed to get journal entries:", error);

      // Check if it's a network connectivity issue
      if (error instanceof Error) {
        if (
          error.message.includes("Failed to fetch") ||
          error.name === "AbortError" ||
          error.message.includes("NetworkError") ||
          error.message.includes("fetch")
        ) {
          console.error(
            "🌐 Network connectivity issue detected. Possible causes:",
          );
          console.error("  - Internet connection lost");
          console.error("  - Supabase service temporarily unavailable");
          console.error("  - Request timeout (>10 seconds)");
          console.error("  - CORS or firewall blocking request");

          // Return empty array for network issues to allow app to continue
          return [];
        }
      }

      // For other errors, throw to propagate to HybridStorage
      throw new Error(
        `Failed to get journal entries: ${error.message || error}`,
      );
    }
  }

  static async deleteJournalEntry(id: string): Promise<void> {
    console.log("���️ Deleting journal entry from Supabase:", id);

    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

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
      const { error } = await supabase.from("map_pins").upsert({
        id: pin.id,
        title: pin.title,
        description: pin.description,
        latitude: pin.lat,
        longitude: pin.lng,
        type: "visited", // Default value for now
        mood_rating: pin.moodRating,
        journal_entry_id: pin.journalEntryId || null,
        images: JSON.stringify(pin.images || []),
        created_at: pin.visitDate || new Date().toISOString(),
      });

      if (error) {
        console.error("❌ Failed to save map pin:", error.message || error);
        throw new Error(`Failed to save map pin: ${error.message || error}`);
      }

      console.log("✅ Map pin saved to Supabase Database");
    } catch (error) {
      console.error("❌ Failed to save map pin:", error.message || error);
      throw new Error(`Failed to save map pin: ${error.message || error}`);
    }
  }

  static async deleteMapPin(id: string): Promise<void> {
    console.log("🗑️ Deleting map pin from Supabase:", id);

    try {
      const { error } = await supabase.from("map_pins").delete().eq("id", id);

      if (error) {
        console.error("❌ Failed to delete map pin:", error.message || error);
        throw new Error(`Failed to delete map pin: ${error.message || error}`);
      }

      console.log("�� Map pin deleted from Supabase Database");
    } catch (error) {
      console.error("❌ Failed to delete map pin:", error.message || error);
      throw new Error(`Failed to delete map pin: ${error.message || error}`);
    }
  }

  static async getMapPins(): Promise<MapPin[]> {
    console.log("🗺️ Fetching map pins from Supabase Database...");

    try {
      const { data, error } = await supabase
        .from("map_pins")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Failed to fetch map pins:", error.message || error);

        // Check if it's a missing table error
        if (
          error.message?.includes('relation "map_pins" does not exist') ||
          error.code === "42P01"
        ) {
          console.error(
            "💡 Database tables not created yet. Please run the SQL migration.",
          );
          return []; // Return empty array for missing tables
        }

        throw new Error(`Failed to fetch map pins: ${error.message || error}`);
      }

      const pins: MapPin[] = (data || []).map((row) => ({
        id: row.id,
        lat: row.latitude,
        lng: row.longitude,
        title: row.title,
        description: row.description || "",
        moodRating: row.mood_rating || 5,
        journalEntryId: row.journal_entry_id || undefined,
        visitDate: row.created_at,
        images: row.images ? JSON.parse(row.images) : [],
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
      const { error } = await supabase.from("map_pins").delete().eq("id", id);

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
      // Add timeout for network issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const { error } = await supabase
        .from("wishlist_items")
        .upsert({
          id: item.id,
          title: item.title,
          description: item.description,
          priority: item.priority,
          completed: item.completed,
          created_at: item.createdAt || new Date().toISOString(),
        })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error(
          "❌ Failed to save wishlist item:",
          error.message || error,
        );

        // Check if it's a network connectivity issue
        if (error.message?.includes('Failed to fetch') ||
            error.message?.includes('NetworkError') ||
            error.message?.includes('fetch') ||
            error.code === 'PGRST301') {
          console.error('🌐 Network connectivity issue during wishlist save:');
          console.error('  - Internet connection lost');
          console.error('  - Supabase service temporarily unavailable');
          console.error('  - Request timeout (>10 seconds)');
          console.error('  - CORS or firewall blocking request');

          // Don't throw error for network issues during sync to allow app to continue
          console.log('⚠️ Skipping wishlist item save due to network issue');
          return;
        }

        throw new Error(
          `Failed to save wishlist item: ${error.message || error}`,
        );
      }

      console.log("✅ Wishlist item saved to Supabase Database");
    } catch (error) {
      console.error("❌ Failed to save wishlist item:", error);

      // Check if it's a network connectivity issue (AbortError from timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('🌐 Network timeout during wishlist save (>10 seconds)');
        console.log('⚠️ Skipping wishlist item save due to timeout');
        return;
      }

      throw error;
    }
  }

  static async getWishlistItems(): Promise<WishlistItem[]> {
    console.log("📋 Fetching wishlist items from Supabase Database...");

    try {
      // Add timeout for network issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .order("created_at", { ascending: false })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error("❌ Failed to fetch wishlist items:", error);
        throw error;
      }

      const items: WishlistItem[] = (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        priority: row.priority,
        completed: row.completed,
        createdAt: row.created_at,
      }));

      console.log(`✅ Loaded ${items.length} wishlist items from Supabase`);
      return items;
    } catch (error) {
      console.error("❌ Failed to get wishlist items:", error);

      // Check if it's a network connectivity issue
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') ||
            error.name === 'AbortError' ||
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          console.error('🌐 Network connectivity issue detected for wishlist. Possible causes:');
          console.error('  - Internet connection lost');
          console.error('  - Supabase service temporarily unavailable');
          console.error('  - Request timeout (>10 seconds)');
          console.error('  - CORS or firewall blocking request');

          // Return empty array for network issues to allow app to continue
          return [];
        }
      }

      // For other errors, throw to propagate to HybridStorage
      throw new Error(`Failed to get wishlist items: ${error.message || error}`);
    }
  }

  static async deleteWishlistItem(id: string): Promise<void> {
    console.log("🗑️ Deleting wishlist item from Supabase:", id);

    try {
      // Add timeout for network issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", id)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error("❌ Failed to delete wishlist item:", error);
        throw error;
      }

      console.log("✅ Wishlist item deleted from Supabase");
    } catch (error) {
      console.error("❌ Failed to delete wishlist item:", error);

      // Check if it's a network connectivity issue
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') ||
            error.name === 'AbortError' ||
            error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          console.error('🌐 Network connectivity issue during wishlist deletion');
          console.error('  - Internet connection lost');
          console.error('  - Supabase service temporarily unavailable');
          console.error('  - Request timeout (>10 seconds)');
          console.error('  - CORS or firewall blocking request');

          // Don't throw error for network issues to allow app to continue
          console.log('⚠️ Skipping wishlist item deletion due to network issue');
          return;
        }
      }

      throw error;
    }
  }

  // Charlie Data
  static async setCharlieData(data: {
    image: string;
    description: string;
  }): Promise<void> {
    console.log("🐕 Saving Charlie data to Supabase Database:", {
      hasImage: !!data.image,
      imageLength: data.image?.length || 0,
      descriptionLength: data.description?.length || 0,
    });

    try {
      const { error } = await supabase.from("charlie_data").upsert({
        id: "charlie",
        image: data.image,
        description: data.description,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error(
          "❌ Failed to save Charlie data:",
          error.message || error,
        );
        throw new Error(
          `Failed to save Charlie data: ${error.message || error}`,
        );
      }

      console.log("✅ Charlie data saved to Supabase Database successfully");
    } catch (error) {
      console.error("❌ Failed to save Charlie data:", error);
      throw error;
    }
  }

  static async getCharlieData(): Promise<{
    image: string;
    description: string;
  }> {
    console.log("🐕 Fetching Charlie data from Supabase Database...");

    try {
      const { data, error } = await supabase
        .from("charlie_data")
        .select("*")
        .eq("id", "charlie")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error(
          "❌ Failed to fetch Charlie data:",
          error.message || error,
        );

        // Check if it's a missing table error
        if (
          error.message?.includes('relation "charlie_data" does not exist') ||
          error.code === "42P01"
        ) {
          console.error(
            "💡 Database tables not created yet. Please run the SQL migration.",
          );
          return {
            image: "",
            description:
              "Database tables not created yet. Please run the SQL migration script.",
          };
        }

        throw new Error(
          `Failed to fetch Charlie data: ${error.message || error}`,
        );
      }

      if (!data) {
        console.log("📝 No Charlie data found, returning default");
        return {
          image: "",
          description:
            "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.\n\nWhether it's hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.\n\nHis favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾",
        };
      }

      console.log("✅ Charlie data loaded from Supabase:", {
        hasImage: !!data.image,
        imageLength: data.image?.length || 0,
      });

      return {
        image: data.image || "",
        description: data.description,
      };
    } catch (error) {
      console.error("❌ Failed to get Charlie data:", error);
      return {
        image: "",
        description: "Charlie's data is temporarily unavailable.",
      };
    }
  }

  // Real-time subscriptions (replaces Firebase listeners)
  static subscribeToJournalEntries(
    callback: (entries: JournalEntry[]) => void,
  ) {
    console.log("🔄 Setting up real-time subscription for journal entries...");

    const channelName = `journal_entries_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("📡 Creating unique channel:", channelName);

    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "journal_entries" },
        async (payload) => {
          console.log("🔄 Journal entries DB change detected:", {
            eventType: payload.eventType,
            table: payload.table,
            schema: payload.schema,
            new: payload.new,
            old: payload.old,
          });

          if (payload.eventType === "DELETE") {
            console.log("🗑️ DELETE event detected in real-time!");
          }

          console.log("🔄 Fetching latest journal entries...");
          const entries = await this.getJournalEntries();
          console.log(
            `✅ Fetched ${entries.length} entries, calling callback...`,
          );
          callback(entries);
        },
      )
      .subscribe((status) => {
        console.log("📡 Journal entries subscription status:", status);
      });

    // Log subscription details
    console.log("��� Journal entries subscription created:", subscription);

    return () => {
      console.log("🔇 Unsubscribing from journal entries");
      supabase.removeChannel(subscription);
    };
  }

  static subscribeToMapPins(callback: (pins: MapPin[]) => void) {
    console.log("🔄 Setting up real-time subscription for map pins...");

    const subscription = supabase
      .channel("map_pins_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "map_pins" },
        async (payload) => {
          console.log("🔄 Map pins DB change detected:", payload);
          if (payload.eventType === "DELETE") {
            console.log("🗑️ MAP PIN DELETE event detected in real-time!");
          }
          const pins = await this.getMapPins();
          callback(pins);
        },
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
      .channel("wishlist_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wishlist_items" },
        async (payload) => {
          console.log("🔄 Wishlist items DB change detected:", payload);
          if (payload.eventType === "DELETE") {
            console.log("🗑️ WISHLIST DELETE event detected in real-time!");
          }
          const items = await this.getWishlistItems();
          callback(items);
        },
      )
      .subscribe();

    return () => {
      console.log("🔇 Unsubscribing from wishlist items");
      supabase.removeChannel(subscription);
    };
  }

  static subscribeToCharlieData(
    callback: (data: { image: string; description: string }) => void,
  ) {
    console.log("🔄 Setting up real-time subscription for Charlie data...");

    const subscription = supabase
      .channel("charlie_data_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "charlie_data" },
        async (payload) => {
          console.log("🔄 Charlie data DB change detected:", payload);
          if (payload.eventType === "DELETE") {
            console.log("🗑️ CHARLIE DATA DELETE event detected in real-time!");
          }
          const data = await this.getCharlieData();
          callback(data);
        },
      )
      .subscribe();

    return () => {
      console.log("🔇 Unsubscribing from Charlie data");
      supabase.removeChannel(subscription);
    };
  }

  // Test real-time connection
  static testRealtime(): void {
    console.log("🧪 Testing Supabase real-time connection...");

    const testChannel = supabase
      .channel("realtime_test")
      .subscribe((status) => {
        console.log("📡 Real-time test status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Real-time connection working!");
          setTimeout(() => {
            supabase.removeChannel(testChannel);
            console.log("🧪 Real-time test completed");
          }, 2000);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("❌ Real-time connection failed:", status);
        }
      });
  }

  // Test connection
  static async testConnection(retryCount = 0): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("charlie_data")
        .select("id")
        .limit(1);

      if (error) {
        console.error("❌ Supabase connection test failed:", error);

        // Check if it's a missing table error
        if (
          error.message?.includes('relation "charlie_data" does not exist') ||
          error.code === "42P01"
        ) {
          return {
            success: false,
            message:
              "Database tables not created yet. Please run the SQL migration script in Supabase Dashboard > SQL Editor.",
          };
        }

        return {
          success: false,
          message: `Connection failed: ${error.message || error}`,
        };
      }

      console.log("✅ Supabase Database connection successful");
      return {
        success: true,
        message: "Supabase Database connected successfully",
      };
    } catch (error) {
      console.error("❌ Supabase connection test error:", error);

      // Check if it's a missing table error in the catch block too
      if (
        error.message?.includes("relation") &&
        error.message?.includes("does not exist")
      ) {
        return {
          success: false,
          message:
            "Database tables not created yet. Please run the SQL migration script in Supabase Dashboard > SQL Editor.",
        };
      }

      // Check for network connectivity issues and retry
      if (
        error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.name === "AbortError" ||
          error.message.includes("NetworkError") ||
          error.message.includes("fetch"))
      ) {
        // Retry up to 2 times for network issues
        if (retryCount < 2) {
          console.log(
            `🔄 Network error, retrying connection test (${retryCount + 1}/2)...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
          return this.testConnection(retryCount + 1);
        }

        return {
          success: false,
          message:
            "Network connectivity issue - check internet connection and try again",
        };
      }

      return {
        success: false,
        message: `Connection error: ${error.message || error}`,
      };
    }
  }
}
