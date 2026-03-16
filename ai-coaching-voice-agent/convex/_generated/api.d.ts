/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as DiscussionRoom from "../DiscussionRoom.js";
import type * as achievements from "../achievements.js";
import type * as aptitude from "../aptitude.js";
import type * as auth from "../auth.js";
import type * as communityTests from "../communityTests.js";
import type * as messages from "../messages.js";
import type * as mockInterviews from "../mockInterviews.js";
import type * as seed from "../seed.js";
import type * as seed_achievements_data from "../seed_achievements_data.js";
import type * as sessionControls from "../sessionControls.js";
import type * as sessions from "../sessions.js";
import type * as social from "../social.js";
import type * as spacedRepetition from "../spacedRepetition.js";
import type * as teamSessions from "../teamSessions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  DiscussionRoom: typeof DiscussionRoom;
  achievements: typeof achievements;
  aptitude: typeof aptitude;
  auth: typeof auth;
  communityTests: typeof communityTests;
  messages: typeof messages;
  mockInterviews: typeof mockInterviews;
  seed: typeof seed;
  seed_achievements_data: typeof seed_achievements_data;
  sessionControls: typeof sessionControls;
  sessions: typeof sessions;
  social: typeof social;
  spacedRepetition: typeof spacedRepetition;
  teamSessions: typeof teamSessions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
