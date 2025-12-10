import OpenAI from "openai";

export const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : event;
    const { image } = body || {};
    if (!image) throw new Error("No image provided");

    const dataUrl = image.startsWith("data:")
      ? image
      : `data:image/png;base64,${image}`;

    const client = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });

    const response = await client.responses.create({
      model: "gpt-4o",
      text: { format: { type: "json_object" } },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                'Summarize this receipt image as valid raw JSON: ' +
                '{"storeName":"store","date":{"day":DD,"month":MM,"year":YYYY},' +
                '"items":[{"itemName":"name","itemCategory":"specified category or estimated category","itemPrice":0.0},...]}' +
                ' and respond ONLY with the JSON object, no extra text, ' +
                'no code fences, no labels, no quotes around the JSON itself.'
            },
            {
              type: "input_image",
              image_url: dataUrl
            }
          ]
        }
      ]
    });

    // Extract JSON from response
    const textBlock = response.output?.[0]?.content?.[0]?.text;
    if (!textBlock) throw new Error("No JSON returned from model");

    const summary = JSON.parse(textBlock);

    return {
      statusCode: 200,
      body: JSON.stringify({ summary })
    };

  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }
};
