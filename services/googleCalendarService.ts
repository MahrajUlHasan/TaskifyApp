import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Task } from '../types';

/**
 * Google Calendar Service
 * Syncs tasks with Google Calendar using Google Sign-In access token
 */
class GoogleCalendarService {
  private readonly CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
  private readonly CALENDAR_ID = 'primary'; // User's primary calendar

  /**
   * Get the current access token from Google Sign-In
   */
  private async getAccessToken(): Promise<string> {
    try {
      const tokens = await GoogleSignin.getTokens();
      return tokens.accessToken;
    } catch (error) {
      console.error('GoogleCalendarService: Failed to get access token:', error);
      throw new Error('Not authenticated with Google');
    }
  }

  /**
   * Check if user is signed in with Google
   */
  async isSignedIn(): Promise<boolean> {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert task to Google Calendar event format
   */
  private taskToCalendarEvent(task: Task) {
    const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      summary: task.title,
      description: `${task.description}\n\nPriority: ${task.priority}\nStatus: ${task.status}\nQuadrant: ${task.eisenhowerQuadrant}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
      colorId: this.getColorIdForPriority(task.priority),
      extendedProperties: {
        private: {
          taskifyTaskId: task.id,
          taskifyPriority: task.priority,
          taskifyStatus: task.status,
          taskifyQuadrant: task.eisenhowerQuadrant,
        },
      },
    };
  }

  /**
   * Get Google Calendar color ID based on task priority
   */
  private getColorIdForPriority(priority: string): string {
    const colorMap: Record<string, string> = {
      URGENT: '11', // Red
      HIGH: '6',    // Orange
      MEDIUM: '5',  // Yellow
      LOW: '2',     // Green
    };
    return colorMap[priority] || '9'; // Default blue
  }

  /**
   * Create a calendar event for a task
   */
  async createCalendarEvent(task: Task): Promise<string | null> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        console.log('GoogleCalendarService: User not signed in with Google, skipping calendar sync');
        return null;
      }

      const accessToken = await this.getAccessToken();
      const event = this.taskToCalendarEvent(task);

      const response = await fetch(
        `${this.CALENDAR_API_BASE}/calendars/${this.CALENDAR_ID}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GoogleCalendarService: Failed to create event:', errorData);
        throw new Error(`Failed to create calendar event: ${response.status}`);
      }

      const createdEvent = await response.json();
      console.log('GoogleCalendarService: Event created successfully:', createdEvent.id);
      return createdEvent.id;
    } catch (error) {
      console.error('GoogleCalendarService: Error creating calendar event:', error);
      // Don't throw - we don't want to fail task creation if calendar sync fails
      return null;
    }
  }

  /**
   * Update a calendar event for a task
   */
  async updateCalendarEvent(task: Task, calendarEventId: string): Promise<boolean> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        console.log('GoogleCalendarService: User not signed in with Google, skipping calendar sync');
        return false;
      }

      const accessToken = await this.getAccessToken();
      const event = this.taskToCalendarEvent(task);

      const response = await fetch(
        `${this.CALENDAR_API_BASE}/calendars/${this.CALENDAR_ID}/events/${calendarEventId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GoogleCalendarService: Failed to update event:', errorData);
        throw new Error(`Failed to update calendar event: ${response.status}`);
      }

      console.log('GoogleCalendarService: Event updated successfully');
      return true;
    } catch (error) {
      console.error('GoogleCalendarService: Error updating calendar event:', error);
      return false;
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(calendarEventId: string): Promise<boolean> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        console.log('GoogleCalendarService: User not signed in with Google, skipping calendar sync');
        return false;
      }

      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.CALENDAR_API_BASE}/calendars/${this.CALENDAR_ID}/events/${calendarEventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        // 404 is OK - event already deleted
        const errorData = await response.text();
        console.error('GoogleCalendarService: Failed to delete event:', errorData);
        throw new Error(`Failed to delete calendar event: ${response.status}`);
      }

      console.log('GoogleCalendarService: Event deleted successfully');
      return true;
    } catch (error) {
      console.error('GoogleCalendarService: Error deleting calendar event:', error);
      return false;
    }
  }

  /**
   * Find calendar event by task ID
   */
  async findEventByTaskId(taskId: string): Promise<string | null> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return null;
      }

      const accessToken = await this.getAccessToken();

      // Search for events with the task ID in extended properties
      const response = await fetch(
        `${this.CALENDAR_API_BASE}/calendars/${this.CALENDAR_ID}/events?privateExtendedProperty=taskifyTaskId=${taskId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('GoogleCalendarService: Failed to search events');
        return null;
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }

      return null;
    } catch (error) {
      console.error('GoogleCalendarService: Error finding event:', error);
      return null;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();

