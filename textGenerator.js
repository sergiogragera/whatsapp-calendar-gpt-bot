const got = require('got');

async function generate(prompt) {
  if (process.env.OPENAI_SECRET_KEY) {
    const url = 'https://api.openai.com/v1/completions';
    const params = {
      model: "text-davinci-003",
      prompt,
      top_p: 1,
      max_tokens: 200,
      temperature: 0.6,
      frequency_penalty: 1.5,
      presence_penalty: 1.2,
    };
    const headers = {
      'Authorization': `Bearer ${process.env.OPENAI_SECRET_KEY}`,
    };

    const response = await got.post(url, { json: params, headers: headers }).json();
    return response.choices[0].text;
  }
  return prompt;
}

module.exports = { generate };