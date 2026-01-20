# Directive: Optimize Lead Gen with Google Maps

**Goal**: Enhance the Lead Generation Suite by integrating official Google Maps Platform verification.

**Inputs**:
- Google Maps API Key (Env: `GOOGLE_MAPS_API_KEY`).
- `@googlemaps/google-maps-services-js`.

**Improvements**:
1. **Address Verification**: Use `Text Search (New)` to validate scraped addresses and retrieve permanent `place_id`.
2. **Metadata Enrichment**: Fetch official Website and International Phone Number.

**Execution**:
- Run `node verification/verify_address.js "Target Busines, City"` to verify a lead.

**Output**:
- Validated Lead Object (JSON).
