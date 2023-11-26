import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { StructuredOutputParser,OutputFixingParser } from "langchain/output_parsers";
import { DynamicStructuredTool } from "langchain/tools";
import * as z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const gptModel = "gpt-4";

const model = new ChatOpenAI({
    modelName: gptModel,
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
  });

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
      return JSON.stringify({result:'50years old, from the US, and works as a software engineer'});
    },
    name: "add",
    schema: z.object({
      name: z.string(),
    }),
  })
    
};

const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      years: z.number().describe("age of the user"),
        country: z.string().describe("country of the user"),
        job: z.string().describe("job of the user"),
    })
  );

const createStructuredOutputUserDataTool = (apiKey: string) => {
    return new DynamicStructuredTool({
        description: "A tool to create a structured output for user data",
        func: async ({ result }) => {
             OutputFixingParser.fromLLM(model, parser);
             let output = await parser.parse(result)
            return JSON.stringify(output);
        },
        returnDirect: true,
        name: "createStructuredOutputUserData",
        schema: z.object({
            result: z.string(),
        }),
    })
}   



export const agent = async (input: string) => {
  const tools = [
    getMultiplyTool(""),
    getAddTool(""),
    getUserDataTool(""),
    createStructuredOutputUserDataTool(""),
  ];

  const toolsNames = tools.map((tool) => tool.name);


  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentArgs: {
      prefix:
        `You are a useful tool for the user that can help them with stuff related  to math, or general knowledge`,
    },
    agentType: "structured-chat-zero-shot-react-description",
    returnIntermediateSteps: true,
    verbose: true,
  });

  const result = await executor.call({ input, })

  const { output } = result;

  return output;
};
