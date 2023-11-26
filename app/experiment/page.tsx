'use client';
import Header from "@/app/components/header";
import { ChatInput, ChatMessages,ChatInputProps, Message } from "../components/ui/chat";
import { useState } from "react";
import { nanoid } from "nanoid";


function useChat():ChatInputProps &  { messages: Message[] } {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");
  
    const getAssistantMessage = async (messages: Message[]) => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_CHAT_API ?? "/api/experiment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
          }),
        },
      );
      const data = await response.json();
      const assistantMessage = data.result as Message;
      return assistantMessage;
    };
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input) return;
  
      setIsLoading(true);
  
      try {
        const newMessages = [
          ...messages,
          { id: nanoid(), content: input, role: "user" },
        ];
        setMessages(newMessages);
        setInput("");
        const assistantMessage = await getAssistantMessage(newMessages);
        setMessages([...newMessages, { ...assistantMessage, id: nanoid() }]);
      } catch (error: any) {
        console.log(error);
        alert(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleInputChange = (e: any): void => {
      setInput(e.target.value);
    };
  
    return {
      messages,
      isLoading,
      input,
      handleSubmit,
      handleInputChange,
    };
  }

export default function Home() {
    const { messages, isLoading, input, handleSubmit, handleInputChange } =
    useChat();
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 p-24 background-gradient">
 <ChatMessages
        isLoading={isLoading}
        messages={messages}
      />
      <ChatInput
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
      />
    </main>
  );
}
