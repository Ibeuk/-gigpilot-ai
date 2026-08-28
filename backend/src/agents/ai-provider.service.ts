import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIGenerateOptions,
  AIResponse,
} from './types/agent.types';

/**
 * AI Provider Service — Abstracts LLM API calls.
 *
 * Supports Gemini (primary) and OpenAI (fallback).
 * Automatically falls back to secondary provider on failure.
 */
@Injectable()
export class AIProviderService implements AIProvider {
  private readonly logger = new Logger(AIProviderService.name);
  readonly name: string;

  private readonly geminiApiKey: string;
  private readonly openaiApiKey: string;
  private readonly primaryProvider: string;
  private readonly geminiModel: string;
  private readonly openaiModel: string;

  constructor(private readonly config: ConfigService) {
    this.geminiApiKey = this.config.get<string>('GEMINI_API_KEY', '');
    this.openaiApiKey = this.config.get<string>('OPENAI_API_KEY', '');
    this.primaryProvider = this.config.get<string>('AI_PRIMARY_PROVIDER', 'gemini');
    this.geminiModel = this.config.get<string>('AI_MODEL_GEMINI', 'gemini-2.0-flash');
    this.openaiModel = this.config.get<string>('AI_MODEL_OPENAI', 'gpt-4o-mini');
    this.name = this.primaryProvider;
  }

  /**
   * Generate text using the configured AI provider.
   * Falls back to secondary provider on failure.
   */
  async generateText(
    prompt: string,
    options?: AIGenerateOptions,
  ): Promise<AIResponse> {
    try {
      if (this.primaryProvider === 'gemini') {
        return await this.callGemini(prompt, options);
      } else {
        return await this.callOpenAI(prompt, options);
      }
    } catch (primaryError) {
      this.logger.warn(
        `Primary provider (${this.primaryProvider}) failed: ${(primaryError as Error).message}. Trying fallback...`,
      );

      try {
        if (this.primaryProvider === 'gemini') {
          return await this.callOpenAI(prompt, options);
        } else {
          return await this.callGemini(prompt, options);
        }
      } catch (fallbackError) {
        this.logger.error(
          `Both AI providers failed. Primary: ${(primaryError as Error).message}, Fallback: ${(fallbackError as Error).message}`,
        );
        throw new Error('All AI providers are unavailable');
      }
    }
  }

  /**
   * Generate a structured (JSON) response parsed into a typed object.
   */
  async generateStructured<T>(
    prompt: string,
    schema: any,
    options?: AIGenerateOptions,
  ): Promise<T> {
    const schemaDescription = JSON.stringify(schema, null, 2);
    const structuredPrompt = `${prompt}

You MUST respond with valid JSON that matches this schema:
${schemaDescription}

Respond with ONLY the JSON object, no markdown code fences or extra text.`;

    const response = await this.generateText(structuredPrompt, {
      ...options,
      responseFormat: 'json',
      temperature: options?.temperature ?? 0.2,
    });

    try {
      return JSON.parse(response.text) as T;
    } catch {
      this.logger.error(`Failed to parse structured response: ${response.text.substring(0, 200)}`);
      throw new Error('AI response was not valid JSON');
    }
  }

  // ─── Gemini API ──────────────────────────────────────

  private async callGemini(
    prompt: string,
    options?: AIGenerateOptions,
  ): Promise<AIResponse> {
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const model = options?.model ?? this.geminiModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`;

    const body: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2000,
      },
    };

    // Add system instruction if provided
    if (options?.systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: options.systemPrompt }],
      };
    }

    // Request JSON response format
    if (options?.responseFormat === 'json') {
      body.generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate?.content?.parts?.[0]?.text) {
      throw new Error('Gemini returned empty response');
    }

    return {
      text: candidate.content.parts[0].text,
      tokensUsed: {
        prompt: data.usageMetadata?.promptTokenCount ?? 0,
        completion: data.usageMetadata?.candidatesTokenCount ?? 0,
        total: data.usageMetadata?.totalTokenCount ?? 0,
      },
      model,
      finishReason: candidate.finishReason ?? 'unknown',
    };
  }

  // ─── OpenAI API ──────────────────────────────────────

  private async callOpenAI(
    prompt: string,
    options?: AIGenerateOptions,
  ): Promise<AIResponse> {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const model = options?.model ?? this.openaiModel;
    const messages: any[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const body: any = {
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    };

    if (options?.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (!choice?.message?.content) {
      throw new Error('OpenAI returned empty response');
    }

    return {
      text: choice.message.content,
      tokensUsed: {
        prompt: data.usage?.prompt_tokens ?? 0,
        completion: data.usage?.completion_tokens ?? 0,
        total: data.usage?.total_tokens ?? 0,
      },
      model,
      finishReason: choice.finish_reason ?? 'unknown',
    };
  }
}
