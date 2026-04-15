export default async function handler(req, res) {
  // Use the same ping logic
  const response = await fetch("https://fishmnjzdiqnfpwfmsob.supabase.co/rest/v1/users?select=id&limit=1", {
    headers: {
      "apikey": process.env.SUPABASE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_KEY}`
    }
  });

  if (response.ok) {
    console.log("Vercel: Supabase pinged successfully!");
    return res.status(200).json({ message: 'Success' });
  } else {
    console.error("Vercel: Ping failed", response.status);
    return res.status(500).json({ error: 'Ping failed' });
  }
}
