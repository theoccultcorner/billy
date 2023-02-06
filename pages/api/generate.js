import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const question = req.body.question || '';
  if (question.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid question",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(question),
      temperature: 0.7,
      max_tokens: 500,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(question) {
  return `Friend 1: Hey, what's up?

Friend 2: Not much, just thinking about life and all its mysteries.

Friend 1: Yeah, me too. Do you ever wonder about the meaning of life?

Friend 2: All the time. What about you?

Friend 1: I think it's different for everyone. For me, it's about finding happiness and living in the moment.

Friend 2: That's a good perspective. What about the purpose of existence?

Friend 1: I think the purpose of existence is to experience life, make connections with others, and leave a positive impact on the world.

Friend 2: I agree. Hey, speaking of life's mysteries, what do you think about ${question}?

Friend 1:`;
}
