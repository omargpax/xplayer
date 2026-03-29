"use client" // Needed for useState

import Image from "next/image"
import { useState, type FC } from "react"
import LegalModal from "./LegalModal"
import CreditsModal from "./CreditsModal" // Import the new component

const Footer: FC = () => {
    // Separate states for both modals
    const [isLegalOpen, setIsLegalOpen] = useState(false)
    const [isCreditsOpen, setIsCreditsOpen] = useState(false)

    return (
        <>
            <footer className="fixed bottom-0 left-0 right-0 py-6 text-center text-white z-40 pointer-events-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-x-12 bg-gradient-to-t from-black/50 to-transparent">
                
                {/* Legal Button */}
                <button
                    onClick={() => setIsLegalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors cursor-pointer border-none bg-transparent"
                >
                    <span>Terms and Policies</span>
                </button>

                {/* Credits Button */}
                <button
                    onClick={() => setIsCreditsOpen(true)}
                    className="inline-flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors cursor-pointer border-none bg-transparent"
                >
                    <span>Credits</span>
                </button>

                {/* Developer Badge */}
                <a
                    href="https://omargpax.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
                >
                    <span>Developed by</span>
                    <Image
                        alt="omargpax"
                        src="https://creator-badge.vercel.app/start.png"
                        width={20}
                        height={20}
                        className="rounded-full"
                    />
                </a>
            </footer>

            {/* Rendering both modals based on their independent states */}
            <LegalModal 
                isOpen={isLegalOpen} 
                onClose={() => setIsLegalOpen(false)} 
            />
            
            <CreditsModal 
                isOpen={isCreditsOpen} 
                onClose={() => setIsCreditsOpen(false)} 
            />
        </>
    )
}

export default Footer
