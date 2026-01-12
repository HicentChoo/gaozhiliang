import type { Model, SceneConfig } from '../store/toolboxStore';

/**
 * 调用千问模型的请求参数
 */
export interface QwenChatRequest {
  model: string; // 模型名称，如 qwen-plus, qwen-max, qwen-turbo
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number; // 温度参数，范围0-2
  max_tokens?: number; // 最大token数
}

/**
 * 千问模型的响应
 */
export interface QwenChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 调用千问模型API
 * @param model 模型配置
 * @param messages 消息列表
 * @param options 可选参数（temperature, max_tokens等）
 * @returns Promise<QwenChatResponse>
 */
export async function callQwenModel(
  model: Model,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
): Promise<QwenChatResponse> {
  const url = `${model.endpoint}/chat/completions`;

  const requestBody: QwenChatRequest = {
    model: model.model,
    messages,
    ...(options?.temperature !== undefined && { temperature: options.temperature }),
    ...(options?.max_tokens !== undefined && { max_tokens: options.max_tokens }),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${model.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `API调用失败: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }

  return response.json();
}

/**
 * 使用场景配置调用千问模型
 * @param model 模型配置
 * @param sceneConfig 场景配置
 * @param userMessage 用户消息
 * @param variables 提示词中的变量替换（可选）
 * @returns Promise<QwenChatResponse>
 */
export async function callQwenWithSceneConfig(
  model: Model,
  sceneConfig: SceneConfig,
  userMessage: string,
  variables?: Record<string, string>
): Promise<QwenChatResponse> {
  // 构建消息列表
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // 添加系统提示词（如果有）
  if (sceneConfig.systemPrompt) {
    messages.push({
      role: 'system',
      content: sceneConfig.systemPrompt,
    });
  }

  // 处理基模提示词，替换变量
  let prompt = sceneConfig.prompt;
  
  // 首先替换传入的变量
  if (variables) {
    Object.keys(variables).forEach((key) => {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), variables[key]);
    });
  }
  
  // 如果没有通过variables传入userInput或user_message，则使用userMessage参数
  // 支持多种占位符格式：{userInput}, {user_message}, {userMessage}
  if (!prompt.includes('{userInput}') && !prompt.includes('{user_message}') && !prompt.includes('{userMessage}')) {
    // 如果提示词中没有用户输入占位符，直接将用户消息追加到提示词后面
    prompt = `${prompt}\n\n${userMessage}`;
  } else {
    // 替换用户输入占位符
    prompt = prompt
      .replace(/\{userInput\}/g, userMessage)
      .replace(/\{user_message\}/g, userMessage)
      .replace(/\{userMessage\}/g, userMessage);
  }

  // 添加用户消息
  messages.push({
    role: 'user',
    content: prompt,
  });

  // 调用API
  return callQwenModel(model, messages, {
    temperature: sceneConfig.temperature,
    max_tokens: sceneConfig.maxTokens,
  });
}

/**
 * 测试模型连接
 * @param model 模型配置
 * @returns Promise<boolean> 是否连接成功
 */
export async function testModelConnection(model: Model): Promise<boolean> {
  try {
    await callQwenModel(
      model,
      [{ role: 'user', content: '你好' }],
      { max_tokens: 10 }
    );
    return true;
  } catch (error) {
    console.error('模型连接测试失败:', error);
    return false;
  }
}







