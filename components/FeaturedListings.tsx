"use client";

import { Box, SimpleGrid, Heading } from "@chakra-ui/react";
import AIMCard from "./AIMCard";

// Mock data for featured listings
const mockListings = [
  {
    id: "1",
    title: "Natural Language Processing Model",
    description:
      "Advanced NLP model for text analysis and sentiment detection. Compatible with HyperAppliance.",
    price: 0.05,
    currency: "ETH",
    chain: "ethereum",
    seller: "0x1a2b3c...",
    image: "/placeholder-1.jpg",
  },
  {
    id: "2",
    title: "Computer Vision Module",
    description:
      "Object detection and image recognition for security applications.",
    price: 100,
    currency: "ADA",
    chain: "cardano",
    seller: "addr1q9ja...",
    image: "/placeholder-2.jpg",
  },
  {
    id: "3",
    title: "Time Series Prediction Engine",
    description:
      "Forecasting module for financial data and market trends with high accuracy.",
    price: 0.01,
    currency: "ETH",
    chain: "polygon",
    seller: "0x4d5e6f...",
    image: "/placeholder-3.jpg",
  },
  {
    id: "4",
    title: "Speech Recognition System",
    description:
      "Multilingual speech-to-text conversion with noise cancellation.",
    price: 0.03,
    currency: "ETH",
    chain: "base",
    seller: "0x7g8h9i...",
    image: "/placeholder-4.jpg",
  },
];

export default function FeaturedListings() {
  return (
    <Box>
      <Heading as="h3" size="lg" mb={8} textAlign="center">
        Featured AI Modules
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {mockListings.map((listing) => (
          <AIMCard
            key={listing.id}
            id={listing.id}
            name={listing.title}
            description={listing.description}
            image={listing.image}
            developer={{ id: listing.chain, name: listing.seller }}
            price={listing.price.toString()}
            currency={listing.currency}
            category="AI Module" // or listing.category if available
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
