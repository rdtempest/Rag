import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/auth.config"
import { Message } from '@/types/message'

// Interface for chat providers
interface ChatProvider {
  generateCompletion(messages: Message[]): Promise<string>;
}

// OpenAI Provider implementation
class OpenAIProvider implements ChatProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateCompletion(messages: Message[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map(message => ({
        role: message.role,
        content: message.content,
      })),
    });
    console.log('Open AI called');
    return response.choices[0].message.content || '';
  }
}

// Other providers as needed, for example:
class GeminiProvider implements ChatProvider {
  private genAI: GoogleGenerativeAI;
/* eslint-disable @typescript-eslint/no-explicit-any */
private model: any;
/* eslint-enable @typescript-eslint/no-explicit-any */
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
   
  }
//  "gemini-2.0-flash-001" });
// gemini-1.5-pro-001
// gemini-1.5-pro-002


  async generateCompletion(messages: Message[]): Promise<string> {
    // Implement Gemini completion logic
    const prompt = messages.at(-1)?.content
    const result = await this.model.generateContent(prompt);
    console.log('Gemini called');
    return result.response.text() || '';
S  }
}

class AnthropicProvider implements ChatProvider {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private apiKey: string;
  // private temperature: number;
  // private topP: number;
  // private frequencyPenalty: number;
  // private presencePenalty: number;
  // private stopSequences: string[];
  // private system: string;
  // private maxTokensToSample: number;
  // private topK: number;
  // private topP: number;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.model= "claude-3-7-sonnet-20250219";
    this.maxTokens= 1024;
    this.client = new Anthropic({
      apiKey: this.apiKey, 
    });


  }
  async generateCompletion(messages: Message[]): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: messages.map(message => ({
        role: message.role,
        content: message.content,
      })),
    });
    console.log(`Anthropic called called apiKey: ${this.apiKey} `);

    return response.content[0].text || '';
  }
//      model: "claude-3-7-sonnet-20250219",
  }


// Factory to get the appropriate provider
function getChatProvider(preferredProvider: string): ChatProvider {
  const provider = preferredProvider.toLowerCase();
  
  switch (provider) {
    case 'openai':
      console.log('Using OpenAI provider');
      return new OpenAIProvider(process.env.OPENAI_API_KEY!);
    case 'anthropic':
      console.log('Using Anthropic provider');
      return new AnthropicProvider(process.env.ANTHROPIC_API_KEY!);
    case 'gemini':
      console.log('Using Gemini provider');
      return new GeminiProvider(process.env.GEMINI_API_KEY!);
    default:
      return new OpenAIProvider(process.env.OPENAI_API_KEY!);
  }
}
export async function POST(req: Request) {
  // Get the session
  const session = await getServerSession(authOptions);

  console.log('chat_route.ts Session:', session);

  // Check if user is authenticated
  if (!session?.user) {
    console.log(`***** User(${session}) is not authenticated`);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user has chat permission
  if (!session.user.permissions?.canChat) {
    console.log(`***** User(${session}) is not authorized to chat`);
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    );
  }

  // Access user details
  const userId = session.user.id;
  const userEmail = session.user.email;
  const userName = session.user.name;
  console.log('User making request:', {
    id: userId,
    name: userName,
    email: userEmail,
    permissions: session.user.permissions
  });

  try {
    const { messages } = await req.json();
//    console.log('Messages:', messages);

   // Get preferred provider from cookie
   const cookies = req.headers.get('cookie');
   const preferredProvider = cookies?.split(';')
     .find(c => c.trim().startsWith('preferred-chat-provider='))
     ?.split('=')[1] || 'openai';

   const chatProvider = getChatProvider(preferredProvider);
    // Generate completion using the selected provider
    const response = await chatProvider.generateCompletion(messages);

    return NextResponse.json({
      message: response,
    });

  } catch (error) {
    console.error('*******Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
