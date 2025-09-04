import { useState, useEffect } from 'react';
import { PuffLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';

type Profile = {
    username: string;
    platformName: string;
    platformURL: string;
};

type Person = {
    id: string | number;
    firstName: string;
    lastName: string;
    bio?: string;
    location?: string;
    age?: number | string;
    occupation?: string;
    privacyRank?: string | number;
    imageLinks?: string[];
    profiles: Profile[];
};

type PersonSearchResultsListProps = {
    results: Person[];
    isLoading: boolean;
};

export default function PersonSearchResultsList({ results, isLoading }: PersonSearchResultsListProps) { 

    const messages: string[] = [
        // Original OSINT-flavored lines
        "Querying public records and hidden databases…",
        "Harvesting digital breadcrumbs across the web…",
        "Triangulating geo-data and social footprints…",
        "Decrypting metadata from open-source archives…",
        "Interrogating social graphs for hidden links…",
        "Correlating past sightings and leak logs…",
        "Compiling your dossier from scattered intel…",
        "Verifying identity through cross-referenced sources…",
        "Mapping network nodes and digital footprints…",
        "Harvesting WHOIS and DNS records…",
        "Retracing API call trails to locate endpoints…",
        "Extracting public posts from shadowy forums…",
        "Parsing open-source repositories for credential leaks…",
        "Synchronizing with reconnaissance modules…",
        "Cross-referencing leaked databases for matches…",
        "Scanning code repositories for user contributions…",
        "Analyzing image metadata for geo-clues…",
        "Reconciling timestamps across multiple sources…",
        "Ingesting RSS feeds for hidden mentions…",
        "Mining blockchain transactions for activity patterns…",
        "Profiling email headers for routing anomalies…",
        "Decoding telephony lookup entries…",
        "Syncing with global surveillance nodes…",
        "Validating alias mappings in darknet mirrors…",
        "Fingerprinting browser user agents…",
        "Surveying job boards for professional history…",
        "Correlating IP logs for behavioral analysis…",
        "Updating your threat intelligence report…"
      ];

    // 2. State to track which message is showing
    const [current, setCurrent] = useState(0);

    // 3. Cycle every 3 seconds (3000ms)
    useEffect(() => {

        const id = setInterval(() => {

            setCurrent(() => Math.floor(Math.random() * messages.length));

        }, 3000);

        return () => clearInterval(id);

    }, [messages.length]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">

                <div className="flex flex-row gap-5 justify-center items-center">

                    <PuffLoader color="#3B82F6" loading={isLoading} size={50} />

                    <AnimatePresence mode="wait">
                        <motion.p
                            key={current}                                  // remount on index change
                            initial={{ opacity: 0, y: 5 }}                 // start slightly down & invisible
                            animate={{ opacity: 1, y: 0 }}                 // fade in/up
                            exit={{ opacity: 0, y: -5 }}                   // fade out/up
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className='text-black'
                        >
                            {messages[current]}
                        </motion.p>
                    </AnimatePresence>

                </div>

            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

            {results.map((person, index) => (

                <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">

                    <div className="flex items-center gap-4">
                        <img 
                            src={person.imageLinks && person.imageLinks[0] ? person.imageLinks[0] : "https://via.placeholder.com/150"} 
                            alt={`${person.firstName} ${person.lastName}`} 
                            className="w-16 h-16 rounded-full object-cover border border-gray-300"
                        />

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{person.firstName} {person.lastName}</h3>
                            <h2 className="text-black">Privacy Rank: </h2>
                            <div className="flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xl rounded-full w-12 h-12">
                                
                                {person.privacyRank || "N/A"}
                            </div>
                        </div>
                        
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <div className="flex gap-2">
                            {person.imageLinks && person.imageLinks.length > 0 ? (
                                person.imageLinks.map((image, idx) => (
                                    <img
                                        key={idx}
                                        src={image}
                                        alt={`Additional image ${idx + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No additional images available.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 space-y-1">
                        <p className="text-sm text-gray-700 mt-2">Bio: {person.bio}</p>
                        <p className="text-sm text-gray-700">Location: {person.location}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Age:</span> {person.age}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Occupation:</span> {person.occupation}</p>
                    </div>

                    <h4 className="text-md font-semibold mt-2 text-gray-900">Online Profiles: {person.profiles.length}</h4>
                    <ul className="space-y-4 text-sm text-gray-600 max-h-[250px] overflow-y-auto border-1 border-gray-300 rounded-lg p-2">
                        {person.profiles
                            .sort((a, b) => {
                                if (a.username.toLowerCase() === b.username.toLowerCase()) {
                                    try {
                                        return a.platformName.toLowerCase().localeCompare(b.platformName.toLowerCase());
                                    }
                                    catch (error) {
                                        console.error("Error comparing platform names:", error);
                                        return 0; // Fallback to no sorting if an error occurs
                                    }
                                }
                                return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
                            })
                            .map((profile, index) => (
                                <li key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <a href={profile.platformURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">
                                        {profile.username} - {profile.platformName}
                                    </a>
                                    <p className="text-xs text-gray-500 mt-1">{profile.platformURL}</p>
                                </li>
                            ))}
                    </ul>

                    <a 
                        href={`/profile/${person.id}`} 
                        className="mt-4 inline-block bg-red-900 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-300 text-center"
                    >
                        View Full Profile
                    </a>

                </div>

            ))}

            {/* If no results output no results */}
            {results.length === 0 && (
                <div className="col-span-1 sm:col-span-2 text-center p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No results found.</p>
                </div>
            )}

        </div>
    );

}