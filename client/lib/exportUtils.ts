import { LocalStorage } from "./storage";
import { JournalEntry, MapPin, WishlistItem } from "@shared/api";

interface ExportData {
  entries: JournalEntry[];
  pins: MapPin[];
  wishlist: WishlistItem[];
  exportDate: string;
  version: string;
  familyName: string;
}

export class ExportUtils {
  private static formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private static formatCurrency(amount: string): string {
    if (!amount) return "";
    return amount.startsWith("£") ? amount : `£${amount}`;
  }

  // Full JSON backup of all data
  static exportFullBackup(): void {
    try {
      const exportData: ExportData = {
        entries: LocalStorage.getJournalEntries(),
        pins: LocalStorage.getMapPins(),
        wishlist: LocalStorage.getWishlistItems(),
        exportDate: new Date().toISOString(),
        version: "1.0",
        familyName: "Dorman Family",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `dorman-family-journal-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Backup exported successfully");
    } catch (error) {
      console.error("Error exporting backup:", error);
      throw new Error("Failed to export backup");
    }
  }

  // Import backup data
  static importBackup(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const importData: ExportData = JSON.parse(result);

          // Validate the data structure
          if (!importData.entries || !importData.pins || !importData.wishlist) {
            throw new Error("Invalid backup file format");
          }

          // Import data
          if (importData.entries.length > 0) {
            importData.entries.forEach((entry) =>
              LocalStorage.saveJournalEntry(entry),
            );
          }
          if (importData.pins.length > 0) {
            importData.pins.forEach((pin) => LocalStorage.saveMapPin(pin));
          }
          if (importData.wishlist.length > 0) {
            importData.wishlist.forEach((item) =>
              LocalStorage.saveWishlistItem(item),
            );
          }

          resolve(true);
        } catch (error) {
          console.error("Error importing backup:", error);
          reject(new Error("Failed to import backup file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read backup file"));
      reader.readAsText(file);
    });
  }

  // Export journal as formatted HTML (for printing/PDF)
  static exportJournalAsHTML(): void {
    try {
      const entries = LocalStorage.getJournalEntries();
      const pins = LocalStorage.getMapPins();
      const wishlist = LocalStorage.getWishlistItems();

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dorman Family Scottish Adventures</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 60px;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header p {
            color: #666;
            font-size: 1.1rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 60px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
        }
        
        .section {
            margin-bottom: 50px;
        }
        
        .section-title {
            font-size: 1.8rem;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            color: #333;
        }
        
        .entry-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            page-break-inside: avoid;
        }
        
        .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .entry-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #333;
            flex: 1;
        }
        
        .entry-rating {
            font-size: 1.5rem;
        }
        
        .entry-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            color: #666;
        }
        
        .entry-content {
            margin: 20px 0;
            font-size: 1rem;
            line-height: 1.7;
        }
        
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 15px;
        }
        
        .tag {
            background: #e3f2fd;
            color: #1976d2;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .wishlist-item {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
            border-left: 4px solid #764ba2;
        }
        
        .completed {
            opacity: 0.7;
            border-left-color: #4caf50;
        }
        
        .footer {
            text-align: center;
            margin-top: 60px;
            padding: 30px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        @media print {
            body {
                background: white;
            }
            .container {
                padding: 20px;
            }
            .entry-card, .header, .footer {
                box-shadow: none;
                border: 1px solid #ddd;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Dorman Family Scottish Adventures ✨</h1>
            <p>A collection of our magical journeys across beautiful Scotland</p>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #888;">
                Exported on ${this.formatDate(new Date())}
            </p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${entries.length}</div>
                <div>Journal Entries</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${pins.length}</div>
                <div>Places Visited</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${entries.reduce((sum, e) => sum + e.images.length, 0)}</div>
                <div>Photos Captured</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${entries.reduce((sum, e) => sum + e.likes, 0)}</div>
                <div>Total Likes</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📖 Our Adventure Journal</h2>
            ${entries
              .map(
                (entry) => `
                <div class="entry-card">
                    <div class="entry-header">
                        <h3 class="entry-title">${entry.title}</h3>
                        <div class="entry-rating">${this.getMoodEmoji(entry.moodRating)}</div>
                    </div>
                    
                    <div class="entry-meta">
                        <div class="meta-item">
                            <span>📍</span>
                            <span>${entry.location}</span>
                        </div>
                        <div class="meta-item">
                            <span>📅</span>
                            <span>${this.formatDate(entry.date)}</span>
                        </div>
                        <div class="meta-item">
                            <span>👤</span>
                            <span>by ${entry.author}</span>
                        </div>
                        <div class="meta-item">
                            <span>❤️</span>
                            <span>${entry.likes} likes</span>
                        </div>
                        ${
                          entry.isPaidActivity
                            ? `
                        <div class="meta-item">
                            <span>💳</span>
                            <span>Paid Activity ${entry.activityCost ? `(${entry.activityCost})` : ""}</span>
                        </div>
                        `
                            : ""
                        }
                        ${
                          !entry.hasFreeParkingAvailable
                            ? `
                        <div class="meta-item">
                            <span>🅿️</span>
                            <span>Paid Parking ${entry.parkingCost ? `(${entry.parkingCost})` : ""}</span>
                        </div>
                        `
                            : `
                        <div class="meta-item">
                            <span>🅿️</span>
                            <span>Free Parking</span>
                        </div>
                        `
                        }
                    </div>
                    
                    <div class="entry-content">
                        ${entry.content.replace(/\n/g, "<br>")}
                    </div>
                    
                    ${
                      entry.greatFor.length > 0
                        ? `
                    <div class="tags">
                        ${entry.greatFor.map((activity) => `<span class="tag">${activity}</span>`).join("")}
                    </div>
                    `
                        : ""
                    }
                    
                    ${
                      entry.wouldReturnReason
                        ? `
                    <div style="margin-top: 15px; padding: 15px; background: #f0f8ff; border-radius: 8px;">
                        <strong>${entry.wouldReturn ? "Would Return:" : "Would Not Return:"}</strong>
                        <p style="margin-top: 5px;">${entry.wouldReturnReason}</p>
                    </div>
                    `
                        : ""
                    }
                </div>
            `,
              )
              .join("")}
        </div>

        ${
          wishlist.length > 0
            ? `
        <div class="section">
            <h2 class="section-title">⭐ Our Dream Destinations</h2>
            ${wishlist
              .map(
                (item) => `
                <div class="wishlist-item ${item.isCompleted ? "completed" : ""}">
                    <h4 style="margin-bottom: 10px; font-weight: 600;">
                        ${item.isCompleted ? "✅" : "⏳"} ${item.title}
                    </h4>
                    <p style="color: #666; margin-bottom: 10px;">📍 ${item.location}</p>
                    ${item.description ? `<p style="margin-bottom: 10px;">${item.description}</p>` : ""}
                    <div style="display: flex; gap: 15px; font-size: 0.9rem; color: #666; flex-wrap: wrap;">
                        <span>Priority: ${item.priority}</span>
                        <span>Category: ${item.category}</span>
                        ${item.estimatedCost ? `<span>Cost: ${item.estimatedCost}</span>` : ""}
                        ${item.bestTimeToVisit ? `<span>Best Time: ${item.bestTimeToVisit}</span>` : ""}
                    </div>
                    ${item.notes ? `<p style="margin-top: 10px; font-style: italic; color: #666;">"${item.notes}"</p>` : ""}
                </div>
            `,
              )
              .join("")}
        </div>
        `
            : ""
        }

        <div class="footer">
            <p><strong>Made with ❤️ for the Dorman Family</strong></p>
            <p style="margin-top: 10px; color: #666;">
                This journal contains ${entries.length} adventures, ${pins.length} places visited, 
                and ${entries.reduce((sum, e) => sum + e.images.length, 0)} precious memories captured.
            </p>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #888;">
                "Adventure is out there!" - Keep exploring Scotland! 🏴󠁧󠁢󠁳󠁣󠁴󠁿
            </p>
        </div>
    </div>
</body>
</html>`;

      const blob = new Blob([html], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dorman-family-adventures-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Journal exported as HTML successfully");
    } catch (error) {
      console.error("Error exporting journal as HTML:", error);
      throw new Error("Failed to export journal");
    }
  }

  // Export individual entry as formatted HTML
  static exportSingleEntry(entryId: string): void {
    try {
      const entries = LocalStorage.getJournalEntries();
      const entry = entries.find((e) => e.id === entryId);

      if (!entry) {
        throw new Error("Entry not found");
      }

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${entry.title} - Dorman Family Adventures</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
            background: #fafafa;
        }
        .entry {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        .title {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .content {
            font-size: 1.1rem;
            line-height: 1.8;
            margin: 30px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="entry">
        <div class="header">
            <h1 class="title">${entry.title}</h1>
            <div style="font-size: 2rem; margin: 10px 0;">${this.getMoodEmoji(entry.moodRating)}</div>
            <p>A Dorman Family Adventure</p>
        </div>
        
        <div class="meta">
            <div><strong>📍 Location:</strong> ${entry.location}</div>
            <div><strong>📅 Date:</strong> ${this.formatDate(entry.date)}</div>
            <div><strong>👤 Author:</strong> ${entry.author}</div>
            <div><strong>❤️ Likes:</strong> ${entry.likes}</div>
            ${entry.isPaidActivity ? `<div><strong>💳 Activity Cost:</strong> ${entry.activityCost || "Paid activity"}</div>` : ""}
            <div><strong>🅿️ Parking:</strong> ${entry.hasFreeParkingAvailable ? "Free" : `Paid ${entry.parkingCost || ""}`}</div>
        </div>
        
        <div class="content">
            ${entry.content.replace(/\n/g, "<br>")}
        </div>
        
        ${
          entry.greatFor.length > 0
            ? `
        <div style="margin: 20px 0;">
            <strong>Great for:</strong> ${entry.greatFor.join(", ")}
        </div>
        `
            : ""
        }
        
        ${
          entry.wouldReturnReason
            ? `
        <div style="margin: 20px 0; padding: 15px; background: #e8f5e8; border-radius: 8px;">
            <strong>${entry.wouldReturn ? "Would Return:" : "Would Not Return:"}</strong>
            <p style="margin-top: 10px;">${entry.wouldReturnReason}</p>
        </div>
        `
            : ""
        }
        
        <div class="footer">
            <p>Exported on ${this.formatDate(new Date())}</p>
            <p>© Dorman Family Adventures</p>
        </div>
    </div>
</body>
</html>`;

      const blob = new Blob([html], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${entry.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Entry exported successfully");
    } catch (error) {
      console.error("Error exporting entry:", error);
      throw new Error("Failed to export entry");
    }
  }

  // Get statistics for export
  static getExportStats() {
    const entries = LocalStorage.getJournalEntries();
    const pins = LocalStorage.getMapPins();
    const wishlist = LocalStorage.getWishlistItems();

    return {
      totalEntries: entries.length,
      totalPins: pins.length,
      totalWishlistItems: wishlist.length,
      totalPhotos: entries.reduce((sum, entry) => sum + entry.images.length, 0),
      totalLikes: entries.reduce((sum, entry) => sum + entry.likes, 0),
      totalComments: entries.reduce(
        (sum, entry) => sum + entry.comments.length,
        0,
      ),
      dateRange:
        entries.length > 0
          ? {
              earliest: new Date(
                Math.min(...entries.map((e) => new Date(e.date).getTime())),
              ),
              latest: new Date(
                Math.max(...entries.map((e) => new Date(e.date).getTime())),
              ),
            }
          : null,
    };
  }

  private static getMoodEmoji(rating: number): string {
    const moodMap: { [key: number]: string } = {
      1: "😞",
      2: "😐",
      3: "🙂",
      4: "😊",
      5: "🤩",
    };
    return moodMap[rating] || "😊";
  }
}
