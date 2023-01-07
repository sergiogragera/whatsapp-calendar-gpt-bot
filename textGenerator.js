const got = require('got');
 
function trimBreaklines(string) {
  return string.replace(/^\s+|\s+$/g, '');;

}

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
    const text = response.choices[0].text; 
    const parsed = trimBreaklines(text);

    return parsed;
  }
  return prompt;
}

module.exports = { generate };