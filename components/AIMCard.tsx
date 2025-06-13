'use client';

import { Box, Image, Badge, Text, Stack, Heading, Button, HStack, Icon, useColorMode, Flex, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { ExternalLink, Cpu, Heart, FileCode, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Type for AIM listing
interface AIMCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  developer: {
    id: string;
    name: string;
  } | null | undefined;
  price: string;
  currency: string;
  requiredSpecs?: {
    gpu?: string;
    ram?: string;
    cpu?: string;
  };
  category?: string;
}

export default function AIMCard({ 
  id, 
  name, 
  description, 
  image, 
  developer = null, 
  price, 
  currency,
  requiredSpecs = {},
  category
}: AIMCardProps) {
  const { colorMode } = useColorMode();
  const [isLiked, setIsLiked] = useState(false);
  const bg = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';
  
  // Chain badge color mapping
  const chainColors: Record<string, string> = {
    'ethereum': 'purple',
    'polygon': 'blue',
    'cardano': 'green',
    'base': 'orange'
  };

  // Get the chain badge color, default to gray if not found or if developer is undefined
  const chainColor = developer?.id ? (chainColors[developer.id] || 'gray') : 'gray';

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <LinkBox as="article">
      <Box 
        maxW="320px" 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        borderColor={borderColor}
        bg={bg}
        transition="all 0.2s"
        _hover={{ 
          transform: 'translateY(-4px)', 
          shadow: 'lg',
          borderColor: 'blue.400'
        }}
      >
        <Image 
          src={image || `/placeholders/aim-${(parseInt(id, 10) % 5) + 1}.jpg`} 
          alt={name}
          height="180px"
          width="100%"
          objectFit="cover"
          fallback={
            <Flex 
              height="180px"
              width="100%"
              bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
              alignItems="center"
              justifyContent="center"
            >
              <Cpu size={32} />
            </Flex>
          }
        />

        <Box p="5">
          <Flex justify="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="baseline">
              <Badge borderRadius="full" px="2" colorScheme="blue">
                New
              </Badge>
              {category && (
                <Badge borderRadius="full" px="2" colorScheme="green" ml={2}>
                  {category}
                </Badge>
              )}
            </Box>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLike} 
              aria-label="Like"
              color={isLiked ? "red.500" : "gray.500"}
            >
              <Heart fill={isLiked ? "currentColor" : "none"} size={18} />
            </Button>
          </Flex>

          <LinkOverlay as={Link} href={`/marketplace/${id}`}>
            <Text fontWeight="bold" fontSize="xl" mb={1} noOfLines={1}>
              {name}
            </Text>
          </LinkOverlay>

          <Text fontSize="sm" color="gray.500" mb={2}>
            By {developer?.name || 'Unknown Developer'}
          </Text>

          <Text noOfLines={2} mb={4} fontSize="sm">
            {description}
          </Text>

          <Flex justifyContent="space-between" alignItems="center">
            <Flex direction="column" gap={1}>
              {requiredSpecs?.gpu && (
                <Flex alignItems="center">
                  <Cpu size={14} />
                  <Text fontSize="xs" ml={1}>{requiredSpecs.gpu}</Text>
                </Flex>
              )}
              {requiredSpecs?.ram && (
                <Flex alignItems="center">
                  <FileCode size={14} />
                  <Text fontSize="xs" ml={1}>{requiredSpecs.ram} RAM</Text>
                </Flex>
              )}
            </Flex>
            
            <Flex alignItems="center" justifyContent="flex-end">
              <DollarSign size={14} />
              <Text fontWeight="bold" fontSize="md">
                {price} {currency}
              </Text>
            </Flex>
          </Flex>

          <Flex mt={4} gap={2}>
            <Button colorScheme="blue" size="sm" width="full">
              View Details
            </Button>
            <Button colorScheme="green" size="sm" width="full">
              Deploy
            </Button>
          </Flex>
        </Box>
      </Box>
    </LinkBox>
  );
} 