export default async function handler(req, res) {
  // Check for secret token to prevent unauthorized revalidation
  if (req.query.secret !== process.env.REVALIDATION_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Revalidate the pages that show new news posts
    await res.revalidate('/news');
    await res.revalidate('/');
    
    return res.json({ 
      revalidated: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).send(`Error revalidating: ${err.message}`);
  }
}
