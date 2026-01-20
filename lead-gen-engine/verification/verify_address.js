import { Client } from "@googlemaps/google-maps-services-js";
import process from "process";

const client = new Client({});
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
    console.error("Error: GOOGLE_MAPS_API_KEY is not set.");
    process.exit(1);
}

async function verifyAddress(query) {
    try {
        const response = await client.textSearch({
            params: {
                query: query,
                key: apiKey,
            },
        });

        if (response.data.results.length > 0) {
            const place = response.data.results[0];
            console.log(JSON.stringify({
                status: "verified",
                place_id: place.place_id,
                name: place.name,
                address: place.formatted_address,
                rating: place.rating,
                user_ratings_total: place.user_ratings_total
            }, null, 2));
        } else {
            console.log(JSON.stringify({ status: "not_found", query }));
        }
    } catch (e) {
        console.error("Verification Failed:", e.response ? e.response.data : e.message);
    }
}

// CLI Interface
const query = process.argv[2];
if (query) {
    verifyAddress(query);
} else {
    console.log("Usage: node verify_address.js \"Business Name, City\"");
}
