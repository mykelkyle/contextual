import readline from "readline";
import { Message } from "./utils";
import { askQuestion } from "./rag";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat() {
  const history: Message[] = [];
  console.log('\nAsk me anything about [x], or type "exit" to quit\n');
  const systemMessage: Message = {
    role: "system",
    content:
      "You are a friendly teacher. Use ONLY the context I provide you to answer the user's questions. If the entries aren't relevant to the question or you do not have enough context to answer appropriately, do not try to answer. If the user asks a question that is not related to [x], explain that you can't answer it. It is important that you only use the context I provide you to answer questions.",
  };

  history.push(systemMessage);

  while (true) {
    const userInput = await new Promise<string>((resolve) => {
      rl.question("You: ", resolve);
    });

    if (userInput.toLowerCase() === "exit") {
      console.log("\nContextual: Thanks for chatting, bye!");
      break;
    }

    const userMessage: Message = {
      role: "user",
      content: userInput,
    };

    history.push(userMessage);

    try {
      const completion = await askQuestion(history);

      const assistantMessage: Message = {
        role: "assistant",
        content: completion.choices[0].message.content || "No response",
      };

      history.push(assistantMessage);
      console.log(`\nContextual: ${assistantMessage.content}\n`);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  rl.close();
}

chat().catch(console.error);
