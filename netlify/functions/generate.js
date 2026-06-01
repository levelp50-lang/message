exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { offer, link, brand, leads } = JSON.parse(event.body);

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No leads provided' }) };
    }

    if (!offer) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No offer provided' }) };
    }

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

    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();

    if (!data.choices || !data.choices[0]) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Bad Grok response', detail: data }) };
    }

    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return { statusCode: 200, body: JSON.stringify(parsed) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
