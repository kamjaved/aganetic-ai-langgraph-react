<!-- TO VIEW THE MIND MAP YOU NEED TO INSTALL "Markmap" extension in VSCode or visit "https://markmap.js.org/repl" -->

# `/agent` POST Route Flow

## Request Processing

- ### Extract Request Data

  - `message`: User's message text
  - `threadId`: Conversation thread identifier
    - Falls back to 'default-chat-thread-125' if not provided
  - `username`: User's name
  - `userRole`: User's role (HR, Employee, etc.)

- ### Validate Request
  - Check if message exists
  - Return 400 error if message is missing

## Message Management

- ### Save User Message

  - Call `messageManager.saveMessage`
    - Parameters:
      - `message`: User's text
      - `'user'`: Sender type
      - `chatThreadId`: Thread identifier
      - `username || 'anonymous'`: Username with fallback
      - `false`: Not markdown
      - `userRole`: User's role
    - Stores in PostgreSQL database
      - Table: `Message`
      - Creates timestamp
      - Associates with thread

- ### Retrieve Optimized Context
  - Call `messageManager.getOptimizedContext`
    - Parameters:
      - `chatThreadId`: Thread identifier
    - Processing:
      - Fetches all thread messages from database
      - Applies window-based context optimization
        - If messages <= threshold: return all messages
        - If messages > threshold:
          - Split into older/recent messages
          - Summarize older messages
          - Combine summary + recent messages
      - Converts to `BaseMessage` objects
    - Returns array of message objects with conversation history

## Token Usage Monitoring

- ### Calculate Base Context Size
  - Extract text content from optimized context
  - Call `countTokens` utility
    - Estimates token count for context
  - Log token usage for monitoring

## Context Preparation

- ### Add Current Message
  - Create `HumanMessage` with user's message
  - Append to optimized context array

## Prompt Formatting

- ### Format Prompt with Context
  - Call `getFormattedPrompt`
    - Parameters:
      - `message`: User's text
      - Context object with:
        - `username`: User's name
        - `userRole`: User's role
        - `history`: Optimized context with messages
    - Processing:
      - Uses `PromptManager` service
      - Analyzes input to determine tool type
      - Applies appropriate prompt template
      - Combines system instructions + conversation history
    - Returns formatted messages array for LLM

## Agent Invocation

- ### Call AI Agent
  - Invoke `agent.invoke`
    - Parameters:
      - `messages`: Formatted prompt
    - Processing:
      - Agent decides which tools to use
      - Performs reasoning and actions
      - Uses tools as needed (math, search, database, etc.)
      - Generates response
    - Returns message objects with agent's response

## Response Processing

- ### Extract AI Response

  - Get last message from result
  - Extract content as string
  - Log AI reply for monitoring

- ### Save AI Response
  - Call `messageManager.saveMessage`
    - Parameters:
      - `aiResponse`: AI's text
      - `'agent'`: Sender type
      - `chatThreadId`: Thread identifier
      - `'AI'`: Username
      - `true`: Is markdown
    - Stores in PostgreSQL database
      - Same table as user message
      - Preserves conversation thread

## Response Sending

- ### Format API Response
  - Prepare JSON object with:
    - `status`: 200
    - `threadId`: Thread identifier
    - `ai_message`: AI's response text
  - Send successful response to client

## Error Handling

- ### Catch Exceptions
  - Log detailed error information
  - Send 500 error response
    - Include error message if available
    -
