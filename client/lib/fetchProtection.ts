// Utility to protect fetch requests from analytics interference
export class FetchProtection {
  private static originalFetch: typeof fetch
  private static isProtectionActive = false

  // Enable protection for critical requests
  static enableProtection(): void {
    if (this.isProtectionActive) return

    console.log('🛡️ Enabling fetch protection for Firebase/Supabase')
    
    this.originalFetch = window.fetch
    this.isProtectionActive = true

    // Override fetch to bypass analytics with proper binding
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      // For critical services, use original fetch directly with proper binding
      const url = typeof input === 'string' ? input : input.toString()

      if (url.includes('firestore.googleapis.com') ||
          url.includes('supabase.co') ||
          url.includes('firebase.googleapis.com')) {

        console.log('🔒 Protected fetch for:', url.substring(0, 50) + '...')
        return FetchProtection.originalFetch.bind(window)(input, init)
      }

      // For other requests, use original fetch with proper binding
      return FetchProtection.originalFetch.bind(window)(input, init)
    }
  }

  // Disable protection
  static disableProtection(): void {
    if (!this.isProtectionActive || !this.originalFetch) return

    console.log('🔓 Disabling fetch protection')
    window.fetch = this.originalFetch
    this.isProtectionActive = false
  }

  // Temporarily disable analytics scripts
  static disableAnalytics(): void {
    try {
      // Disable FullStory if present
      if (window.FS && typeof window.FS.shutdown === 'function') {
        console.log('🚫 Disabling FullStory analytics')
        window.FS.shutdown()
      }
      
      // Disable other common analytics
      if (window.gtag) {
        console.log('🚫 Disabling Google Analytics')
        window.gtag('config', 'GA_MEASUREMENT_ID', { send_page_view: false })
      }
    } catch (error) {
      console.warn('Analytics disable failed:', error)
    }
  }
}

// Auto-enable protection on import
FetchProtection.enableProtection()
