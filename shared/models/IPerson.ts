export interface IPerson {
    firstname: string;
    lastname: string;
    age: number;
    email: string;
    phone: string;
    location: string;
    company: string;
    imageLinks: string[]; // array of image URLs
    occupation: string;
    bio: string;
    onlineProfiles: { [key: string]: string }; // key-value pairs for online profiles
}
