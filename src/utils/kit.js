// Kit (ConvertKit) integration
// Subscribes users to your Kit form on registration and tags them on events
//
// To set up:
// 1. Log in to kit.com
// 2. Go to Grow > Landing Pages & Forms > Create a form (or use existing)
// 3. Copy the form ID from the URL (e.g., kit.com/forms/designers/FORM_ID)
// 4. Go to Settings > Developer > API key
// 5. Add both to your .env file

const KIT_API_KEY = import.meta.env.VITE_KIT_API_KEY || '';
const KIT_FORM_ID = import.meta.env.VITE_KIT_FORM_ID || '';
const KIT_ENABLED = KIT_API_KEY && KIT_FORM_ID;

async function kitRequest(endpoint, body) {
  if (!KIT_ENABLED) return null;
  try {
    const res = await fetch(`https://api.convertkit.com/v3/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: KIT_API_KEY, ...body }),
    });
    if (!res.ok) {
      console.error('Kit API error:', await res.text());
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Kit request failed:', err);
    return null;
  }
}

// Subscribe a new user to the Kit form
export async function subscribeUser(email, name) {
  return kitRequest(`forms/${KIT_FORM_ID}/subscribe`, {
    email,
    first_name: name,
    fields: { source: 'uc30_challenge' },
  });
}

// Tag a subscriber (requires tag ID from Kit)
export async function tagSubscriber(email, tagId) {
  if (!tagId) return null;
  return kitRequest(`tags/${tagId}/subscribe`, { email });
}

export const isKitEnabled = KIT_ENABLED;
