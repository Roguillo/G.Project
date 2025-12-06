import OpenAI from 'openai'

/*
  Useful website to convert images to Base64:

  https://base64.guru/converter/encode/image
*/

export const handler = async (event) => {
  let response_code, response_body;

  try {
    const body = event.body ? JSON.parse(event.body) : event;
    const { image, loginToken, receiptID } = body || {};

    if (!image) throw new Error('No image provided');

    const dataUrl = image.startsWith("data:") ? image : `data:image/png;base64,${image}`;

    const client  = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });

    const response = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Summarize this receipt image as valid raw JSON: {"storeName":"store","date":{"day":DD,"month":MM,"year":YYYY},"items":[{"itemName":"name","itemCategory":"category or null","itemPrice":0.0},...]} and respond ONLY with the JSON object, no extra text, no code fences, no labels, no quotes around the JSON itself.',
            },
            { type: 'input_image', image_url: dataUrl },
          ],
        },
      ],
      max_output_tokens: 500,
    });

    // Extract text from response.output
    let summary = '';

    try {
      const out = response.output;
      if (Array.isArray(out)) {
        summary = out
          .map((item) => {
            if (typeof item === 'string') return item;
            if (Array.isArray(item.content)) {
              return item.content.map((c) => c.text || c).join(' ');
            }
            return JSON.stringify(item);
          })
          .join('\n');
      } else if (response.output_text) {
        summary = response.output_text;
      } else {
        summary = JSON.stringify(response);
      }
    } catch (err) {
      summary = JSON.stringify(response);
    }

    response_code = 200;
    response_body = { summary };

  } catch (error) {
    response_code = 400;
    response_body = { error: error.message };
  }

  return {
    statusCode: response_code,
    body      : JSON.stringify(response_body)
  }
}
