/**
 * Chat Service
 * 
 * Provides data access methods for chat-related operations.
 * Handles chat thread and message management with real-time subscriptions.
 * 
 * @see Requirements 4.1, 4.3, 4.4, 5.1, 5.2, 5.5, 5.6
 */

import { supabase } from '../lib/supabase';
import { DatabaseError } from '../utils/errors';
import { dbChatThreadToChatThread, dbChatMessageToChatMessage } from '../utils/transformers';
import type { ChatThread, ChatMessage } from '../types/models';
import type { DbChatThreadInsert, DbChatMessageInsert } from '../types/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Chat service interface defining all chat-related operations
 */
export interface ChatService {
  getChatThreads(userId: string): Promise<ChatThread[]>;
  getChatThread(threadId: string): Promise<ChatThread | null>;
  createChatThread(userId: string, ngoId: string): Promise<ChatThread>;
  getMessages(threadId: string): Promise<ChatMessage[]>;
  sendMessage(threadId: string, senderId: string, senderType: 'user' | 'ngo', content: string): Promise<ChatMessage>;
  subscribeToMessages(threadId: string, callback: (message: ChatMessage) => void): () => void;
}

/**
 * Get all chat threads for a user
 * Includes user and NGO participant data
 * 
 * @param userId - User ID to get threads for
 * @returns Array of chat thread objects with participant data
 * @throws DatabaseError on database operation failure
 */
export async function getChatThreads(userId: string): Promise<ChatThread[]> {
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        id,
        participant_user_id,
        participant_ngo_id,
        created_at,
        updated_at,
        user:users!chat_threads_participant_user_id_fkey(id, email, display_name, trust_points, verification_status, created_at, updated_at),
        ngo:ngos!chat_threads_participant_ngo_id_fkey(id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at)
      `)
      .eq('participant_user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to chat threads',
          'permission_denied',
          { operation: 'getChatThreads', userId, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch chat threads',
        'network_error',
        { operation: 'getChatThreads', userId, error }
      );
    }

    return data.map(dbChatThreadToChatThread);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching chat threads',
      'network_error',
      { operation: 'getChatThreads', userId, error }
    );
  }
}

/**
 * Get a specific chat thread by ID
 * Includes user and NGO participant data
 * 
 * @param threadId - Thread ID to retrieve
 * @returns Chat thread object with participant data or null if not found
 * @throws DatabaseError on database operation failure
 */
export async function getChatThread(threadId: string): Promise<ChatThread | null> {
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        id,
        participant_user_id,
        participant_ngo_id,
        created_at,
        updated_at,
        user:users!chat_threads_participant_user_id_fkey(id, email, display_name, trust_points, verification_status, created_at, updated_at),
        ngo:ngos!chat_threads_participant_ngo_id_fkey(id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at)
      `)
      .eq('id', threadId)
      .single();

    if (error) {
      // PGRST116 is the "not found" error code from PostgREST
      if (error.code === 'PGRST116') {
        return null;
      }

      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to chat thread',
          'permission_denied',
          { operation: 'getChatThread', threadId, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch chat thread',
        'network_error',
        { operation: 'getChatThread', threadId, error }
      );
    }

    return dbChatThreadToChatThread(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching chat thread',
      'network_error',
      { operation: 'getChatThread', threadId, error }
    );
  }
}

/**
 * Create a new chat thread between a user and an NGO
 * 
 * @param userId - User participant ID
 * @param ngoId - NGO participant ID
 * @returns Created chat thread object
 * @throws DatabaseError on database operation failure
 */
export async function createChatThread(userId: string, ngoId: string): Promise<ChatThread> {
  try {
    const dbThread: DbChatThreadInsert = {
      participant_user_id: userId,
      participant_ngo_id: ngoId,
    };

    const { data, error } = await supabase
      .from('chat_threads')
      .insert(dbThread)
      .select(`
        id,
        participant_user_id,
        participant_ngo_id,
        created_at,
        updated_at,
        user:users!chat_threads_participant_user_id_fkey(id, email, display_name, trust_points, verification_status, created_at, updated_at),
        ngo:ngos!chat_threads_participant_ngo_id_fkey(id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at)
      `)
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to create chat thread',
          'permission_denied',
          { operation: 'createChatThread', userId, ngoId, error }
        );
      }

      // Check for unique constraint violations (duplicate thread)
      if (error.code === '23505') {
        throw new DatabaseError(
          'A chat thread between this user and NGO already exists',
          'constraint_violation',
          { operation: 'createChatThread', userId, ngoId, error }
        );
      }

      // Check for foreign key violations
      if (error.code === '23503') {
        throw new DatabaseError(
          'Invalid user or NGO ID',
          'constraint_violation',
          { operation: 'createChatThread', userId, ngoId, error }
        );
      }

      throw new DatabaseError(
        'Failed to create chat thread',
        'network_error',
        { operation: 'createChatThread', userId, ngoId, error }
      );
    }

    return dbChatThreadToChatThread(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while creating chat thread',
      'network_error',
      { operation: 'createChatThread', userId, ngoId, error }
    );
  }
}

/**
 * Get all messages in a chat thread
 * 
 * @param threadId - Thread ID to get messages for
 * @returns Array of chat message objects ordered by creation time
 * @throws DatabaseError on database operation failure
 */
export async function getMessages(threadId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, thread_id, sender_type, sender_id, message_content, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to chat messages',
          'permission_denied',
          { operation: 'getMessages', threadId, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch chat messages',
        'network_error',
        { operation: 'getMessages', threadId, error }
      );
    }

    return data.map(dbChatMessageToChatMessage);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching chat messages',
      'network_error',
      { operation: 'getMessages', threadId, error }
    );
  }
}

/**
 * Send a message in a chat thread
 * 
 * @param threadId - Thread ID to send message in
 * @param senderId - ID of the sender (user or NGO)
 * @param senderType - Type of sender ('user' or 'ngo')
 * @param content - Message content
 * @returns Created chat message object
 * @throws DatabaseError on database operation failure
 */
export async function sendMessage(
  threadId: string,
  senderId: string,
  senderType: 'user' | 'ngo',
  content: string
): Promise<ChatMessage> {
  try {
    const dbMessage: DbChatMessageInsert = {
      thread_id: threadId,
      sender_id: senderId,
      sender_type: senderType,
      message_content: content,
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(dbMessage)
      .select('id, thread_id, sender_type, sender_id, message_content, created_at')
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to send message',
          'permission_denied',
          { operation: 'sendMessage', threadId, senderId, senderType, error }
        );
      }

      // Check for foreign key violations
      if (error.code === '23503') {
        throw new DatabaseError(
          'Invalid thread ID',
          'constraint_violation',
          { operation: 'sendMessage', threadId, senderId, senderType, error }
        );
      }

      throw new DatabaseError(
        'Failed to send message',
        'network_error',
        { operation: 'sendMessage', threadId, senderId, senderType, error }
      );
    }

    return dbChatMessageToChatMessage(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while sending message',
      'network_error',
      { operation: 'sendMessage', threadId, senderId, senderType, error }
    );
  }
}

/**
 * Subscribe to real-time message updates for a chat thread
 * 
 * Sets up a Supabase real-time subscription that listens for new messages
 * in the specified thread. The callback is invoked whenever a new message
 * is inserted.
 * 
 * @param threadId - Thread ID to subscribe to
 * @param callback - Function to call when a new message is received
 * @returns Unsubscribe function to clean up the subscription
 * 
 * @example
 * const unsubscribe = subscribeToMessages(threadId, (message) => {
 *   console.log('New message:', message);
 * });
 * 
 * // Later, clean up the subscription
 * unsubscribe();
 */
export function subscribeToMessages(
  threadId: string,
  callback: (message: ChatMessage) => void
): () => void {
  let channel: RealtimeChannel | null = null;

  try {
    // Create a unique channel name for this subscription
    const channelName = `chat_messages:thread_${threadId}`;

    // Set up the real-time subscription
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          try {
            // Transform the database record to application format
            const message = dbChatMessageToChatMessage(payload.new as any);
            callback(message);
          } catch (error) {
            console.error('Error processing real-time message:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to messages for thread ${threadId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error:', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('Subscription timed out, will retry...');
        } else if (status === 'CLOSED') {
          console.log('Subscription closed');
        }
      });

    // Return unsubscribe function
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  } catch (error) {
    console.error('Failed to set up message subscription:', error);
    
    // Return a no-op unsubscribe function if setup fails
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }
}

// Export as default service object
export const chatService: ChatService = {
  getChatThreads,
  getChatThread,
  createChatThread,
  getMessages,
  sendMessage,
  subscribeToMessages,
};
