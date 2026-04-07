export function buildWebsitePrompt(config: {
  businessName: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  style: string;
  accentColor: string;
}): string {
  const { businessName, category, phone, email, address, style, accentColor } = config;
  const location = address?.split(",").pop()?.trim() || "the local area";
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Category-specific image search terms for Unsplash
  const imageTerms: Record<string, string[]> = {
    Restaurant: ["restaurant-interior", "food-plating", "chef-cooking", "restaurant-dining"],
    Plumber: ["plumbing-work", "bathroom-modern", "kitchen-sink", "water-pipe"],
    Electrician: ["electrician-work", "modern-lighting", "smart-home", "electrical-panel"],
    "Hair Salon": ["hair-salon-interior", "hairstyling", "beauty-salon", "hair-cutting"],
    Dentist: ["dental-clinic", "dentist-office", "smile-teeth", "dental-chair"],
    Lawyer: ["law-office", "legal-books", "business-meeting", "courthouse"],
    Accountant: ["office-desk", "financial-planning", "business-accounting", "calculator"],
    "Auto Repair": ["auto-mechanic", "car-repair", "garage-workshop", "car-engine"],
    "Pet Grooming": ["dog-grooming", "pet-salon", "cute-dog", "pet-care"],
    Bakery: ["bakery-bread", "pastry-display", "fresh-baking", "artisan-bread"],
    Florist: ["flower-shop", "bouquet-roses", "floral-arrangement", "flower-display"],
    "Dry Cleaning": ["laundry-service", "clothes-hanging", "iron-pressing", "clean-shirts"],
    Gym: ["gym-interior", "fitness-training", "weight-lifting", "workout"],
    Spa: ["spa-treatment", "massage-therapy", "wellness-candle", "relaxation"],
    Photographer: ["photography-studio", "camera-lens", "portrait-photo", "photo-shoot"],
    Landscaping: ["garden-landscaping", "lawn-care", "beautiful-garden", "outdoor-design"],
    Roofing: ["roofing-work", "house-roof", "construction-worker", "building-exterior"],
    HVAC: ["air-conditioning", "hvac-system", "heating-repair", "ventilation"],
    "Real Estate Agent": ["modern-house", "real-estate", "property-interior", "house-exterior"],
    "Cleaning Service": ["house-cleaning", "clean-kitchen", "mop-floor", "tidy-room"],
    "Tattoo Studio": ["tattoo-art", "tattoo-studio", "body-art", "tattoo-machine"],
    Barber: ["barber-shop", "mens-haircut", "barber-chair", "shaving"],
  };

  const terms = imageTerms[category] || ["business-professional", "office-modern", "team-work", "customer-service"];
  
  const heroImg = `https://source.unsplash.com/1600x900/?${encodeURIComponent(terms[0])}`;
  const sectionImg1 = `https://source.unsplash.com/800x600/?${encodeURIComponent(terms[1])}`;
  const sectionImg2 = `https://source.unsplash.com/800x600/?${encodeURIComponent(terms[2])}`;
  const sectionImg3 = `https://source.unsplash.com/800x600/?${encodeURIComponent(terms[3])}`;

  return `Generate a STUNNING, award-winning single-page HTML website for "${businessName}" — a ${category.toLowerCase()} business in ${location}.

THIS MUST LOOK LIKE A REAL £5,000+ PROFESSIONAL WEBSITE. Not a template. Not basic. Premium.

CRITICAL DESIGN RULES:
- Use these REAL Unsplash images (they work, use them as-is):
  Hero: ${heroImg}
  Section 1: ${sectionImg1}
  Section 2: ${sectionImg2}
  Section 3: ${sectionImg3}
- Primary accent color: ${accentColor}
- Style: ${style}
- Google Fonts via @import: Use 'Inter' for body, pick a premium display font (Playfair Display for elegant, Space Grotesk for modern, Sora for bold, DM Sans for minimal)
- ALL CSS embedded in <style> tags
- Fully responsive (mobile breakpoints at 768px and 480px)

REQUIRED SECTIONS (in order):
1. NAVIGATION: Sticky, glass-morphism (backdrop-blur, semi-transparent bg). Logo left, nav links right, CTA button. On scroll, add subtle shadow.

2. HERO SECTION: Full-viewport height. Background image (${heroImg}) with dark overlay gradient. Large bold headline (max 8 words). Subheadline (1 sentence). Two CTA buttons (primary filled + secondary outline). Add subtle parallax or fade-in animation.

3. SERVICES: 2-column or 3-column grid. Each card has an icon (use inline SVG, NOT emoji), title, short description. Cards should have hover effects (lift + shadow). 6 services relevant to ${category}.

4. ABOUT / WHY US: Split layout — image on one side (${sectionImg1}), text on other. Include 3 key stats (e.g., "15+ Years Experience", "500+ Happy Clients", "4.9★ Rating"). Use a counter-style layout.

5. GALLERY / SHOWCASE: Full-width image strip or grid using ${sectionImg2} and ${sectionImg3}. Overlay text on hover.

6. TESTIMONIALS: 3 realistic testimonials with fake names, star ratings (use ★ character), and a subtle card design. Carousel feel or side-by-side.

7. CTA BANNER: Bold accent-colored section. Compelling headline. Phone number: ${phone || "020 1234 5678"}. Big CTA button.

8. CONTACT / FOOTER: Dark background. Address: ${address || "123 High Street, London"}. Email: ${email || `hello@${slug}.co.uk`}. Phone: ${phone || "020 1234 5678"}. Social media icon placeholders (inline SVGs). Copyright line.

ANIMATIONS (use IntersectionObserver in <script>):
- Fade-in-up on scroll for each section
- Smooth scroll for nav links
- Hover transitions on all interactive elements (0.3s ease)
- Hero text should animate in on load (opacity + translateY)

CSS QUALITY REQUIREMENTS:
- Use CSS custom properties for colors
- box-shadow on cards: 0 4px 20px rgba(0,0,0,0.08)
- border-radius: 12-16px on cards
- Generous padding (80px+ section padding on desktop)
- Line-height: 1.6-1.8 for body text
- Letter-spacing on headings
- Image object-fit: cover on all images
- Gradient overlays on image sections

Return ONLY the HTML. No explanation. No markdown fences. Start with <!DOCTYPE html>.
The output should be 500-800 lines of premium HTML+CSS+JS.`;
}
