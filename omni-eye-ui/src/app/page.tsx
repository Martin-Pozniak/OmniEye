'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import NavigationMenu from "../components/NavigationMenu";
import PersonSearchForm from "@/components/PersonSearchForm";
import PersonSearchResultsList from "@/components/PersonSearchResultsList";
import { AnimatePresence, motion } from 'framer-motion';
import SystemFingerprint from '@/components/SystemFingerprint';

export default function Home() {

  const messages = [
    "Over 5 billion personal records have been leaked in public data breaches.",
    "Social media metadata can quietly reveal your location, habits, and relationships.",
    "91% of cyberattacks start with publicly accessible information.",
    "Voter registration databases are searchable in many U.S. states — by anyone.",
    "A ZIP code, birthdate, and gender is enough to identify 87% of Americans.",
    "Leaked credentials from old breaches often resurface years later on new forums.",
    "GitHub and Pastebin are common sources of accidentally exposed secrets.",
    "Many real estate transactions, court records, and business licenses are public by default.",
    "Reverse image searches and EXIF data can pinpoint where a photo was taken.",
    "Browser fingerprints can be used to track users across different websites.",
    "Data brokers aggregate thousands of data sources — and most people don’t even know they exist.",
    "Your search history and likes can predict your personality better than your friends.",
    "Online shopping receipts and newsletter emails often leak more than just purchases.",
    "Even PDFs and Word docs can contain hidden metadata like author names and edit history.",
    "Public WHOIS records can expose names, emails, and phone numbers linked to domains.",
    "Deleted social media content often persists in archives or third-party scrapers.",
    "Many unsecured cloud storage buckets still contain sensitive, publicly viewable files.",
    "Your resume may already be indexed by search engines — complete with contact info.",
    "Hackers often use LinkedIn to map organizational structures for social engineering.",
    "Old forum posts and forgotten blog comments can still be found via advanced search.",
    "The average person appears in over 400 publicly available data sources online.",
    "Facial recognition tools can identify you using nothing more than tagged photos.",
    "Data brokers may resell your profile to advertisers, insurers, or political campaigns.",
    "Most people never request data removal — even when legally entitled to do so.",
    "Once public, data spreads fast. Copies persist even after the original source is gone."
  ];
  
  // 2. State to track which message is showing
  const [current, setCurrent] = useState(0);

  // 3. Cycle every 3 seconds (3000ms)
  useEffect(() => {

      const id = setInterval(() => {

          setCurrent(() => Math.floor(Math.random() * messages.length));

      }, 15000);

      return () => clearInterval(id);

  }, [messages.length]);

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /*********************************************************************
  * Function: handleFormSubmit
  **********************************************************************/
  const handleFormSubmit = async (formData) => {

    setIsLoading(true);

    fetch('http://localhost:5000/api/search/people', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        
        console.log('Success:', data);
        setSearchResults(data.candidates);
        setIsLoading(false);

    })
    .catch(error => {
        console.error('Error:', error);
    });



  }

  return (
    <div className="h-screen flex flex-col">

      <header className="shrink-0">
        <NavigationMenu />
      </header>

      <main className="flex flex-row overflow-y-auto gap-10 p-10 bg-gray-900">

        <div className="flex flex-col items-center sm:items-start">

          <div className="flex flex-row items-center gap-2">
            <Image
              src="/logo.png"
              alt="Omni Eye Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <h1 className="text-4xl font-bold p-0 m-0">Omni Eye</h1>

          </div>

          <AnimatePresence mode="wait">
              <motion.h3
                  key={current}                                  // remount on index change
                  initial={{ opacity: 0, y: 5 }}                 // start slightly down & invisible
                  animate={{ opacity: 1, y: 0 }}                 // fade in/up
                  exit={{ opacity: 0, y: -5 }}                   // fade out/up
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className='text-gray text-lg font-semibold mt-2'
              >
                  {messages[current]}
              </motion.h3>
          </AnimatePresence>

          <SystemFingerprint />

        </div>
        
        <div className="flex flex-col flex-basis-70">

          <h2 className="text-2xl font-bold mb-4">
            Search for people across the web and find out what information is publicly available about them.
          </h2>
           {(!isLoading && searchResults.length < 1 && <PersonSearchForm onFormSubmit={handleFormSubmit} />)}

          { (isLoading || searchResults.length > 0 ) && 
            <div className="col-span-1 sm:col-span-2 w-full bg-white rounded-lg shadow-md p-4 flex-1 overflow-y-auto max-h-[80vh]">

              <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
              
              <PersonSearchResultsList isLoading={isLoading} results={searchResults} />
              
            </div>
          }

          <div className="flex flex-col">
            <p className="text-sm text-gray-500 mt-2">
              This tool is intended for use by security researchers, privacy advocates, and individuals seeking to identify and manage their publicly available personal information. Its purpose is to empower users to take back control of their digital footprint and enhance personal privacy. 
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <strong>
                Any use of this tool for malicious purposes, unauthorized surveillance, harassment, or other unethical activities is strictly prohibited and against our policy. Misuse may violate applicable laws and regulations.
              </strong>
            </p>
          </div>

        </div>

      </main>

      <footer className="shrink-0 p-4 text-center text-sm text-gray-500">
        © 2025 Omni Eye. All rights reserved.
        {/* Add a support me link to buy me a coffee */}
        <p className="mt-2">
          If you find this tool useful, consider supporting me and <a href="https://www.buymeacoffee.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">Buy Me a Coffee</a>.
        </p>
      </footer>

    </div>
  );
}
