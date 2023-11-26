import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DynamicStructuredTool } from "langchain/tools";
import * as z from "zod";
const gptModel = "gpt-4";

export const STORAGE_DIR = "./data";
export const STORAGE_CACHE_DIR = "./cache";
export const CHUNK_SIZE = 512;
export const CHUNK_OVERLAP = 20;

async function multiply(a: number, b: number) {
  return a * b;
}

async function add(a: number, b: number) {
  return a + b;
}

const getMultiplyTool = (apiKey: string) => {
  return new DynamicStructuredTool({
    description: "A tool to multiply two numbers",
    func: async ({ a, b }) => {
      return JSON.stringify(await multiply(a, b));
    },
    name: "multiply",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  });
};

const getAddTool = (apiKey: string) => {
  return new DynamicStructuredTool({
    description: "A tool to add two numbers",
    func: async ({ a, b }) => {
      return JSON.stringify(await add(a, b));
    },
    name: "add",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  });
};

const getUserDataTool = (apiKey: string) => {
  return new DynamicStructuredTool({
    description: "A tool to get user data",
    func: async ({ name }) => {
      return JSON.stringify("38 years. From Venezuela. Programmer.");
    },
    name: "add",
    schema: z.object({
      name: z.string(),
    }),
    returnDirect: true,
  });
};

export const agent = async (input: string) => {
  const tools = [
    getMultiplyTool(""),
    getAddTool(""),
    getUserDataTool(""),
  ];
  const model = new ChatOpenAI({
    modelName: gptModel,
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
  });

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentArgs: {
      prefix:
        `You are a useful tool for the user that can help them with stuff related  to math, or general knowledge`,
    },
    agentType: "openai-functions",
    returnIntermediateSteps: true,
    verbose: true,
  });

  const result = await executor.call({ input });

  const { output } = result;

  return output;
};
