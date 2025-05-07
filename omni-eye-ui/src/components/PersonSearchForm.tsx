// A search form component for searching people
// It will need to optionally accept the persons first/last name, DOB or Age, Location, Occupation. Only the first name or last name is required.
'use client';

import { useState } from 'react';


interface PersonSearchFormProps {
    onFormSubmit: (formValues: {
        firstName: string;
        lastName: string;
        dob?: string;
        age?: number;
        occupation?: string;
        email: string;
        usernames: string[];
        location: string;
    }) => void;
  }

export default function PersonSearchForm({ onFormSubmit }: PersonSearchFormProps) {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [age, setAge] = useState<number | undefined>(undefined);
    const [occupation, setOccupation] = useState('');
    const [email, setEmail] = useState('');
    const [usernames, setUsername] = useState([]);
    const [location, setLocation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFormSubmit({ firstName, lastName, dob, age, occupation, email, usernames, location });
    };

    return (
        <form className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md w-full" onSubmit={handleSubmit}>

            <div className="flex flex-col gap-2">

                <div className="flex flex-row gap-4 overflow-auto">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="first-name" className="text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="first-name"
                            name="first-name"
                            className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label htmlFor="last-name" className="text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="last-name"
                            name="last-name"
                            className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="middle-name" className="text-sm font-medium text-gray-700">
                            Middle Name (optional)
                        </label>
                        <input
                            type="text"
                            id="middle-name"
                            name="middle-name"
                            className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter middle name"
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                        />
                    </div>
                </div>

            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email (optional)
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="usernames" className="text-sm font-medium text-gray-700">
                    Usernames (optional)
                </label>
                <input
                    type="text"
                    id="usernames"
                    name="usernames"
                    className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter usernames (comma separated)"
                    value={usernames.join(', ')}
                    onChange={(e) => setUsername(e.target.value.split(',').map((username) => username.trim()))}
                />
            </div>

            <div className="flex flex-row gap-4">
                <div className="flex flex-col gap-2 w-1/2">
                    <label htmlFor="dob" className="text-sm font-medium text-gray-700">
                        Date of Birth (optional)
                    </label>
                    <input
                        type="date"
                        id="dob"
                        name="dob"
                        className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                    <label htmlFor="age" className="text-sm font-medium text-gray-700">
                        Age (optional)
                    </label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        min={0}
                        className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter age in years"
                        value={age || ''}
                        onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="occupation" className="text-sm font-medium text-gray-700">
                    Occupation (optional)
                </label>
                <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    className="p-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className="p-2 bg-red-900 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                disabled={!firstName && !lastName}
            >
                Search
            </button>
        </form>
    );
}
