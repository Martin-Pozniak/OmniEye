export interface IOnlinePlatform {
    name: string; // Name of the online platform (e.g., "LinkedIn", "Twitter", etc.)
    url: string; // URL to the user's profile on that platform
    username: string; // Username or handle on that platform
    profilePictureUrl?: string; // Optional URL to the profile picture on that platform
}