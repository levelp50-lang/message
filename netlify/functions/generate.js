exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { offer, link, brand, leads } = JSON.parse(event.body);

  const prompt = `You are a direct-response copywriter. Write outreach sequences for each lead below.

Offer: ${offer}
Link: ${link || '[INSERT LINK]'}
Sender: ${brand || 'the sender'}

Leads:
${leads.map((l, i) => `${i+1}. Name: ${l.name}, Email: ${l.email}, Phone: ${l.phone}`).join('\n')}

For each lead write:
- email_subject: punchy subject line, 6-10 words, no clickbait
- email_body: 3-4 short paragraphs, conversational, no corporate speak, personalized to name, ends with clear CTA and the link
- sms: under 155 chars, casual, direct, first name, includes link

Respond ONLY in this exact JSON, no markdown, no extra text:
{"sequences":[{"name":"","email":"","phone":"","email_subject":"","email_body":"","sms":""}]}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    const text = data.content.map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      body: JSON.stringify(parsed)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
