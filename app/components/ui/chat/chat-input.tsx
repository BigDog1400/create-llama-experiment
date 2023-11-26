import { Button } from "../button";
import { Input } from "../input";
import { ChatHandler } from "./chat.interface";
 
export interface ChatInputProps extends Pick<
  ChatHandler,
  "isLoading" | "handleSubmit" | "handleInputChange" | "input"
> {}

export default function ChatInput(
  props: ChatInputProps,
) {
  return (
    <form
      onSubmit={props.handleSubmit}
      className="flex w-full items-start justify-between gap-4 rounded-xl bg-white p-4 shadow-xl"
    >
      <Input
        autoFocus
        name="message"
        placeholder="Type a message"
        className="flex-1"
        value={props.input}
        onChange={props.handleInputChange}
      />
      <Button type="submit" disabled={props.isLoading}>
        Send message
      </Button>
    </form>
  );
}
